import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import Home from "./components/Home";
import About from "./components/About";
import Footer from "./components/Footer";
import Submit from "./components/Submit";
import SeeRecords from "./components/AdminViews/SeeRecords";
import EventMenu from "./components/AdminViews/EventMenu";
import EventCreate from "./components/AdminViews/EventCreate.js";
import EventUpdate from "./components/AdminViews/EventUpdate.js";
import AdminPanel from "./components/AdminViews/AdminPanel";
import { AdminProvider } from "./components/AdminViews/AdminContext";
import ProtectedRoute from "./components/AdminViews/ProtectedRoute";
import Login from "./components/AdminViews/Login";

function App() {
  return (
    <AdminProvider>
      <Router>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <SeeRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/create"
            element={
              <ProtectedRoute>
                <EventCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/update/:id"
            element={
              <ProtectedRoute>
                <EventUpdate />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </AdminProvider>
  );
}

export default App;
