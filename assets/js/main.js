(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

(function () {
  var cta = document.getElementById("mobile-cta");
  if (!cta) return;
  var shown = false;
  function onScroll() {
    var should = window.scrollY > 300;
    if (should && !shown) { cta.classList.add("visible"); cta.setAttribute("aria-hidden", "false"); shown = true; }
    else if (!should && shown) { cta.classList.remove("visible"); cta.setAttribute("aria-hidden", "true"); shown = false; }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

(function () {
  if (typeof gtag !== "function") return;
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) gtag("event", "click_to_call", { phone: href.slice(4) });
    else if (href.indexOf("mailto:") === 0) gtag("event", "click_email");
  });
})();

(function () {
  var forms = document.querySelectorAll('form[action^="https://formsubmit.co/"]');
  forms.forEach(function (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!this.reportValidity()) return;
      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }

      try {
        var data = Object.fromEntries(new FormData(form).entries());
        var res = await fetch(form.action, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        });
        var result = await res.json();
        if (result.success) {
          if (typeof gtag === "function") gtag("event", "generate_lead", { form_id: form.id || "lead" });
          var msg = document.createElement("div");
          msg.style.cssText = "padding: 1.5rem; background: #fff; border: 2px solid #16a34a;";
          msg.innerHTML = '<h3 style="color: #16a34a; margin-bottom: 0.5rem;">Thanks, ' + escapeHtml(data.name || "") + '!</h3><p>We will call you at ' + escapeHtml(data.phone || "") + ' within 2 business hours.</p>';
          form.replaceWith(msg);
        } else {
          showError(form, btn, originalText);
        }
      } catch (err) {
        showError(form, btn, originalText);
      }
    });
  });

  function showError(form, btn, originalText) {
    var existing = form.querySelector(".form-error");
    if (existing) existing.remove();
    var err = document.createElement("p");
    err.className = "form-error";
    err.style.cssText = "color: #dc2626; margin-bottom: 1rem; font-weight: 600;";
    err.textContent = "Something went wrong. Please call (262) 555-0148 instead.";
    form.insertBefore(err, form.firstChild);
    if (btn) { btn.disabled = false; btn.textContent = originalText; }
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
})();
