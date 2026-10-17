
/* ==========================================================
   ALKOS MEDIA — script.js (vanilla JS, no dependencies)
   ========================================================== */
(function () {
  "use strict";

  /* ---------- CONFIG: set your real contact destination here ----------
     Examples:  "https://forms.example.com/audit"
                "mailto:hello@yourdomain.com"
     While left as "#contact", buttons scroll to the lead form. */
  var CONTACT_URL = "#contact";

  document.querySelectorAll("[data-contact]").forEach(function (link) {
    // The final CTA button is already on #contact, so it only needs a real URL.
    if (CONTACT_URL === "#contact" && link.hasAttribute("data-contact-final")) return;
    link.setAttribute("href", CONTACT_URL);
    if (/^https?:/i.test(CONTACT_URL)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    }
  });

  /* ---------- Lead form (FormSubmit, AJAX submit) ---------- */
  var leadForm = document.getElementById("lead-form");
  if (leadForm) {
    var leadStatus = leadForm.querySelector(".lead-form__status");
    var leadButton = leadForm.querySelector("button[type=submit]");
    var leadSuccess = document.getElementById("lead-success");

    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      leadStatus.classList.remove("is-error");
      if (!leadForm.checkValidity()) {
        var invalid = leadForm.querySelector(":invalid");
        leadStatus.classList.add("is-error");
        leadStatus.textContent = "Please fill in your name, a valid email, and the service you need.";
        if (invalid) invalid.focus();
        return;
      }
      leadButton.disabled = true;
      leadStatus.textContent = "Sending…";
      fetch(leadForm.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(leadForm)
      }).then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      }).then(function (data) {
        if (!data || String(data.success) !== "true") throw new Error((data && data.message) || "Request failed");
        leadForm.reset();
        leadForm.hidden = true;
        leadSuccess.hidden = false;
        leadSuccess.focus();
      }).catch(function () {
        leadStatus.classList.add("is-error");
        leadStatus.textContent = "Something went wrong. Please try again or email sales@alkosmedia.com.";
      }).then(function () {
        leadButton.disabled = false;
      });
    });
  }

  /* ---------- Placeholder links (href="#") should not jump to top ---------- */
  document.querySelectorAll('a[data-placeholder]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var desktopQuery = window.matchMedia("(min-width: 60em)");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !e.target.closest(".site-header")) setMenu(false);
    });
    var onQueryChange = function () { if (desktopQuery.matches) setMenu(false); };
    if (desktopQuery.addEventListener) desktopQuery.addEventListener("change", onQueryChange);
    else desktopQuery.addListener(onQueryChange);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq__button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });

  /* ---------- Image fallbacks ----------
     Missing image  -> the <img> is hidden and the filename label shows.
     Missing optional image (testimonial) -> the whole figure is hidden.
     Logo -> text wordmark shows until the logo file loads. */
  function handleMissing(img) {
    img.classList.add("is-missing");
    var figure = img.closest(".media--optional");
    if (figure) figure.classList.add("is-empty");
  }

  function handleLoaded(img) {
    var brand = img.closest(".brand");
    if (brand) {
      img.setAttribute("alt", "");
      brand.classList.add("has-logo");
    }
  }

  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () { handleMissing(img); });
    img.addEventListener("load", function () { handleLoaded(img); });
    // Handle images that finished (or failed) before this script ran.
    if (img.complete) {
      if (img.naturalWidth === 0) handleMissing(img);
      else handleLoaded(img);
    }
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

  