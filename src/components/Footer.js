import React from "react";
import "./styles/Footer.css"; // Updated path to the correct location

const Footer = () => {
  return (
    <footer className="app-footer text-center">
      <div className="text-center p-3">
        © 2025 Copyright: AI Document Processor
      </div>
    </footer>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(Footer);
