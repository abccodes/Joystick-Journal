
function Navbar() {
    return (
      <nav
        className="bg-cover bg-center text-white flex items-center"
        style={{
          backgroundImage: `url('/bannerpic.png')`,
          backgroundSize: 'cover', // Ensures the background fills the entire navbar
          backgroundRepeat: 'no-repeat', // Prevents the image from repeating
          height: '8rem', // Adjust height to fit the image and text
        }}
      >
        <div className="container mx-auto flex justify-between items-center h-full">
          {/* Logo/Title */}
          <h1 className="text-2xl font-bold">
            <a href="/" className="text-large hover:text-pink-300">Joystick Journal</a>
          </h1>
  
          {/* Navigation Links */}
          <ul className="flex items-center gap-4">
          <li>
            <a href="/signup" className="py-2.5 px-5 text-medium font-medium text-black bg-pink-200 border border-black rounded-full hover:bg-pink-300 hover:text-white transition">
              Sign Up
            </a>
          </li>
          <li>
            <a href="/login" className="py-2.5 px-5 text-medium font-medium text-black bg-pink-200 border border-black rounded-full hover:bg-pink-300 hover:text-white transition">
              Login
            </a>
          </li>
          <li>
            <a href="/recommendations" className="py-2.5 px-5 text-me font-medium text-black bg-pink-200 border border-black rounded-full hover:bg-pink-300 hover:text-white transition">
              Get Recommendations
            </a>
          </li>
          <li>
            <a href="/settings" className="py-2.5 px-5 text-medium font-medium text-black bg-pink-200 border border-black rounded-full hover:bg-pink-300 hover:text-white transition">
              Settings
            </a>
          </li>
        </ul>
      </div>
    </nav>
    );
  }
  
  export default Navbar;
  