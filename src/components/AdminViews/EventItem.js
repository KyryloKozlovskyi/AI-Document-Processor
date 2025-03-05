import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";

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

  return (
    <Col xs={12} sm={6} md={6} className="mb-4 px-4">
      <Card className={`h-100 p-3`}>
        <Card.Header style={{
          backgroundColor: "#f8f9fa",
          textAlign: "center",
          fontSize: "1.5em",
        }}>{myEvent.courseName}</Card.Header>
        <Card.Body>
          <p className="d-flex justify-content-center">
            {myEvent.venue} ({new Date(myEvent.date).toLocaleDateString()})
          </p>
          <blockquote className="blockquote mb-0">
            <div className="d-flex justify-content-center">
              {myEvent.posterUrl && (
                <div className="d-flex justify-content-center">
                  <img
                    src={myEvent.posterUrl}
                    alt={myEvent.courseName}
                    className="img-fluid"
                    style={{
                      maxWidth: "50%",
                      height: "auto",
                      marginBottom: "10px",
                    }}
                  />
                </div>
              )}
            </div>
          </blockquote>
        </Card.Body>
        <Card.Footer>
          <div className="d-flex justify-content-between">
            <Link to={"/events/update/" + myEvent._id}>
              <Button variant="warning">Update</Button>
            </Link>
            <Button variant="danger" onClick={() => handleDelete(myEvent._id)}>Delete</Button>
          </div>
        </Card.Footer>
      </Card>
    </Col>
  );
}

export default EventItem;