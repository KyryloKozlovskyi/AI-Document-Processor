import React, { useState, useEffect } from 'react';
import './ChatPanel.css'; // Import panel-specific CSS file.
import axios from 'axios'; // Import axios for API calls.
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown for rendering markdown.


const ChatPanel = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false); // Active status.
  const [thinking, setThinking] = useState(false); // Document analysis status.
  const [error, setError] = useState(null); // Error handling.
  const [chatResponse, setChatResponse] = useState(null); // Chatbot response.
  const [submissionIds, setSubmissionIds] = useState([]); // List of submission IDs

  // Fetch submission IDs when component mounts
  useEffect(() => {
    const fetchSubmissionIds = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/submissions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Extract IDs from submissions
        const ids = response.data.map(submission => ({
          id: submission._id,
          name: submission.name || 'Unnamed submission',
          fileName: submission.file?.name || 'No file'
        }));
        setSubmissionIds(ids.filter(submission => submission.fileName !== 'No file'));
      } catch (error) {
        console.error('Error fetching submission IDs:', error);
      }
    };

    fetchSubmissionIds();
  }, []);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const queryChatbot = async (query, submissionId) => {
    try {
      setThinking(true);
      const token = localStorage.getItem("token");
      
      // Fix: Use proper URL structure with query parameters
      // The query should be properly encoded to handle special characters
      const encodedQuery = encodeURIComponent(query);
      
      // Build URL with query params properly
      let url = `http://localhost:5000/query/${encodedQuery}`;
      
      console.log("Sending request to:", url);
      console.log("With submission ID:", submissionId || "none");
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: submissionId ? { submissionId } : {} // Add submissionId as query parameter
      });
      
      console.log("Chatbot response:", response.data);
      setChatResponse(response.data);
      setThinking(false);
    } catch (err) {
      console.error("Error with chatbot:", err);
      setError(
        "Failed to analyze document: " +
        (err.response?.data?.message || err.message)
      );
      setThinking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    const query = document.getElementById('userInput').value;
    const submissionId = document.getElementById('submissionSelect')?.value;

    if (query) {
      // Add selected submission ID to the query if available
      const queryWithContext = submissionId 
        ? `Regarding submission ${submissionId}: ${query}`
        : query;
        
      await queryChatbot(queryWithContext, submissionId);
    } else {
      alert("Please enter a question.");
    }
  }

  return (
    <div className="chat-panel-container">
      {/* Change className for CSS styling. */}
      <button className={`toggle-button ${isPanelOpen ? 'open' : ''}`} onClick={togglePanel}>
        {isPanelOpen ? 'Close Panel' : 'Open Panel'}
      </button>
      <div className={`side-panel ${isPanelOpen ? 'open' : ''}`}>
        <h2>Chatbot</h2>
        <p>What can I help you with?</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" id="userInput" className="form-control" placeholder="Type your question here..." />
          </div>
          
          {/* Add dropdown for submissions */}
          <div className="form-group mt-3">
            <label htmlFor="submissionSelect">Select Submission:</label>
            <select id="submissionSelect" className="form-control">
              <option value="">Select a submission</option>
              {submissionIds.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.fileName}
                </option>
              ))}
            </select>
          </div>
          
          <label>Upload PDF:</label>
          <input type="file" accept=".pdf" className="form-control" />
          <button type="submit" className="btn btn-primary">Send</button>

          <div className="form-group mt-3">
          </div>

          {/* Response display */}
          {thinking && <p>Thinking...</p>}
          {error && <p className="error-message">{error}</p>}
          {chatResponse && (
            <div className="response-container">
              {/* Fix: Properly render the response object */}
              {!thinking && typeof chatResponse === 'object' ? (
                <div>
                  <p><strong>{chatResponse.query}</strong></p>
                  <ReactMarkdown>{chatResponse.response}</ReactMarkdown>
                </div>
              ) : null}
            </div>
          )}
        </form>
      </div >
    </div >
  );
};

export default ChatPanel;