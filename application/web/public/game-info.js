// Wait for the DOM content to load
document.addEventListener('DOMContentLoaded', async () => {
  // Extract `gameId` from the URL parameters
  const gameId = new URLSearchParams(window.location.search).get('gameId');

  if (gameId) {
    // Fetch and display game data
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

      if (gameData) {
        gameTitle.innerText = gameData.title || 'N/A';
        gameRating.innerText = `Rating: ${gameData.review_rating || 'N/A'}`;
        gameReleaseDate.innerText = `Release Date: ${gameData.release_date || 'N/A'}`;
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
      const gameTitle = document.getElementById('game-title');
      gameTitle.textContent = 'Game not found.';
    }

    // Fetch and display reviews for the game
    const loadReviews = async () => {
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
        const reviewsContainer = document.getElementById('reviews-container');
        reviewsContainer.innerHTML = '<p>Failed to load reviews.</p>';
      }
    };

    await loadReviews();

    // Handle "Create Review" button click to toggle form visibility
    const createReviewBtn = document.getElementById('create-review-btn');
    const createReviewForm = document.getElementById('create-review-form');

    createReviewBtn.addEventListener('click', () => {
      createReviewForm.classList.toggle('hidden');
    });

    // Handle review form submission
    createReviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rating = document.getElementById('rating').value;
      const reviewText = document.getElementById('review_text').value;

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            game_id: gameId,
            rating,
            review_text: reviewText,
          }),
        });

        if (response.ok) {
          alert('Review submitted successfully!');
          createReviewForm.reset();
          createReviewForm.classList.add('hidden');
          await loadReviews();
        } else {
          const errorData = await response.json();
          alert(`Failed to submit review: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('An error occurred while submitting your review. Please try again later.');
      }
    });
  } else {
    console.warn('No gameId found in URL parameters.');
    const gameTitle = document.getElementById('game-title');
    gameTitle.innerText = 'Game ID is missing or invalid.';
  }
});
