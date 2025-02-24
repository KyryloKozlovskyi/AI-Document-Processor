import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import Home from "./components/Home";
import About from "./components/About";
import Footer from "./components/Footer";
import Submit from "./components/Submit";
import SeeRecords from "./components/SeeRecords";

function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/records" element={<SeeRecords />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
