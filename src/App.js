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

function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/records" element={<SeeRecords />} />
        <Route path="/events" element={<EventMenu />} />
        <Route path="/events/create" element={<EventCreate />} />
        <Route path="/events/update/:id" element={<EventUpdate />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;