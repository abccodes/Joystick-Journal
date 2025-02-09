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
            <a href="/" className="hover:text-pink-300">Joystick Journal</a>
          </h1>
  
          {/* Navigation Links */}
          <ul className="flex gap-4">
            <li>
              <a href="/signup" className="hover:text-pink-300">Sign Up</a>
            </li>
            <li>
              <a href="/login" className="hover:text-pink-300">Login</a>
            </li>
            <li>
              <a href="/recommendations" className="hover:text-pink-300">Get Recommendations</a>
            </li>
            <li>
              <a href="/settings" className="hover:text-pink-300">Settings</a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
  
  export default Navbar;
  