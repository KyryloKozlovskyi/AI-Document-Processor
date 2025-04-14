import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // We'll create this file next

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>AI Document Processor</h1>
        <p className="tagline">
          Streamline your document processing with the power of AI
        </p>
        <button className="cta-button" onClick={() => navigate("/submit")}>
          Get Started
        </button>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <h3>Submit Documents</h3>
          <p>Upload your files for intelligent processing and analysis</p>
        </div>
        <div className="feature-card">
          <h3>View Records</h3>
          <p>Access and manage all your processed documents in one place</p>
        </div>
        <div className="feature-card">
          <h3>Admin Controls</h3>
          <p>Powerful tools for administrators to manage the system</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
