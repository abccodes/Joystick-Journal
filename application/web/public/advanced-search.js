document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('advanced-search-form');
    const searchResultsContainer = document.getElementById('search-results');
  
    searchForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission
  
      const query = event.target.query.value;
      const genre = event.target.genre.value;
      const rating = event.target.rating.value;
  
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/games/search?query=${query}&genre=${genre}&rating=${rating}`);
        const searchResults = await response.json();
  
        searchResultsContainer.innerHTML = ''; // Clear previous results
  
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          searchResults.forEach((game) => {
            const gameElement = document.createElement('div');
            gameElement.classList.add('game-tile');
            gameElement.innerHTML = `
              <img src="${game.cover_image}" alt="${game.title}" />
              <h3>${game.title}</h3>
              <p>Genre: ${game.genre}</p>
              <p>Rating: ${game.review_rating}</p>
            `;
            searchResultsContainer.appendChild(gameElement);
          });
        } else {
          searchResultsContainer.innerHTML = '<p>No results found.</p>';
        }
      } catch (error) {
        console.error('Error performing advanced search:', error);
        alert('An unexpected error occurred while searching.');
      }
    });
  });
  