import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>About Our Project</h1>
        <p className="about-tagline">
          AI-powered document processing designed for educational institutions
        </p>
      </div>

      <div className="project-info">
        <h2>The AI Document Processor</h2>
        <p>
          This application was developed as a 3rd year final project at Atlantic Technological University, Galway.
          It leverages modern artificial intelligence to streamline document processing workflows, 
          enabling efficient analysis and management of PDF documents.
        </p>
        <p>
          Our system allows users to submit documents, automatically extracts text using OCR technology,
          and provides AI-powered analysis of the document content. Administrators can manage submissions,
          query the AI for specific information, and generate insights from processed documents.
        </p>
        
        <h2>Key Technologies</h2>
        <div className="technologies">
          <span className="tech-badge">React</span>
          <span className="tech-badge">Node.js</span>
          <span className="tech-badge">Express</span>
          <span className="tech-badge">MongoDB</span>
          <span className="tech-badge">Python</span>
          <span className="tech-badge">OCR</span>
          <span className="tech-badge">OpenRouter AI</span>
          <span className="tech-badge">Docker</span>
        </div>
      </div>

      <div className="team-section">
        <div className="team-member">
          <h3>Fionn McCarthy</h3>
          <p>G00414386</p>
        </div>
        <div className="team-member">
          <h3>Kyrylo Kozlovskyi</h3>
          <p>G00425385</p>
        </div>
      </div>
    </div>
  );
};

export default About;
