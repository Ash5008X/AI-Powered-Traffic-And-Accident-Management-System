(() => {
  function tick() {
    const el = document.getElementById('clock');
    if (!el) return;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} UTC`;
  }

  tick();
  setInterval(tick, 1000);
})();
