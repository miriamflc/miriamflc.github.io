(function () {
  var root = document.documentElement;

  // Mobile menu
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    document.querySelectorAll('.v-m [data-menu-toggle]').forEach(function (b) {
      if (b.tagName === 'BUTTON') b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-menu-toggle]');
    if (t) { setMenu(!root.classList.contains('menu-open')); return; }
    if (root.classList.contains('menu-open') && e.target.closest('.mo a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && root.classList.contains('menu-open')) setMenu(false);
  });

  // Cursor dot (desktop, mouse only)
  var canHover = window.matchMedia('(hover: hover)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canHover) {
    document.querySelectorAll('[data-cursor-root]').forEach(function (area) {
      var dot = area.querySelector('.curdot');
      if (!dot) return;
      area.addEventListener('mousemove', function (e) {
        var over = e.target.closest && e.target.closest('a, button, input, textarea, select, [role="button"], .zw, .pr');
        dot.style.transform = 'translate(' + (e.clientX - 7) + 'px,' + (e.clientY - 7) + 'px)';
        dot.style.opacity = over ? '0' : '1';
      });
      area.addEventListener('mouseleave', function () { dot.style.opacity = '0'; });
    });
  }

  // Interactive experiences: video plays on hover, audio button follows the cursor
  document.querySelectorAll('[data-video-card]').forEach(function (card) {
    var video = card.querySelector('[data-hover-video]');
    var btn = card.querySelector('[data-audio-toggle]');
    var label = btn && btn.querySelector('[data-audio-label]');
    if (!video) return;
    var soundOn = false;
    function setSound(on) {
      soundOn = on;
      video.muted = !on;
      if (label) label.textContent = on ? 'Mute audio' : 'Play audio';
      if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    if (canHover) {
      card.addEventListener('mouseenter', function () {
        setSound(false);
        video.currentTime = 0;
        var p = video.play(); if (p && p.catch) p.catch(function () {});
      });
      card.addEventListener('mouseleave', function () { video.pause(); });
      card.addEventListener('mousemove', function (e) {
        if (!btn) return;
        var r = card.getBoundingClientRect();
        btn.style.transform = 'translate(calc(' + (e.clientX - r.left) + 'px - 50%), calc(' + (e.clientY - r.top) + 'px - 50%))';
      });
    }
    if (btn) btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setSound(!soundOn);
      if (soundOn && video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    });
  });

  // Touch screens: no hover, so play the videos (muted) while they are on screen
  if (!canHover && !reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.v-m [data-hover-video]').forEach(function (v) { io.observe(v); });
  }

  // Respect reduced motion for autoplaying loops
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
})();
