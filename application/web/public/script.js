document.addEventListener('DOMContentLoaded', async () => {
  const logoutButton = document.getElementById('logout-btn');
  const signupButton = document.getElementById('signup-btn');
  const loginButton = document.getElementById('login-btn');
  const searchButton = document.querySelector('.search-button');
  const searchInput = document.querySelector('.search-input');
  const gameGrid = document.getElementById('gameGrid');

  // Search functionality
  if (searchButton && searchInput && gameGrid) {
    searchButton.addEventListener('click', async () => {
      const searchTerm = searchInput.value;
      if (searchTerm) {
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/api/games/search?query=${encodeURIComponent(searchTerm)}`,
            { credentials: 'include' }
          );

          const games = await response.json();
          gameGrid.innerHTML = '';

          games.forEach(game => {
            const gameTile = document.createElement('div');
            gameTile.className = 'game-tile';

            const gameImage = document.createElement('img');
            gameImage.src = game.cover_image;
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
      }
    });
  }

  // Logout functionality
  if (logoutButton) {
    logoutButton.addEventListener('click', async event => {
      event.preventDefault();
      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    });
  }

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/status', {
        method: 'GET',
        credentials: 'include',
      });
  
      const data = await response.json();
      console.log('Auth status data:', data);
  
      const logoutButton = document.getElementById('logout-btn');
      const signupButton = document.getElementById('signup-btn');
      const loginButton = document.getElementById('login-btn');
  
      if (data.loggedIn) {
        if (logoutButton) logoutButton.style.display = 'inline-block';
        if (signupButton) signupButton.style.display = 'none';
        if (loginButton) loginButton.style.display = 'none';
      } else {
        if (logoutButton) logoutButton.style.display = 'none';
        if (signupButton) signupButton.style.display = 'inline-block';
        if (loginButton) loginButton.style.display = 'inline-block';
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };
  

  await checkAuthStatus();


  // Game Review
  const reviewInput = document.querySelector('.review-input');
  const postReviewButton = document.querySelector('.post-review');
  const starRatingContainer = document.querySelector('.star-rating');
  const gameTitleElement = document.getElementById('game-title');
  const reviewsContainer = document.createElement('div'); 
  reviewsContainer.classList.add('reviews-list');
  starRatingContainer.parentElement.appendChild(reviewsContainer); 

  const gameId = new URLSearchParams(window.location.search).get('gameId'); 
  let selectedRating = 0;

  // Highlight stars on click
  if (starRatingContainer) {
    starRatingContainer.addEventListener('click', event => {
      if (event.target.classList.contains('star')) {
        selectedRating = parseInt(event.target.dataset.value, 10);
        Array.from(starRatingContainer.children).forEach(star => {
          const starValue = parseInt(star.dataset.value, 10);
          star.style.color = starValue <= selectedRating ? 'gold' : 'gray';
        });
      }
    });
  }


});
