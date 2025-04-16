import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

// AdminPanel component is a dashboard for the admin user. It contains three cards that link to different admin views.
const AdminPanel = () => {
  const navigate = useNavigate();

  // Define the cards to be displayed in the admin panel
  const cards = [
    {
      title: "Manage Events",
      description: "Create, update, and delete course events",
      link: "/events",
      icon: "📅",
    },
    {
      title: "View Submissions",
      description: "View and manage user submissions",
      link: "/records",
      icon: "📝",
    },
    {
      title: "Create Event",
      description: "Create a new course event",
      link: "/events/create",
      icon: "➕",
    },
  ];

  return (
    <div className="admin-container">
      <div className="admin-hero">
        <h1>Admin Dashboard</h1>
        <p className="admin-tagline">Manage your events and submissions with ease</p>
      </div>

      <div className="admin-cards">
        {/* Render cards in list */}
        {cards.map((card, index) => (
          <div key={index} className="admin-card">
            <div className="admin-card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <button className="admin-btn" onClick={() => navigate(card.link)}>
              Access
            </button>
          </div>
        ))}
      </div>
      <div className="page-padding-bottom"></div>
    </div>
  );
};

export default AdminPanel;
