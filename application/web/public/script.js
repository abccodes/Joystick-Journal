// Check if elements exist before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
  const recommendationButton = document.getElementById('recommendation-button')
  if (recommendationButton) {
    recommendationButton.addEventListener('click', async () => {
      console.log('Fetching recommendations...')

      const recommendationsDiv = document.getElementById('recommendations')
      recommendationsDiv.innerHTML = ''

      try {
        const response = await fetch(
          'http://localhost:8000/api/userdata/2/recommendations',
        )
        if (!response.ok) throw new Error('Network response was not ok')

        const data = await response.json()

        if (Array.isArray(data.recommendations)) {
          data.recommendations.forEach((game) => {
            const gameContainer = document.createElement('div')
            for (const [key, value] of Object.entries(game)) {
              const pTag = document.createElement('p')
              pTag.textContent = `${key}: ${value}`
              gameContainer.appendChild(pTag)
            }
            recommendationsDiv.appendChild(gameContainer)
            recommendationsDiv.appendChild(document.createElement('hr'))
          })
        } else {
          throw new Error(
            'Expected an array of games in data.recommendations, but received something else.',
          )
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        recommendationsDiv.innerHTML = `<p>Error fetching recommendations. Please try again later.</p>`
      }
    })
  } else {
    console.error("Button with ID 'recommendation-button' not found.")
  }

  // Google login button functionality
  const googleLoginButton = document.getElementById('google-login-button')
  if (googleLoginButton) {
    googleLoginButton.addEventListener('click', () => {
      window.location.href = 'http://localhost:8000/api/auth/google'
    })
  }

  // Search functionality
  const searchButton = document.querySelector('.search-button')
  const searchInput = document.querySelector('.search-input')
  const gameGrid = document.getElementById('gameGrid')
  if (searchButton && searchInput && gameGrid) {
    searchButton.addEventListener('click', async () => {
      const searchTerm = searchInput.value
      const reviewRating = Number(req.query.review_rating) || 0;
      const genre = ""

      if (searchTerm) {
        try {
          const response = await fetch(
            `http://localhost:8000/api/games/search?query=${encodeURIComponent(
              searchTerm,
            )}`,
          )
          if (!response.ok) throw new Error('Network response was not ok')

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
  } else {
    console.error("Search button, input, or 'gameGrid' div not found.")
  }
})
