/* ============================================================
   Learning Life — main.js  Luxury Polish v3
   Behaviors:
   - Premium transparent→frosted-scrolled nav
   - Immersive mobile nav with real focus trap
   - Scroll reveal: 860ms, cubic-bezier(0.16,1,0.3,1), staggered
   - Parallax: factor 0.06, rAF-throttled, mobile+reduced-motion off
   - Smooth scroll with nav offset
   - All motion respects prefers-reduced-motion
   ============================================================ */
(function () {
  'use strict';

  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileQuery = window.matchMedia('(max-width: 768px)');
  var PRM = reduceMotionQuery.matches;
  var isMobile = mobileQuery.matches;
  var savedScrollY = 0;

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function handlePreferenceChange() {
    PRM = reduceMotionQuery.matches;
    isMobile = mobileQuery.matches;
  }

  if (typeof reduceMotionQuery.addEventListener === 'function') {
    reduceMotionQuery.addEventListener('change', handlePreferenceChange);
    mobileQuery.addEventListener('change', handlePreferenceChange);
  } else if (typeof reduceMotionQuery.addListener === 'function') {
    reduceMotionQuery.addListener(handlePreferenceChange);
    mobileQuery.addListener(handlePreferenceChange);
  }

  var nav = qs('.site-nav');
  if (nav) {
    nav.classList.add('transparent');
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      nav.classList.toggle('scrolled', y > 60);
      nav.classList.toggle('transparent', y <= 60);
    }, { passive: true });
  }

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
    savedScrollY = window.scrollY;
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger && hamburger.setAttribute('aria-expanded', 'true');
    setTimeout(function () { closeBtn && closeBtn.focus(); }, 80);
  }

  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
    hamburger && hamburger.focus();
    if (window.scrollY !== savedScrollY) {
      window.scrollTo({ top: savedScrollY, behavior: 'auto' });
    }
  }

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
  mobileNav && mobileNav.addEventListener('click', function (e) {
    if (e.target === mobileNav) closeNav();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) closeNav();
  });
  mobileNav && qsa('a', mobileNav).forEach(function (a) {
    a.addEventListener('click', closeNav);
  });

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

  var heroBg = qs('.hero-bg');
  if (heroBg) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (PRM || isMobile) return;
      if (!ticking) {
        requestAnimationFrame(function () {
          var offset = Math.min(window.scrollY * 0.06, 40);
          heroBg.style.transform = 'scale(1.04) translateY(' + offset + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

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

}());
