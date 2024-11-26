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

  /**
   * Fetch and display game recommendations.
   * Fetches recommendations for the logged-in user and displays them in the UI.
   */
  const fetchRecommendations = async () => {
    const recommendationsDiv = document.getElementById('recommendations');
    recommendationsDiv.innerHTML = ''; // Clear previous content

    try {
      const recommendations = await fetchWithErrorHandling(
        'http://127.0.0.1:8000/api/userdata/recommendations',
        { credentials: 'include' }
      );

      if (recommendations.length === 0) {
        recommendationsDiv.innerHTML = '<p>No recommendations available.</p>';
        return;
      }

      recommendations.forEach((game) => {
        const gameElement = document.createElement('div');
        gameElement.classList.add('game-tile');
        gameElement.innerHTML = `
          <h3>${game.title}</h3>
          <p>Genre: ${game.genre}</p>
          <p>Rating: ${game.review_rating}</p>
        `;
        recommendationsDiv.appendChild(gameElement);
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      recommendationsDiv.innerHTML = '<p>Failed to load recommendations.</p>';
    }
  };

  // Add event listener for recommendations button
  if (recommendationButton) {
    recommendationButton.addEventListener('click', fetchRecommendations);
  }

  // Add event listener for Google Login button
  if (googleLoginButton) {
    googleLoginButton.addEventListener('click', () => {
      window.location.href = 'http://127.0.0.1:8000/api/auth/google';
    });
  }

  // Initialize on page load
  await checkAuthStatus();
});



// Key Improvements
// Refactoring Reusable Logic:
// Created reusable functions like handleLogin, handleLogout, and fetchRecommendations to encapsulate logic for better readability and maintainability.
// Error Handling:
// Improved error handling with meaningful error messages and fallback UI elements.
// Comments:
// Added detailed comments explaining the purpose and functionality of each section.
// Authentication Check:
// Consolidated checkAuthStatus to update UI elements dynamically based on the user's login state.