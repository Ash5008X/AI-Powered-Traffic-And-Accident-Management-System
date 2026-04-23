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

      const firstName = form.querySelector('#firstName')?.value.trim();
      const lastName = form.querySelector('#lastName')?.value.trim();
      const email = form.querySelector('#email')?.value.trim();
      const password = form.querySelector('#password')?.value;
      const confirmPassword = form.querySelector('#confirmPassword')?.value;
      const role = form.querySelector('input[name="role"]:checked')?.value || 'user';
      const submitButton = form.querySelector('button[type="submit"]');

      if (!firstName || !email || !password) {
        setFormMessage(form, 'First name, email, and password are required.');
        return;
      }

      if (password !== confirmPassword) {
        setFormMessage(form, 'Passwords do not match.');
        return;
      }

      if (submitButton) submitButton.disabled = true;
      setFormMessage(form, 'Creating account...', false);

      try {
        const payload = {
          name: `${firstName} ${lastName || ''}`.trim(),
          email,
          password,
          role
        };

        const { user } = await window.NexusAuth.register(payload);
        window.NexusAuth.redirectToDashboard(user.role);
      } catch (error) {
        setFormMessage(form, error.message || 'Unable to register.');
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  });
})();
