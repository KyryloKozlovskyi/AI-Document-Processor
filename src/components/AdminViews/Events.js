// necessary imports
import React from "react";
import EventItem from "./EventItem";
import Row from "react-bootstrap/Row";
import "./styles/Events.css"; // Import the new CSS file

// Events holds list of Event objects
const Events = (props) => {
  // Log the value of props.myEvents to the console
  console.log("props.myEvents:", props.myEvents);

  // Check if props.myEvents is defined and is an array
  if (!props.myEvents || !Array.isArray(props.myEvents)) {
    return <div className="events-container">
      <div className="events-hero">
        <h1>Events</h1>
        <p>Manage your course events</p>
      </div>
      <p>No events available</p>
    </div>;
  }

  // Maps the event objects to EventItem components
  return (
    <div className="events-container">
      <div className="events-hero">
        <h1>Events</h1>
        <p>Manage your course events</p>
      </div>
      <div className="events-list">
        <Row className="g-4 w-100">
          {props.myEvents.map((event) => (
            <EventItem 
              myEvent={event} 
              key={event._id}
              ReloadData={props.ReloadData}   
            />
          ))}
        </Row>
      </div>
    </div>
  );
}

export default Events;