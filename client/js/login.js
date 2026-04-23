(() => {
  function setFormMessage(form, message, isError = true) {
    let messageNode = form.querySelector('.form-message');
    if (!messageNode) {
      messageNode = document.createElement('p');
      messageNode.className = 'form-message';
      messageNode.style.marginTop = '12px';
      messageNode.style.fontSize = '0.9rem';
      form.appendChild(messageNode);
    }
    messageNode.style.color = isError ? '#ff6b6b' : '#34d399';
    messageNode.textContent = message;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.auth-form');
    if (!form || !window.NexusAuth) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = form.querySelector('#email')?.value.trim();
      const password = form.querySelector('#password')?.value;
      const submitButton = form.querySelector('button[type="submit"]');

      if (!email || !password) {
        setFormMessage(form, 'Email and password are required.');
        return;
      }

      if (submitButton) submitButton.disabled = true;
      setFormMessage(form, 'Signing in...', false);

      try {
        const { user } = await window.NexusAuth.login(email, password);
        window.NexusAuth.redirectToDashboard(user.role);
      } catch (error) {
        setFormMessage(form, error.message || 'Unable to login.');
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  });
})();
