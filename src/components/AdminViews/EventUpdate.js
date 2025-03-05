import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';

const EventUpdate = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseName: '',
    venue: '',
    date: '',
    price: '',
    emailText: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch the event details
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        setFormData(response.data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Error fetching event details');
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/events/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Event updated successfully:', response.data);
      setMessage('Event updated successfully');
      navigate('/admin'); // Redirect to admin page
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Error updating event');
    }
  };

  return (
    <Container className="mt-4">
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Course Name:</label>
          <input
            type="text"
            className="form-control"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Venue:</label>
          <input
            type="text"
            className="form-control"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Date:</label>
          <input
            type="date"
            className="form-control"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Price:</label>
          <input
            type="number"
            className="form-control"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email Text:</label>
          <textarea
            className="form-control"
            name="emailText"
            value={formData.emailText}
            onChange={handleChange}
            required
            rows="4"
          ></textarea>
        </div>
        <Button variant="primary" type="submit">
          Update Event
        </Button>
      </Form>
    </Container>
  );
};

export default EventUpdate;