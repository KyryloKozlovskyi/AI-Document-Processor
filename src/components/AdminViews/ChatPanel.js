import React, { useState } from 'react';
import './ChatPanel.css'; // Import panel-specific CSS file.
import axios from 'axios'; // Import axios for API calls.
import { useContext } from 'react'; // Import useContext for context API.


const ChatPanel = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false); // Active status.
    const [analyzingDocument, setAnalyzingDocument] = useState(false); // Document analysis status.
    const [analysisData, setAnalysisData] = useState(null); // Analysis data.
    const [error, setError] = useState(null); // Error handling.

    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    const queryChatbot = async (query) => {
        try {
          // setAnalyzingDocument(true);
          const token = localStorage.getItem("token");
          const response = await axios.get(`http://localhost:5000/query/${query}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
            console.log("Chatbot response:", response.data);
    
          setAnalysisData(response.data);
          // setAnalyzingDocument(false);
    
        } catch (err) {
          console.error("Error with chatbot:", err);
          setError(
            "Failed to analyze document: " +
            (err.response?.data?.message || err.message)
          );
          // setAnalyzingDocument(false);
        }
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted");
        const query = document.getElementById('userInput').value;
        // const submissionSelect = document.getElementById('submissionSelect').value;

        if (query) {
            // Call the analyzeDocument function with the selected submission ID.
            await queryChatbot(query);
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
                    <button type="submit" className="btn btn-primary">Send</button>

                    <div className="form-group mt-3">
                        <label htmlFor="submissionSelect">Select Submission:</label>
                        <select id="submissionSelect" className="form-control">
                            <option value="">Select a submission</option>
                        </select>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;