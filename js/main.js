/* ============================================================
   Learning Life — main.js  Luxury Polish v2
   Behaviors:
   - Premium transparent→frosted-scrolled nav
   - Immersive mobile nav with real focus trap, entrance animation
   - Scroll reveal: 860ms, cubic-bezier(0.16,1,0.3,1), staggered
   - Parallax: factor 0.06, rAF-throttled, mobile+reduced-motion off
   - Smooth scroll with nav offset
   - FAQ accordion
   - Video facades (click-to-load)
   - All motion respects prefers-reduced-motion
   ============================================================ */
(function () {
  'use strict';

  var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 768px)').matches;

  /* ── Utility ─────────────────────────────────────────────── */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  /* ── 1. Sticky nav: transparent → premium frosted ────────── */
  var nav = qs('.site-nav');
  if (nav) {
    nav.classList.add('transparent');
    var lastScroll = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      nav.classList.toggle('scrolled', y > 60);
      nav.classList.toggle('transparent', y <= 60);
      lastScroll = y;
    }, { passive: true });
  }

  /* ── 2. Mobile nav with real focus trap ──────────────────── */
  var hamburger = qs('.nav-hamburger');
  var mobileNav = qs('.mobile-nav');
  var closeBtn  = qs('.mobile-nav-close');

  function focusable() {
    if (!mobileNav) return [];
    return qsa('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', mobileNav)
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function openNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger && hamburger.setAttribute('aria-expanded', 'true');
    // Delay focus so transition is visible first
    setTimeout(function () { closeBtn && closeBtn.focus(); }, 80);
  }

  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
    hamburger && hamburger.focus();
  }

  // Focus trap
  mobileNav && mobileNav.addEventListener('keydown', function (e) {
    if (!mobileNav.classList.contains('open')) return;
    var items = focusable();
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  hamburger && hamburger.addEventListener('click', openNav);
  closeBtn  && closeBtn.addEventListener('click', closeNav);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) closeNav();
  });
  mobileNav && qsa('a', mobileNav).forEach(function (a) {
    a.addEventListener('click', closeNav);
  });

  /* ── 3. Scroll reveal ────────────────────────────────────── */
  var reveals = qsa('.reveal');
  if (reveals.length) {
    if (PRM) {
      reveals.forEach(function (el) { el.classList.add('visible'); });
    } else {
      var revIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var delay = Math.min(parseInt(entry.target.dataset.delay || '0', 10), 560);
            setTimeout(function () { entry.target.classList.add('visible'); }, delay);
            revIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });

      reveals.forEach(function (el, i) {
        if (!el.dataset.delay) el.dataset.delay = String(Math.min(i * 120, 560));
        revIO.observe(el);
      });
    }
  }

  /* ── 4. Parallax ─────────────────────────────────────────── */
  var heroBg = qs('.hero-bg');
  if (heroBg && !PRM && !isMobile) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          // 0.06 factor per spec, clamped at 40px for very long pages
          var offset = Math.min(window.scrollY * 0.06, 40);
          heroBg.style.transform = 'scale(1.04) translateY(' + offset + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── 5. Smooth scroll with nav offset ───────────────────── */
  qsa('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        var navH = nav ? nav.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
        window.scrollTo({ top: top, behavior: PRM ? 'auto' : 'smooth' });
      }
    });
  });

  /* ── 6. FAQ accordion ────────────────────────────────────── */
  qsa('.faq-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var answer = this.nextElementSibling;
      var isOpen = this.getAttribute('aria-expanded') === 'true';
      // Close all
      qsa('.faq-btn').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        var a = b.nextElementSibling;
        if (a) a.classList.remove('open');
      });
      // Open this one
      if (!isOpen) {
        this.setAttribute('aria-expanded', 'true');
        if (answer) answer.classList.add('open');
      }
    });
  });

  /* ── 7. Video facades ────────────────────────────────────── */
  qsa('.video-facade').forEach(function (facade) {
    function load() {
      var id = facade.dataset.videoid;
      if (!id) return;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.title = facade.getAttribute('aria-label') || 'Video';
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;';
      facade.innerHTML = '';
      facade.appendChild(iframe);
      facade.classList.add('playing');
    }
    facade.addEventListener('click', load);
    facade.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); load(); }
    });
  });

}());
