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

  /* ---------- Text-size controls ----------
     Drives the --content-scale CSS custom property (see :root in
     style.css), which every content typography rule multiplies its
     font-size by. This keeps headings, eyebrows, hero text and card
     labels scaling together with the body copy, on every page.
  */
  var TEXT_SCALE_KEY = "ef-text-scale";
  var TEXT_SCALE_MIN = 0.85;
  var TEXT_SCALE_MAX = 1.3;
  var TEXT_SCALE_STEP = 0.1;
  var decreaseBtn = document.getElementById("textSizeDecrease");
  var increaseBtn = document.getElementById("textSizeIncrease");
  var currentTextScale = 1;

  function applyTextScale(scale) {
    scale = Math.round(Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, scale)) * 100) / 100;
    document.documentElement.style.setProperty("--content-scale", scale);
    if (decreaseBtn) decreaseBtn.setAttribute("aria-disabled", scale <= TEXT_SCALE_MIN ? "true" : "false");
    if (increaseBtn) increaseBtn.setAttribute("aria-disabled", scale >= TEXT_SCALE_MAX ? "true" : "false");
    return scale;
  }

  (function initTextScale() {
    var stored = null;
    try { stored = parseFloat(localStorage.getItem(TEXT_SCALE_KEY)); } catch (e) { /* storage unavailable */ }
    currentTextScale = applyTextScale(isNaN(stored) ? 1 : stored);
  })();

  function stepTextScale(delta) {
    currentTextScale = applyTextScale(currentTextScale + delta);
    try { localStorage.setItem(TEXT_SCALE_KEY, currentTextScale); } catch (e) { /* storage unavailable */ }
  }

  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", function () { stepTextScale(-TEXT_SCALE_STEP); });
  }
  if (increaseBtn) {
    increaseBtn.addEventListener("click", function () { stepTextScale(TEXT_SCALE_STEP); });
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
     Set the video ID via the data-youtube-id attribute on each
     .video-embed. Its thumbnail (cover art) is fetched automatically
     from YouTube and shown behind the play button.
  */
  var videoEmbeds = Array.prototype.slice.call(document.querySelectorAll(".video-embed"));

  function loadVideoThumbnail(videoEmbed, videoId) {
    var qualities = ["maxresdefault", "hqdefault"];
    (function tryQuality(index) {
      if (index >= qualities.length) return;
      var probe = new Image();
      probe.onload = function () {
        // YouTube returns a 120x90 grey placeholder when a quality isn't available.
        if (probe.naturalWidth === 120 && probe.naturalHeight === 90) {
          tryQuality(index + 1);
        } else {
          videoEmbed.style.backgroundImage = "url('https://img.youtube.com/vi/" + encodeURIComponent(videoId) + "/" + qualities[index] + ".jpg')";
        }
      };
      probe.onerror = function () { tryQuality(index + 1); };
      probe.src = "https://img.youtube.com/vi/" + encodeURIComponent(videoId) + "/" + qualities[index] + ".jpg";
    })(0);
  }

  videoEmbeds.forEach(function (videoEmbed) {
    var playButton = videoEmbed.querySelector(".video-play");
    var videoId = videoEmbed.getAttribute("data-youtube-id") || "";
    var videoTitle = videoEmbed.getAttribute("aria-label") || "Vídeo";

    if (videoId) loadVideoThumbnail(videoEmbed, videoId);

    if (playButton) {
      playButton.addEventListener("click", function () {
        if (!videoId) {
          window.alert("Vídeo ainda não configurado. Adicione o ID do YouTube em data-youtube-id.");
          return;
        }
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(videoId) + "?autoplay=1&rel=0";
        iframe.title = videoTitle;
        iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        iframe.allowFullscreen = true;
        videoEmbed.appendChild(iframe);
        videoEmbed.classList.add("is-playing");
      });
    }
  });
})();
