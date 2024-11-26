document.addEventListener('DOMContentLoaded', async () => {
    const teamContainer = document.querySelector('.profile-container');
  
    try {
      const response = await fetch('http://127.0.0.1:8000/api/about-us');
      const aboutUsData = await response.json();
  
      if (aboutUsData?.team) {
        const teamList = aboutUsData.team.map(
          (member) => `<li><strong>${member.name}:</strong> ${member.role}</li>`
        ).join('');
  
        teamContainer.innerHTML += `
          <h3>Our Team</h3>
          <ul>${teamList}</ul>
        `;
      }
    } catch (error) {
      console.error('Error fetching About Us data:', error);
    }
  });
  