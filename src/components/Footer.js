import React from "react";
import "./Footer.css"; // We'll create this CSS file

const Footer = () => {
  return (
    <footer className="app-footer text-center">
      <div className="text-center p-3">
        © 2025 Copyright: Transaction Website
      </div>
    </footer>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(Footer);
