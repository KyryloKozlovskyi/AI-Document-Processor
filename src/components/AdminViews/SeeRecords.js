import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Table,
  Badge,
  Button,
  Form,
  Modal,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import ChatPanel from "./ChatPanel";
import "./styles/SeeRecords.css"; // Import the updated CSS file

const SeeRecords = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("date");
  const [events, setEvents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analyzingDocument, setAnalyzingDocument] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const tableContainerRef = useRef(null);

  // Handle mouse down event to start dragging
  const handleMouseDown = (e) => {
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeft(tableContainerRef.current.scrollLeft);
    tableContainerRef.current.style.cursor = "grabbing";
  };

  // Handle mouse move event for dragging
  const handleMouseMove = (e) => {
    if (!isDragging || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    tableContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Handle mouse events to end dragging
  const handleMouseUpOrLeave = () => {
    if (!tableContainerRef.current) return;
    setIsDragging(false);
    tableContainerRef.current.style.cursor = "grab";
  };

  // Fetch events and records on component enter
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/events");
        setEvents(response.data);
      } catch (err) {
        console.error("Events fetch error:", err);
      }
    };
    fetchEvents();
  }, []);

  // Fetch records on component enter
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/submissions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRecords(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch records");
        setLoading(false);
        console.error("Error fetching records:", err);
      }
    };

    fetchRecords();
  }, []);

  const downloadFile = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/submissions/${id}/file`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "document.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };

  // Add a new function to handle document analysis
  const analyzeDocument = async (id) => {
    try {
      setAnalyzingDocument(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/analyze/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAnalysisData(response.data);
      setShowAnalysisModal(true);
      setAnalyzingDocument(false);
    } catch (err) {
      console.error("Error analyzing document:", err);
      setError(
        "Failed to analyze document: " +
          (err.response?.data?.message || err.message)
      );
      setAnalyzingDocument(false);
    }
  };

  // Close modal function
  const handleCloseModal = () => {
    setShowAnalysisModal(false);
    setAnalysisData(null);
  };

  // Filter records based on selected criteria
  const filterRecords = (records, filterBy) => {
    const filteredRecords = [...records];
    switch (filterBy) {
      case "name":
        return filteredRecords.sort((a, b) => a.name.localeCompare(b.name));
      case "type":
        return filteredRecords.sort((a, b) => a.type.localeCompare(b.type));
      case "date":
        return filteredRecords.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "eventId":
        return filteredRecords.sort((a, b) => {
          // Handle cases where either eventId might be null/undefined
          if (!a.eventId && !b.eventId) return 0; // Both are null/undefined, consider them equal
          if (!a.eventId) return 1; // a is null/undefined, move to end
          if (!b.eventId) return -1; // b is null/undefined, move to end
          // If both exist, use normal string comparison
          return a.eventId.localeCompare(b.eventId);
        });
      default:
        return filteredRecords;
    }
  };

  // Filter records by selected course
  const filterByCourse = (records, selectedCourse) => {
    if (!selectedCourse) return records;
    return records.filter((record) => record.eventId === selectedCourse);
  };

  // Return error if any
  if (error) {
    return (
      <Container className="text-danger records-container">{error}</Container>
    );
  }

  const filteredRecords = filterByCourse(
    filterRecords(records, filterBy),
    selectedCourse
  );

  // Render component
  return (
    <div className="records-container">
      <div className="records-hero">
        <h1>Submission Records</h1>
        <p>View and manage all student and company submissions</p>
      </div>

      {/* ChatPanel tab displayed on page. */}
      <ChatPanel />

      <div className="records-controls">
        <div className="d-flex align-items-center">
          <Badge bg="primary" className="me-2">
            Records: {filteredRecords.length}
          </Badge>
        </div>

        <div className="records-filters">
          {/* Filter and sort criteria */}
          <Form.Group style={{ width: "200px" }}>
            <Form.Select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
              <option value="eventId">Sort by Event</option>
            </Form.Select>
          </Form.Group>

          <Form.Group style={{ width: "200px" }}>
            <Form.Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.courseName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
      </div>

      <div
        className="table-responsive-horizontal"
        ref={tableContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{
          opacity: loading || analyzingDocument ? 0.6 : 1,
        }}
      >
        {/* Table for displaying records */}
        <Table striped bordered hover className="records-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Event</th>
              <th>Name</th>
              <th>Email</th>
              <th>File</th>
              <th>Submitted At</th>
              <th>Paid</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record._id}>
                <td>
                  <Badge bg={record.type === "person" ? "primary" : "success"}>
                    {record.type}
                  </Badge>
                </td>
                <td>
                  {
                    events.find((event) => event._id === record.eventId)
                      ?.courseName
                  }
                </td>
                <td>{record.name}</td>
                <td>{record.email}</td>
                <td>
                  {record.file ? (
                    <Button
                      variant="link"
                      onClick={() => downloadFile(record._id)}
                    >
                      Download PDF
                    </Button>
                  ) : (
                    "No file"
                  )}
                </td>
                <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={record.paid}
                    onChange={async () => {
                      const confirmUpdate = window.confirm(
                        "Are you sure you want to update the payment status?"
                      );
                      if (!confirmUpdate) {
                        return; // If user cancels, do nothing
                      }
                      try {
                        const token = localStorage.getItem("token");
                        await axios.patch(
                          `http://localhost:5000/api/submissions/${record._id}`,
                          { paid: !record.paid },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setRecords(
                          records.map((r) =>
                            r._id === record._id ? { ...r, paid: !r.paid } : r
                          )
                        );
                      } catch (err) {
                        console.error("Error updating payment status:", err);
                      }
                    }}
                    inline
                  />
                  {/* Display badge based on payment status */}
                  {record.paid ? (
                    <Badge bg="success">Paid</Badge>
                  ) : (
                    <Badge bg="danger">Not Paid</Badge>
                  )}
                </td>
                <td>
                  {/* New column with analyze button - only show for records with files */}
                  {record.file && (
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => analyzeDocument(record._id)}
                      disabled={analyzingDocument}
                    >
                      {analyzingDocument ? "Analyzing..." : "Analyze Document"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Keep the loading spinner as an overlay that doesn't remove the table */}
      {loading && (
        <div className="loading-overlay">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {/* Analysis Results Modal */}
      <Modal show={showAnalysisModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Document Analysis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {analysisData ? (
            <div className="analysis-modal">
              <h5>Analysis for: {analysisData.filename}</h5>
              {analysisData.analysis.includes("Local Analysis Mode") && (
                <div className="alert alert-warning">
                  <strong>Notice:</strong> This analysis was performed locally
                  because no OpenAI API key is configured. For more detailed
                  analysis, please set up an API key.
                </div>
              )}
              <div>
                <div className="markdown-content">
                  <ReactMarkdown>{analysisData.analysis}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <p>No analysis data available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SeeRecords;
