// Extract gameId from the URL
// const urlParams = new URLSearchParams(window.location.search);
// const gameId = urlParams.get('gameId');

// Now you can use this gameId to fetch game data
document.addEventListener('DOMContentLoaded', async () => {
  const gameId = new URLSearchParams(window.location.search).get('gameId');

  if (gameId) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/games/${gameId}`);
      const gameData = await response.json();

      // Populate the game info on the page
      const gameTitle = document.getElementById('game-title');
      const gameRating = document.getElementById('game-rating');
      const gameReleaseDate = document.getElementById('game-release-date');

      if (gameData) {
        gameTitle.innerText = gameData.title;
        gameRating.innerText = `Rating: ${gameData.review_rating}`;
        gameReleaseDate.innerText = `Release Date: ${gameData.release_date}`;
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    }

    const postReviewLink = document.getElementById('post-review-link');
    if (postReviewLink) {
      postReviewLink.href = `http://127.0.0.1:8000/game-review.html?gameId=${gameId}`;
    }

    //Fetching reviews for the specific game
    try {
      // Fetch reviews for the specific game
      const reviewsResponse = await fetch(
        `http://127.0.0.1:8000/api/reviews/game/${gameId}`
      );
      const reviewsData = await reviewsResponse.json();

      // Check if the reviews data is fetched
      if (reviewsData) {
        console.log('I have the data:', reviewsData);

        // Turning the reviewsData object into an array to loop through:
        const reviewsArray = Array.isArray(reviewsData)
          ? reviewsData
          : [reviewsData];

        // Get the reviews container to display reviews
        const reviewsContainer = document.querySelector('.game-reviews');
        reviewsContainer.innerHTML = ''; // Clear any existing content

        // Loop through the reviews and display them
        reviewsArray.forEach(review => {
          const reviewElement = document.createElement('div');

          // Add a class to the review element for styling
          reviewElement.classList.add('review-box');

          // Construct a string to display all the properties of the review
          reviewElement.innerHTML = `
              <strong>Review ID:</strong> ${review.review_id} <br>
              <strong>User ID:</strong> ${review.user_id} <br>
              <strong>Rating:</strong> ${review.rating} <br>
              <strong>Review Text:</strong> ${review.review_text} <br>
              <strong>Created At:</strong> ${review.created_at} <br>
              <strong>Updated At:</strong> ${review.updated_at} <br>
          `;

          // Append the review element to the container
          reviewsContainer.appendChild(reviewElement);
        });
      } else {
        console.log('No reviews data found.');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }
});
