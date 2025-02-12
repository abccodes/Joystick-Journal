import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";


function App() {
  return (
    <div className="bg-pink-200 min-h-screen">
      {/* Navbar Component */}
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="mb-150 text-4xl font-bold text-gray-900">
          Search
        </h1>
      </div>
      {/* Footer Sticks to the bottom of the page!*/}
      <Footer />
    </div>
    
  );
}

export default App;
