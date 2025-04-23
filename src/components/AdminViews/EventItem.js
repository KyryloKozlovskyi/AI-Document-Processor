import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import "./styles/EventItem.css"; // Import the new CSS file

const EventItem = ({ myEvent, ReloadData }) => {
  const handleDelete = async (id) => {
    // Show confirmation popup
    const confirmDelete = window.confirm("Are you sure you want to delete this event?"
        + "\nThis will delete submissions associated with this event as well, and cannot be undone.");
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log("Event deleted successfully");
      ReloadData(); // Call ReloadData to refresh the events list
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  // Format the date nicely
  const formattedDate = new Date(myEvent.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Col xs={12} sm={6} md={4} className="mb-4 d-flex justify-content-center">
      <Card className="event-card">
        <div className="event-card-header">{myEvent.courseName}</div>
        <div className="event-card-body">
          <div className="event-venue">Location: {myEvent.venue}</div>
          <div className="event-date">Date: {formattedDate}</div>
          <div className="event-price">Price: €{myEvent.price}</div>
          <p>{myEvent.emailText}</p>
        </div>
        <div className="event-card-footer">
          <Link to={"/events/update/" + myEvent._id}>
            <Button variant="warning">Update</Button>
          </Link>
          <Button variant="danger" onClick={() => handleDelete(myEvent._id)}>Delete</Button>
        </div>
      </Card>
    </Col>
  );
}

export default EventItem;