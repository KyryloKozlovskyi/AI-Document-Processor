import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import "./styles/EventForms.css";

const EventCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    courseName: "",
    venue: "",
    date: "",
    price: "",
    emailText: "",
  });

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
      await axios.post("http://localhost:5000/api/events", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Event created successfully");
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Error creating event");
    }
  };

  return (
    <div className="event-form-container">
      <div className="event-form-hero">
        <h1>Create New Event</h1>
        <p>Add a new course event</p>
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
            min={new Date().toISOString().split("T")[0]}
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
            placeholder="This will be sent to users when they submit an application"
          />
        </Form.Group>

        <div className="d-flex justify-content-center mt-4">
          <Button variant="primary" type="submit">
            Create Event
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EventCreate;
