document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const reviewInput = document.querySelector('.review-input');
    const postReviewButton = document.querySelector('.post-review');
    const starRating = document.querySelector('.star-rating');

    const gameId = new URLSearchParams(window.location.search).get('gameId');
    console.log('Game ID:', gameId);

    if (!gameId) {
        console.error('No gameId provided in the URL. Redirecting to home page.');
        window.location.href = 'index.html'; // Redirect if gameId is missing
    }


  
    let selectedRating = 0;
  
    // Handle Star Rating Clicks
    if (starRating) {
      starRating.addEventListener('click', (event) => {
        const stars = [...starRating.querySelectorAll('.star')]; // Convert NodeList to an array
        const clickedStar = event.target;
  
        if (clickedStar.classList.contains('star')) {
          selectedRating = parseInt(clickedStar.dataset.value, 10);
  
          // Highlight all stars up to the clicked one
          stars.forEach((star, index) => {
            if (index < selectedRating) {
              star.classList.add('active'); // Add the highlight
            } else {
              star.classList.remove('active'); // Remove the highlight
            }
          });
  
          // Update the rating text
          const ratingText = document.querySelector('.select-rating');
          if (ratingText) {
            ratingText.textContent = `Rating: ${selectedRating}`;
          }
        }
      });
    }
  
    // Handle Review Submission
    if (postReviewButton) {
      postReviewButton.addEventListener('click', async () => {
        const reviewText = reviewInput.value.trim();
  
        if (!selectedRating || !reviewText) {
          alert('Please provide a rating and review text.');
          return;
        }
  
        const gameId = new URLSearchParams(window.location.search).get('gameId');
        if (!gameId) {
          alert('Invalid game ID.');
          return;
        }
  
        try {
          const response = await fetch('http://127.0.0.1:8000/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Ensures cookies or session tokens are sent
            body: JSON.stringify({
              game_id: parseInt(gameId),
              rating: selectedRating,
              review_text: reviewText,
            }),
          });

          console.log(response)
  
          if (response.ok) {
            alert('Review submitted successfully!');
            window.location.href = `game-info.html?gameId=${gameId}`;
          } else {
            const errorData = await response.json();
            alert(`Failed to submit review: ${errorData.message}`);
          }
        } catch (error) {
          console.error('Error submitting review:', error);
          alert('An error occurred while submitting your review. Please try again.');
        }
      });
    }
  });
  