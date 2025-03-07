import React, { useState, useEffect } from "react";
import { Container, Table, Badge, Button, Form } from "react-bootstrap";
import axios from "axios";

const SeeRecords = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("date");
  const [events, setEvents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(""); // State for selected course

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
        console.log(response.data);
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
        return filteredRecords.sort(
          (a, b) => a.eventId.localeCompare(b.eventId)
        );
      default:
        return filteredRecords;
    }
  };

  const filterByCourse = (records, selectedCourse) => {
    if (!selectedCourse) return records;
    return records.filter(record => record.eventId === selectedCourse);
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (error) {
    return <Container className="text-danger">{error}</Container>;
  }

  const filteredRecords = filterByCourse(filterRecords(records, filterBy), selectedCourse);

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Submission Records</h2>
        <div className="d-flex">
          <Badge bg="primary m-2">
            Records: {filteredRecords.length}
          </Badge>
          <Form.Group style={{ width: "200px", marginRight: "10px" }}>
            <Form.Select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="date">Filter by Date</option>
              <option value="name">Filter by Name</option>
              <option value="type">Filter by Type</option>
              <option value="eventId">Filter by Event</option>
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
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Type</th>
            <th>Event</th>
            <th>Name</th>
            <th>Email</th>
            <th>File</th>
            <th>Submitted At</th>
            <th>Paid</th>
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
                {events.find((event) => event._id === record.eventId)
                  ?.courseName}
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
              <td>
                {new Date(record.createdAt).toLocaleDateString()}
              </td>
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
                      setRecords(records.map(r =>
                        r._id === record._id ? { ...r, paid: !r.paid } : r
                      ));
                    } catch (err) {
                      console.error("Error updating payment status:", err);
                    }
                  }}
                  inline
                />
                {record.paid ? (
                  <Badge bg="success">Paid</Badge>
                ) : (
                  <Badge bg="danger">Not Paid</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default SeeRecords;