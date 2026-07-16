(function () {
  "use strict";

  var THEME_KEY = "kc-theme-override";
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    if (toggle) {
      var isDark = theme ? theme === "dark" : systemDark.matches;
      toggle.setAttribute("aria-pressed", String(isDark));
    }
  }

  var stored = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch (e) {
    stored = null;
  }
  applyTheme(stored);

  systemDark.addEventListener("change", function () {
    var current = null;
    try {
      current = localStorage.getItem(THEME_KEY);
    } catch (e) {
      current = null;
    }
    if (!current) {
      applyTheme(null);
    }
  });

  if (toggle) {
    toggle.addEventListener("click", function () {
      var isDarkNow = root.getAttribute("data-theme")
        ? root.getAttribute("data-theme") === "dark"
        : systemDark.matches;
      var next = isDarkNow ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* ignore */
      }
    });
  }

  // Clock — always Chicago time
  var clockEl = document.getElementById("clock");
  var formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago",
  });

  function updateClock() {
    if (clockEl) {
      clockEl.textContent = formatter.format(new Date());
    }
  }

  function scheduleClockTick() {
    updateClock();
    var now = new Date();
    var msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(function () {
      updateClock();
      setInterval(updateClock, 60000);
    }, msToNextMinute);
  }

  scheduleClockTick();

  // Copy email
  var copyBtn = document.getElementById("copy-email-btn");
  var toast = document.getElementById("copy-toast");
  var toastTimer = null;

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-default-label");
      var showConfirmation = function () {
        if (toast) {
          toast.classList.add("is-visible");
          clearTimeout(toastTimer);
          toastTimer = setTimeout(function () {
            toast.classList.remove("is-visible");
          }, 2000);
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showConfirmation, function () {
          fallbackCopy(email);
          showConfirmation();
        });
      } else {
        fallbackCopy(email);
        showConfirmation();
      }
    });
  }

  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      /* ignore */
    }
    document.body.removeChild(textarea);
  }

  // Fade-in on scroll
  var fadeEls = document.querySelectorAll(".fade-in");
  if ("IntersectionObserver" in window && fadeEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
