function handleAvailability(input) {
  const card = input.closest('.availability-card');
  if (!card) return;

  if (input.checked) {
    card.style.background = 'var(--accent-subtle)';
    card.style.borderColor = 'var(--accent-border)';
  } else {
    card.style.background = 'var(--surface-2)';
    card.style.borderColor = 'var(--border)';
  }
}

(() => {
  document.querySelectorAll('.toggle-row').forEach((row) => {
    row.addEventListener('click', (event) => {
      if (event.target.closest('label') || event.target.tagName === 'INPUT') return;
      const checkbox = row.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.click();
    });
  });
})();
