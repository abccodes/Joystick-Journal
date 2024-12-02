// Global variable to store the logged-in user's ID
let userId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const logoutButton = document.getElementById('logout-btn');
  const signupButton = document.querySelector('a[href="signup.html"]');
  const loginButton = document.querySelector('a[href="login.html"]');
  const settingsButton = document.getElementById('settings-btn');
  const searchButton = document.querySelector('.search-button');
  const searchInput = document.querySelector('.search-input');
  const gameGrid = document.getElementById('gameGrid');
  const recommendationButton = document.getElementById('recommendation-button');
  const googleLoginButton = document.getElementById('google-login-button');
  const forgotPasswordForm = document.getElementById('forgot-password-form');

  /**
   * Helper function to make fetch calls with error handling.
   * @param {string} url - API endpoint to fetch.
   * @param {Object} options - Fetch options (method, headers, body, etc.).
   * @returns {Promise<Object>} Parsed JSON response.
   */
  const fetchWithErrorHandling = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      alert(error.message || 'An unexpected error occurred.');
      throw error;
    }
  };

  /**
   * Check user authentication status.
   * Fetches the authentication status from the backend and updates the UI accordingly.
   */
  const checkAuthStatus = async () => {
    try {
      const data = await fetchWithErrorHandling('http://127.0.0.1:8000/api/auth/status', {
        method: 'GET',
        credentials: 'include',
      });

      if (data.loggedIn) {
        userId = data.userId || null;
        console.log(`User is logged in. User ID: ${userId}`);

        // Update UI for logged-in state
        if (logoutButton) logoutButton.style.display = 'inline-block';
        if (signupButton) signupButton.style.display = 'none';
        if (loginButton) loginButton.style.display = 'none';
        if (settingsButton) settingsButton.style.display = 'inline-block';
      } else {
        console.log('User is not logged in.');

        // Reset UI for logged-out state
        if (logoutButton) logoutButton.style.display = 'none';
        if (settingsButton) settingsButton.style.display = 'none';
        if (signupButton) signupButton.style.display = 'inline-block';
        if (loginButton) loginButton.style.display = 'inline-block';
      }
    } catch {
      console.error('Could not check authentication status.');
    }
  };

  /**
   * Handle forgot password form submission.
   * Sends the user's email to the backend to trigger a password reset email.
   */
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = forgotPasswordForm.email.value;

      try {
        const response = await fetchWithErrorHandling('http://127.0.0.1:8000/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        alert(response.message); // Success message from the backend
      } catch (error) {
        console.error('Password reset failed:', error);
      }
    });
  }

  /**
   * Handle login form submission.
   * Authenticates the user and redirects to the homepage on success.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   */
  const handleLogin = async (email, password) => {
    try {
      const response = await fetchWithErrorHandling('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      userId = response.id; // Store user ID
      alert(`Welcome, ${response.name}!`);
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // Add event listener for login form
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      handleLogin(email, password);
    });
  }

  /**
   * Handle logout functionality.
   * Ends the user session and redirects to the homepage.
   */
  const handleLogout = async () => {
    try {
      await fetchWithErrorHandling('http://127.0.0.1:8000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      alert('Successfully logged out');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Add event listener for logout button
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      handleLogout();
    });
  }

  // Add event listener for recommendations button
  if (recommendationButton) {
    recommendationButton.addEventListener('click', async () => {
      const recommendationsDiv = document.getElementById('recommendations');
      recommendationsDiv.innerHTML = ''; // Clear previous content

      try {
        const response = await fetchWithErrorHandling('http://127.0.0.1:8000/api/userdata/recommendations', {
          credentials: 'include',
        });

        if (response.recommendations.length === 0) {
          recommendationsDiv.innerHTML = '<p>No recommendations available.</p>';
        } else {
          response.recommendations.forEach((game) => {
            const gameContainer = document.createElement('div');
            gameContainer.classList.add('game-tile');
            gameContainer.innerHTML = `
              <h3>${game.title}</h3>
              <p>Genre: ${game.genre}</p>
              <p>Rating: ${game.review_rating}</p>
            `;
            recommendationsDiv.appendChild(gameContainer);
          });
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        recommendationsDiv.innerHTML = '<p>Failed to load recommendations.</p>';
      }
    });
  }

  // Add event listener for Google Login button
  if (googleLoginButton) {
    googleLoginButton.addEventListener('click', () => {
      window.location.href = 'http://127.0.0.1:8000/api/auth/google';
    });
  }

  // Initialize on page load
  await checkAuthStatus();
  await updateProfileInformation();
  // Select the profile picture elements
  const profilePicUpload = document.getElementById('profilePicUpload');
  const profilePic = document.getElementById('profilePic');

  // Only add the event listener if the elements exist
  if (profilePicUpload && profilePic) {
    profilePicUpload.addEventListener('change', async function (event) {
      console.log('File selected'); // Log to verify event trigger
      const file = event.target.files[0];

      if (file) {
        // Display the preview
        const reader = new FileReader();
        reader.onload = function (e) {
          console.log('Image loaded'); // Log to verify loading
          profilePic.src = e.target.result; // Set the profile picture src to the uploaded image's data URL
        };
        reader.readAsDataURL(file);

        // Create FormData object to send the file to the server
        const formData = new FormData();
        formData.append('profilePicture', file);
        formData.append('userId', userId); // Assuming you have `userId` from the auth status

        try {
          // Send the image to your server
          const response = await fetch(
            'http://127.0.0.1:8000/api/users/upload-profile-picture',
            {
              method: 'POST',
              body: formData,
              credentials: 'include', // Include credentials if needed
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log('Profile picture uploaded successfully', data);
            alert('Profile picture uploaded successfully!');
          } else {
            console.error(
              'Error uploading profile picture:',
              response.statusText
            );
            alert('Failed to upload profile picture. Please try again.');
          }
        } catch (error) {
          console.error('Error uploading profile picture:', error);
          alert('An error occurred while uploading. Please try again.');
        }
      }
    });
  }

  if (searchButton && searchInput && gameGrid) {
    searchButton.addEventListener('click', async () => {
      const searchTerm = searchInput.value;
      if (searchTerm) {
        try {
          const response = await fetch(
            `http://localhost:8000/api/games/search?query=${encodeURIComponent(
              searchTerm
            )}`,
            {
              credentials: 'include',
            }
          );

          const games = await response.json();
          if (!response.ok) throw new Error('Network response was not ok');

          console.log(games)
          
          gameGrid.innerHTML = '';

          games.forEach(game => {
            const gameTile = document.createElement('div');
            gameTile.className = 'game-tile';
            gameTile.textContent = game.title;

            const gameImage = document.createElement('img');
            gameImage.src = game.cover_image ? game.cover_image : 'gameinfo_testimage.png';
            gameImage.alt = game.title;
            gameTile.appendChild(gameImage);
            

            gameTile.addEventListener('click', () => {
              window.location.href = `game-info.html?gameId=${game.game_id}`;
            });


            gameGrid.appendChild(gameTile);
          });
        } catch (error) {
          console.error('Error fetching games:', error);
        }
      } else {
        alert('Please enter a search term');
      }
    });
  }
});
