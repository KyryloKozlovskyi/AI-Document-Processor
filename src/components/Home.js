import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Home.css"; // We'll create this file next

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container page-container">
      <div className="hero-section">
        <h1>AI Document Processor</h1>
        <p className="tagline">
          Streamline your event and document management with the power of AI
        </p>
        <button className="cta-button" onClick={() => navigate("/submit")}>
          Get Started
        </button>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <h3>Submit Forms</h3>
          <p>Store, organize, and analyze form submissions with AI</p>
        </div>
        <div className="feature-card">
          <h3>View Records</h3>
          <p>Access and manage all your submissions in one place</p>
        </div>
        <div className="feature-card">
          <h3>Admin Controls</h3>
          <p>Powerful tools for submission management</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
