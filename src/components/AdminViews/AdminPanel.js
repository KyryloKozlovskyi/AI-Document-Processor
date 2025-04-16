import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/AdminPanel.css"; // Import CSS for styling.

// AdminPanel component is a dashboard for the admin user. It contains three cards that link to different admin views.
const AdminPanel = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Manage Events",
      description: "Create, update, and delete events",
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
        <p className="admin-tagline">
          Manage your events and submissions with ease
        </p>
      </div>

      <div className="admin-cards-container">
        <div className="admin-cards">
          {cards.map((card, index) => (
            <div key={index} className="admin-card">
              <div className="admin-card-content">
                <div className="admin-card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <button
                  className="btn-primary"
                  onClick={() => navigate(card.link)}
                >
                  Access
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="page-padding-bottom"></div>
    </div>
  );
};

export default AdminPanel;
