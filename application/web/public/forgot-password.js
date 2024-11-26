document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
  
    forgotPasswordForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission
  
      const email = event.target.email.value;
  
      if (!email) {
        alert('Please enter a valid email address.');
        return;
      }
  
      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
  
        if (response.ok) {
          alert('Password reset link sent successfully. Check your email.');
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error sending password reset link:', error);
        alert('An unexpected error occurred.');
      }
    });
  });
  