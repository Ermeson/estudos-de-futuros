(function () {
  "use strict";

  /* ---------- Theme ---------- */
  var THEME_KEY = "ef-theme";
  var themeToggle = document.getElementById("themeToggle");
  var root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function currentEffectiveTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  (function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) { /* storage unavailable */ }
    applyTheme(stored === "dark" ? "dark" : "light");
  })();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentEffectiveTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage unavailable */ }
    });
  }

  /* ---------- Sidebar collapse ---------- */
  var COLLAPSE_KEY = "ef-sidebar-collapsed";
  var sidebarCollapseBtn = document.getElementById("sidebarCollapse");
  var sidebarEl = document.getElementById("sidebar");

  function applySidebarCollapsed(collapsed) {
    if (!sidebarEl || !sidebarCollapseBtn) return;
    sidebarEl.classList.toggle("is-collapsed", collapsed);
    sidebarCollapseBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    sidebarCollapseBtn.setAttribute("aria-label", collapsed ? "Expandir menu" : "Recolher menu");
  }

  (function initSidebarCollapse() {
    var stored = null;
    try { stored = localStorage.getItem(COLLAPSE_KEY); } catch (e) { /* storage unavailable */ }
    applySidebarCollapsed(stored === "1");
  })();

  if (sidebarCollapseBtn) {
    sidebarCollapseBtn.addEventListener("click", function () {
      var next = !sidebarEl.classList.contains("is-collapsed");
      applySidebarCollapsed(next);
      try { localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0"); } catch (e) { /* storage unavailable */ }
    });
  }

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.getElementById("progressBar");
  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById("backToTop");
  function updateBackToTop() {
    if (!backToTop) return;
    if ((window.scrollY || document.documentElement.scrollTop) > 480) {
      backToTop.classList.add("is-visible");
    } else {
      backToTop.classList.remove("is-visible");
    }
  }
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateProgress();
        updateBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  updateProgress();
  updateBackToTop();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navBackdrop = document.getElementById("navBackdrop");
  var sidebar = document.getElementById("sidebar");

  function openNav() {
    sidebar.classList.add("is-open");
    navBackdrop.classList.add("is-visible");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Fechar navegação");
  }
  function closeNav() {
    sidebar.classList.remove("is-open");
    navBackdrop.classList.remove("is-visible");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir navegação");
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      if (sidebar.classList.contains("is-open")) closeNav(); else openNav();
    });
  }
  if (navBackdrop) navBackdrop.addEventListener("click", closeNav);

  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  tocLinks.forEach(function (link) {
    link.addEventListener("click", function () { closeNav(); });
  });

  /* ---------- Scrollspy ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll(".unit-section[id]"));
  var linkByHash = {};
  tocLinks.forEach(function (link) {
    linkByHash[link.getAttribute("href")] = link;
  });

  if ("IntersectionObserver" in window && sections.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkByHash["#" + entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          tocLinks.forEach(function (l) { l.classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

    sections.forEach(function (section) { spyObserver.observe(section); });
  }

  /* ---------- Reveal on scroll ---------- */
  if ("IntersectionObserver" in window && sections.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    sections.forEach(function (section) { revealObserver.observe(section); });
  } else {
    sections.forEach(function (section) { section.classList.add("is-visible"); });
  }

  /* ---------- YouTube facade embed ----------
     Set the video ID below (or via the data-youtube-id attribute on
     .video-embed in index.html) to enable playback for
     "Vídeo: A Roda do Futuro". Example: "dQw4w9WgXcQ"
  */
  var DEFAULT_YOUTUBE_ID = "";

  var videoEmbed = document.querySelector(".video-embed");
  if (videoEmbed) {
    var playButton = videoEmbed.querySelector(".video-play");
    var videoId = videoEmbed.getAttribute("data-youtube-id") || DEFAULT_YOUTUBE_ID;

    if (playButton) {
      playButton.addEventListener("click", function () {
        if (!videoId) {
          window.alert("Vídeo ainda não configurado. Adicione o ID do YouTube em data-youtube-id (index.html) ou DEFAULT_YOUTUBE_ID (js/main.js).");
          return;
        }
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(videoId) + "?autoplay=1&rel=0";
        iframe.title = "A Roda do Futuro";
        iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        iframe.allowFullscreen = true;
        videoEmbed.appendChild(iframe);
        videoEmbed.classList.add("is-playing");
      });
    }
  }
})();
