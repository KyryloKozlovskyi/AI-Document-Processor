import React from "react";

const Home = () => {
  return (
    <div className="root-container">
      <h1>Welcome to the AI Document Processor</h1>

      <div className="content-container">
        <h2>About the Project</h2>
        <p>This project is designed to help you process documents using AI.</p>

        <h2>Features</h2>
        <ul>
          <li>Submit documents for processing</li>
          <li>View processed records</li>
          <li>Admin panel for managing events and records</li>
        </ul>

        <h2>Getting Started</h2>
        <p>To get started, navigate to the Submit page to upload your documents.</p>
        <p>If you are an admin, you can access the admin panel for additional features.</p>
      </div>

      <button className="btn btn-primary" onClick={() => window.location.href = '/submit'}>
        Submit a Form
      </button>
    </div>
  );
};

export default Home;