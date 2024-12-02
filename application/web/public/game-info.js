// Wait for the DOM content to load
document.addEventListener('DOMContentLoaded', async () => {
  const gameId = new URLSearchParams(window.location.search).get('gameId');

  if (gameId) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/games/${gameId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Game not found');
        throw new Error(`Failed to fetch game data: ${response.statusText}`);
      }

      const gameData = await response.json();
      const gameTitle = document.getElementById('game-title');
      const gameRating = document.getElementById('game-rating');
      const gameReleaseDate = document.getElementById('game-release-date');

      gameTitle.innerText = gameData.title || 'N/A';
      gameRating.innerText = `Rating: ${gameData.review_rating || 'N/A'}`;
      gameReleaseDate.innerText = `Release Date: ${gameData.release_date || 'N/A'}`;
    } catch (error) {
      console.error('Error fetching game data:', error);
      document.getElementById('game-title').textContent = 'Game not found.';
    }

    // Fetch and display reviews for the game
    try {
      const reviewsResponse = await fetch(`http://127.0.0.1:8000/api/reviews/game/${gameId}`);
      if (!reviewsResponse.ok) throw new Error(`Failed to fetch reviews: ${reviewsResponse.statusText}`);

      const reviewsData = await reviewsResponse.json();
      const reviewsContainer = document.getElementById('reviews-container');
      reviewsContainer.innerHTML = '';

      if (Array.isArray(reviewsData) && reviewsData.length > 0) {
        reviewsData.forEach(review => {
          const reviewElement = document.createElement('div');
          reviewElement.classList.add('review-box');
          reviewElement.innerHTML = `
            <strong>User ID:</strong> ${review.user_id || 'Unknown'} <br>
            <strong>Rating:</strong> ${review.rating || 'No Rating'} <br>
            <strong>Review:</strong> ${review.review_text || 'No Review Text'} <br>
            <small><strong>Created At:</strong> ${review.created_at || 'N/A'}</small>
          `;
          reviewsContainer.appendChild(reviewElement);
        });
      } else {
        reviewsContainer.innerHTML = '<p>No reviews available for this game.</p>';
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      document.getElementById('reviews-container').innerHTML = '<p>Failed to load reviews.</p>';
    }
  } else {
    console.warn('No gameId found in URL parameters.');
    document.getElementById('game-title').innerText = 'Game ID is missing or invalid.';
  }
});
