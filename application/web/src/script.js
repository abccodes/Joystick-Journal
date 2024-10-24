// leaving a test
// Select the search button and input field
const searchButton = document.querySelector('.search-button');
const searchInput = document.querySelector('.search-input');
const gameGrid = document.getElementById('gameGrid');

// Add an event listener to the search button
searchButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value; // Get the input value

    // Check if the input is not empty
    if (searchTerm) {
        try {
            // Make a fetch request to the backend
            const response = await fetch(`http://localhost:8000/api/games/search?query=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const games = await response.json(); // Parse the JSON response

            // Clear the previous game tiles
            gameGrid.innerHTML = '';

            // Populate the grid with fetched games
            games.forEach(game => {
                const gameTile = document.createElement('div');
                gameTile.className = 'game-tile';
                gameTile.textContent = game.title; // Assuming each game object has a 'title' property
                gameGrid.appendChild(gameTile);
            });
        } catch (error) {
            console.error('Error fetching games:', error);
        }
    } else {
        alert('Please enter a search term'); // Alert if input is empty
    }
});
