import React, { useState, useEffect } from "react";
import { Container, Table, Badge, Button, Form } from "react-bootstrap";
import axios from "axios";

const SeeRecords = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("date");

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
      default:
        return filteredRecords;
    }
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (error) {
    return <Container className="text-danger">{error}</Container>;
  }

  const filteredRecords = filterRecords(records, filterBy);

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Submission Records</h2>
        <Form.Group style={{ width: "200px" }}>
          <Form.Select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="date">Filter by Date</option>
            <option value="name">Filter by Name</option>
            <option value="type">Filter by Type</option>
          </Form.Select>
        </Form.Group>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Email</th>
            <th>File</th>
            <th>Submitted At</th>
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
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default SeeRecords;
