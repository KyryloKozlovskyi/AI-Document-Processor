import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();
  
  useEffect(() => {
    // This effect only for debugging
    console.log("Layout rendered, location:", location.pathname);
  }, [location]);

  // Ensure stable identity of wrapper elements
  return (
    <div className="app-container">
      <NavigationBar />
      <div className="content-container">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default React.memo(Layout);
