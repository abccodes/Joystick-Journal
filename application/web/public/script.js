let userId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const logoutButton = document.getElementById('logout-btn');
  const signupButton = document.querySelector('a[href="signup.html"]');
  const loginButton = document.querySelector('a[href="login.html"]');
  const settingsButton = document.getElementById('settings-btn');
  const searchButton = document.querySelector('.search-button');
  const searchInput = document.querySelector('.search-input');
  const gameGrid = document.getElementById('gameGrid');
  const recommendationButton = document.getElementById('recommendation-button');
  const googleLoginButton = document.getElementById('google-login-button');

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/status', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.loggedIn) {
        if (data.userId) {
          userId = data.userId;
        }
        console.log(`User is logged in. User ID: ${userId}`);

        if (logoutButton) logoutButton.style.display = 'inline-block';
        if (signupButton) signupButton.style.display = 'none';
        if (loginButton) loginButton.style.display = 'none';
        if (settingsButton) settingsButton.style.display = 'inline-block';
      } else {
        console.log('User is not logged in');

        if (logoutButton) logoutButton.style.display = 'none';
        if (settingsButton) settingsButton.style.display = 'none';
        if (signupButton) signupButton.style.display = 'inline-block';
        if (loginButton) loginButton.style.display = 'inline-block';
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const loginForm = document.querySelector('.login-form');
  if (loginForm && loginForm.id !== 'signup-form') {
    loginForm.addEventListener('submit', async event => {
      event.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;

      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          userId = data.id;
          console.log('User ID stored after login:', userId);
          alert(`Welcome, ${data.name}!`);
          window.location.href = 'index.html';
        } else {
          alert('Login failed. Please check your credentials.');
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async event => {
      event.preventDefault();
      const name = signupForm.username.value;
      const email = signupForm.email.value;
      const password = signupForm.password.value;
      const confirmPassword = signupForm.confirm_password.value;
      const profile_pic = 'application/web/public/Default-Profile-Picture.jpg';

      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }

      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/auth/register',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, profile_pic, password }),
          }
        );

        if (response.ok) {
          alert('Account created successfully! You can now log in.');
          window.location.href = 'login.html'; // Redirect to login page
        } else {
          const errorData = await response.json();
          alert(`Registration failed: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error registering:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', async event => {
      event.preventDefault();
      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          alert('Successfully logged out');
          window.location.href = 'index.html';
        } else {
          alert('Logout failed. Please try again.');
        }
      } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  if (recommendationButton) {
    recommendationButton.addEventListener('click', async () => {
      const recommendationsDiv = document.getElementById('recommendations');
      recommendationsDiv.innerHTML = '';

      try {
        console.log('Fetching recommendations for user ID:', userId);
        const response = await fetch(
          `http://127.0.0.1:8000/api/userdata/${userId}/recommendations`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (Array.isArray(data.recommendations)) {
          data.recommendations.forEach(game => {
            const gameContainer = document.createElement('div');
            for (const [key, value] of Object.entries(game)) {
              const pTag = document.createElement('p');
              pTag.textContent = `${key}: ${value}`;
              gameContainer.appendChild(pTag);
            }
            recommendationsDiv.appendChild(gameContainer);
            recommendationsDiv.appendChild(document.createElement('hr'));
          });
        } else {
          throw new Error('Expected an array of games in data.recommendations');
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        recommendationsDiv.innerHTML = `<p>Error fetching recommendations. Please try again later.</p>`;
      }
    });
  }

  if (googleLoginButton) {
    googleLoginButton.addEventListener('click', () => {
      window.location.href = 'http://127.0.0.1:8000/api/auth/google';
    });
  }

  const updateProfileInformation = async () => {
    const currentPath = window.location.pathname.split('/').pop();
    if (currentPath !== 'view-profile.html') return;

    if (!userId) {
      console.error(
        'User ID is not available. Cannot fetch profile information.'
      );
      return;
    }
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${userId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const user = await response.json();
        console.log(user.profile_pic);
        console.log('user created at ' + user);
        document.getElementById('username').textContent = user.name;
        document.getElementById('user-username').textContent = user.name;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-member-since').textContent = new Date(
          user.created_at
        ).toLocaleDateString();
      } else {
        console.error('Failed to fetch user profile information');
      }
    } catch (error) {
      console.error('Error fetching user profile information:', error);
    }
  };

  await checkAuthStatus();
  await updateProfileInformation();
  const profilePicUpload = document.getElementById('profilePicUpload');
  const profilePic = document.getElementById('profilePic');

  if (profilePicUpload && profilePic) {
    profilePicUpload.addEventListener('change', async function (event) {
      console.log('File selected');
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          console.log('Image loaded');
          profilePic.src = e.target.result;
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('profilePicture', file);
        formData.append('userId', userId);

        try {
          const response = await fetch(
            'http://127.0.0.1:8000/api/users/upload-profile-picture',
            {
              method: 'POST',
              body: formData,
              credentials: 'include',
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log('Profile picture uploaded successfully', data);
            alert('Profile picture uploaded successfully!');
          } else {
            console.error(
              'Error uploading profile picture:',
              response.statusText
            );
            alert('Failed to upload profile picture. Please try again.');
          }
        } catch (error) {
          console.error('Error uploading profile picture:', error);
          alert('An error occurred while uploading. Please try again.');
        }
      }
    });
  }

  if (searchButton && searchInput && gameGrid) {
    searchButton.addEventListener('click', async () => {
      const searchTerm = searchInput.value;
      if (searchTerm) {
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/api/games/search?query=${encodeURIComponent(
              searchTerm
            )}`,
            { credentials: 'include' }
          );

          const games = await response.json();

          console.log(games);

          gameGrid.innerHTML = '';

          games.forEach(game => {
            const gameTile = document.createElement('div');
            gameTile.className = 'game-tile';

            const gameImage = document.createElement('img');
            gameImage.src = game.cover_image
              ? game.cover_image
              : 'gameinfo_testimage.png';
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
});
