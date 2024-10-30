const searchButton = document.querySelector('.search-button')
const searchInput = document.querySelector('.search-input')
const gameGrid = document.getElementById('gameGrid')
const genreFilter = document.getElementById('genre-filter')
const ratingFilter = document.getElementById('rating-filter')

// Add an event listener to the search button
searchButton.addEventListener('click', async () => {
  const searchTerm = searchInput.value
  const selectedGenre = genreFilter.value
  const selectedRating = ratingFilter.value

  if (searchTerm) {
    try {
      // Update API URL with genre and rating filters
      const queryParams = new URLSearchParams({
        query: searchTerm,
        genre: selectedGenre || undefined,
        rating: selectedRating || undefined,
      })

      const response = await fetch(`http://54.200.162.255/api/games/search?${queryParams}`)

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const games = await response.json()

      console.log('Fetched games:', games)
      gameGrid.innerHTML = ''

      games.forEach((game) => {
        const gameTile = document.createElement('div')
        gameTile.className = 'game-tile'
        gameTile.textContent = game.title
        gameGrid.appendChild(gameTile)
      })
    } catch (error) {
      console.error('Error fetching games:', error)
    }
  } else {
    alert('Please enter a search term')
  }
})
