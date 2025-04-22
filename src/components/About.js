import React from "react";
import "./styles/About.css";

const About = () => {
  return (
    <div className="about-container page-container">
      <div className="about-hero">
        <h1>About Our Project</h1>
        <p className="about-tagline">
          AI-powered event management system with form processing functionality
          designed for small businesses
        </p>
      </div>

      <div className="project-info">
        <h2>The AI-Document Processor</h2>
        <p>
          This application was developed as a 3rd year final project at Atlantic
          Technological University, Galway. The AI-Document Processor harnesses
          AI to streamline form and PDF analysis—helping you organize and
          understand your data faster.
        </p>
        <p>
          Our system allows users to submit forms and pdf documents,
          automatically extracts text using Tesseract OCR, and provides
          AI-powered analysis of the document content. Administrators can manage
          submissions, query the AI for specific information, and generate
          insights from processed documents.
        </p>

        <h2>Key Technologies</h2>
        <div className="technologies">
          <span className="tech-badge">React</span>
          <span className="tech-badge">Node</span>
          <span className="tech-badge">MongoDB </span>
          <span className="tech-badge">OpenRouter API</span>
          <span className="tech-badge">Llama 4 Maverick</span>
          <span className="tech-badge">Tesseract OCR</span>
          <span className="tech-badge">Resend</span>
          <span className="tech-badge">JWT</span>
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
