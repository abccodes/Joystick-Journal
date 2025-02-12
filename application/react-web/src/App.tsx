import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";


function App() {
  return (
    <Router>
    <div className="bg-pink-200 flex flex-col min-h-screen">
      {/* Navbar Component */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900 -mt-80">
          Search
        </h1>
      </div>
      {/* Footer Sticks to the bottom of the page!*/}
      <Footer />
    </div>
    </Router>
  );
}

export default App;
