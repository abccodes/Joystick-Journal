// Wait for the DOM content to load
document.addEventListener('DOMContentLoaded', async () => {
  // Extract `gameId` from the URL parameters
  const gameId = new URLSearchParams(window.location.search).get('gameId');

  if (gameId) {
    // Fetch and display game data
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/games/${gameId}`);
      
      // Handle non-2xx HTTP responses
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Game not found');
        }
        throw new Error(`Failed to fetch game data: ${response.statusText}`);
      }

      const gameData = await response.json();

      // Update game info section with fetched data
      const gameTitle = document.getElementById('game-title');
      const gameRating = document.getElementById('game-rating');
      const gameReleaseDate = document.getElementById('game-release-date');

      if (gameData) {
        gameTitle.innerText = gameData.title || 'N/A';
        gameRating.innerText = `Rating: ${gameData.review_rating || 'N/A'}`;
        gameReleaseDate.innerText = `Release Date: ${gameData.release_date || 'N/A'}`;
      }
    } catch (error) {
      console.error('Error fetching game data:', error);

      // Handle error by updating the game info section with a fallback message
      const gameTitle = document.getElementById('game-title');
      gameTitle.textContent = 'Game not found.';
    }

    // Fetch and display reviews for the game
    try {
      const reviewsResponse = await fetch(`http://127.0.0.1:8000/api/reviews/game/${gameId}`);
      
      // Handle non-2xx HTTP responses
      if (!reviewsResponse.ok) throw new Error(`Failed to fetch reviews: ${reviewsResponse.statusText}`);
      
      const reviewsData = await reviewsResponse.json();

      // Check if reviews data exists
      const reviewsContainer = document.getElementById('reviews-container');
      reviewsContainer.innerHTML = ''; // Clear existing reviews

      if (Array.isArray(reviewsData) && reviewsData.length > 0) {
        reviewsData.forEach(review => {
          // Create a review element
          const reviewElement = document.createElement('div');
          reviewElement.classList.add('review-box'); // Add class for styling

          // Populate review element with review data
          reviewElement.innerHTML = `
            <strong>User ID:</strong> ${review.user_id || 'Unknown'} <br>
            <strong>Rating:</strong> ${review.rating || 'No Rating'} <br>
            <strong>Review:</strong> ${review.review_text || 'No Review Text'} <br>
            <small><strong>Created At:</strong> ${review.created_at || 'N/A'}</small>
          `;

          // Append review element to the container
          reviewsContainer.appendChild(reviewElement);
        });
      } else {
        reviewsContainer.innerHTML = '<p>No reviews available for this game.</p>';
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      const reviewsContainer = document.getElementById('reviews-container');
      reviewsContainer.innerHTML = '<p>Failed to load reviews.</p>';
    }
  } else {
    console.warn('No gameId found in URL parameters.');

    // Update the game title with a warning message for missing or invalid gameId
    const gameTitle = document.getElementById('game-title');
    gameTitle.innerText = 'Game ID is missing or invalid.';
  }
});


// Key Improvements:
// Error Handling:

// Added checks for HTTP response status (response.ok) and logged descriptive errors.
// Displayed fallback messages in the UI if fetching data fails.
// Dynamic Data Updates:

// Used innerText and innerHTML with appropriate null/undefined checks to avoid breaking the UI.
// Added fallback content (N/A) for missing data fields.
// Improved Comments:

// Detailed comments for each section of the script to explain its purpose and functionality.
// Resilience Against Missing or Invalid Data:

// Added warnings if gameId is missing.
// Displayed placeholder text for unavailable reviews or game data.
// Code Readability:

// Improved readability with consistent indentation and structured logical sections.