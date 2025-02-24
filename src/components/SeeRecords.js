import React, { useState, useEffect } from "react";
import { Container, Table, Badge, Button } from "react-bootstrap";
import axios from "axios";

const SeeRecords = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/submissions"
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
      const response = await axios.get(
        `http://localhost:5000/api/submissions/${id}/file`,
        {
          responseType: "blob",
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

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (error) {
    return <Container className="text-danger">{error}</Container>;
  }

  return (
    <Container>
      <h2 className="my-4">Submission Records</h2>
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
          {records.map((record) => (
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
