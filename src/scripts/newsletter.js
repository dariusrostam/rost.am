// Progressive enhancement for the Buttondown embed form (NewsletterForm.astro).
// Without this script the form still works via its `target="popupwindow"`
// attribute alone. With it, submission happens via fetch and the result is
// shown inline. TODO(Darius): once the real Buttondown account is live,
// confirm the embed-subscribe endpoint's success/error response shape and
// adjust the status branch below if needed -- this was written defensively
// (treat any 2xx as success) without a live account to test against.
document.querySelectorAll('[data-newsletter-form]').forEach((form) => {
  async function onSubmit(event) {
    const honeypot = form.querySelector('input[name="honeypot"]');
    if (honeypot && honeypot.value) return; // let a filled honeypot fall through as a normal (bot) submit

    event.preventDefault();
    const status = form.parentElement.querySelector('[data-newsletter-status]');
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        showStatus(status, 'Thanks — check your inbox to confirm.', false);
        form.reset();
      } else {
        showStatus(status, 'Something went wrong. Please try again.', true);
      }
    } catch {
      // Network/CORS failure: fall back to the plain-form behaviour.
      form.removeEventListener('submit', onSubmit);
      form.submit();
    } finally {
      submitButton.disabled = false;
    }
  }

  form.addEventListener('submit', onSubmit);
});

function showStatus(el, message, isError) {
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  el.style.color = isError ? 'var(--color-focus-ring)' : 'var(--color-accent)';
}
