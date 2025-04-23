// necessary imports
import Events from "./Events";
import { useEffect, useState } from "react";
import api from "../../utils/api"; // Import the API utility

const EventMenu = () => {
  // store events as JSON
  const [events, setEvents] = useState([]); // initialise events to null array

  // refresh page when events change
  useEffect(() => {
    Reload();
  }, []);

  // Update the reload function
  function Reload() {
    console.log("Reloading events");
    api
      .get("/api/events")
      .then((response) => {
        // log response
        console.log(response.data);
        setEvents(response.data);
      })
      .catch((error) => {
        console.log("Error loading events: ", error);
      });
  }

  return (
    // return event list
    <div className="root-container">
      {/* display events */}
      <Events myEvents={events} ReloadData={Reload} />
    </div>
  );
};

export default EventMenu;
