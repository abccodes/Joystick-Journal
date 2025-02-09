import Navbar from "./components/navbar.tsx";

function App() {
  return (
    <div className="bg-pink-200 min-h-screen">
      {/* Navbar Component */}
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900">
          Search
        </h1>
      </div>
    </div>
  );
}

export default App;
