import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import "./styles/EventForms.css";

const EventUpdate = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseName: "",
    venue: "",
    date: "",
    price: "",
    emailText: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch the event details
    const fetchEvent = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/events/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Format the date for the input field (YYYY-MM-DD)
        const event = response.data;
        const formattedDate = event.date
          ? new Date(event.date).toISOString().split("T")[0]
          : "";

        setFormData({
          ...event,
          date: formattedDate,
        });
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Error fetching event details");
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/events/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Event updated successfully");
      setTimeout(() => {
        navigate("/admin"); // Redirect to admin page after showing success message
      }, 1500);
    } catch (error) {
      console.error("Error updating event:", error);
      setError("Error updating event");
    }
  };

  return (
    <div className="event-form-container">
      <div className="event-form-hero">
        <h1>Update Event</h1>
        <p>Modify event details</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <Form onSubmit={handleSubmit} className="event-form">
        <Form.Group className="mb-3">
          <Form.Label>Course Name</Form.Label>
          <Form.Control
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Venue</Form.Label>
          <Form.Control
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price (€)</Form.Label>
          <Form.Control
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email Text</Form.Label>
          <Form.Control
            as="textarea"
            name="emailText"
            value={formData.emailText}
            onChange={handleChange}
            required
            rows="4"
          />
        </Form.Group>

        <div className="d-flex justify-content-center mt-4">
          <Button variant="primary" type="submit">
            Update Event
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EventUpdate;
