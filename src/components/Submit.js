import React, { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import axios from "axios";

const Submit = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    eventId: "",
    type: "person",
    name: "",
    email: "",
    file: null,
  });

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

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      file: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validation
    if (!formData.eventId) {
      setError("Please select a valid event");
      return;
    }
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (formData.type === "company" && !formData.file) {
      setError("PDF file is required for company submissions");
      return;
    }

    try {
      const data = new FormData();
      data.append("eventId", formData.eventId);
      data.append("type", formData.type);
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (formData.file) {
        data.append("file", formData.file);
      }

      const response = await axios.post(
        "http://localhost:5000/api/submit",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
      setFormData({
        eventId: "",
        type: "person",
        name: "",
        email: "",
        file: null,
        paid: false,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during submission"
      );
      console.error("Submission error:", err);
    }
  };

  return (
    <Container>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formEvent">
          <Form.Label>Event</Form.Label>
          <Form.Control
            as="select"
            name="eventId" // Change this to match the key in formData
            value={formData.eventId}
            onChange={handleChange}
          >
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.courseName} - €{event.price}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="formType">
          <Form.Label>Type</Form.Label>
          <Form.Control
            as="select"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="person">Person</option>
            <option value="company">Company</option>
          </Form.Control>
        </Form.Group>
        {formData.type === "person" && (
          <>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email.toLowerCase()}
                onChange={handleChange}
              />
            </Form.Group>
          </>
        )}
        {formData.type === "company" && (
          <>
            <Form.Group controlId="formCompanyName">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formCompanyEmail">
              <Form.Label>Company Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email.toLowerCase()}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formDownload">
              <Button variant="primary" onClick={() => window.open("http://localhost:5000/companyform")}>
                Download PDF
              </Button>
            </Form.Group>
            <Form.Group controlId="formFile">
              <Form.Label>Upload signed PDF</Form.Label>
              <Form.Control
                type="file"
                name="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </Form.Group>
          </>
        )}
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default Submit;