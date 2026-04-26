/* ============================================================
   Learning Life — main.js
   Behaviors:
   - Premium transparent → frosted scrolled nav
   - Mobile nav with focus trap, click-outside close, and focus return
   - Scroll reveal with calm staggered timing
   - Parallax for homepage hero only, disabled on mobile and reduced motion
   - Smooth scroll with nav offset
   - FAQ accordion
   - Payment portal copy buttons
   - Optional video facades
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileQuery = window.matchMedia('(max-width: 768px)');
  var reducedMotion = prefersReducedMotion.matches;
  var isMobile = mobileQuery.matches;

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', function (e) { reducedMotion = e.matches; });
  } else if (typeof prefersReducedMotion.addListener === 'function') {
    prefersReducedMotion.addListener(function (e) { reducedMotion = e.matches; });
  }

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', function (e) {
      isMobile = e.matches;
      if (!e.matches) {
        closeNav();
        closeMobileServices();
      }
      closeDesktopDropdown();
    });
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(function (e) {
      isMobile = e.matches;
      if (!e.matches) {
        closeNav();
        closeMobileServices();
      }
      closeDesktopDropdown();
    });
  }

  /* ── Sticky nav ─────────────────────────────────────────── */
  var nav = qs('.site-nav');
  function updateNavState() {
    if (!nav) return;
    var scrolled = window.scrollY > 60;
    nav.classList.toggle('scrolled', scrolled);
    nav.classList.toggle('transparent', !scrolled);
  }
  if (nav) {
    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });
  }

  /* ── Desktop dropdown and mobile nav ─────────────────── */
  var desktopDropdown = qs('.nav-dropdown');
  var dropdownToggle = qs('.nav-dropdown-toggle');
  var dropdownMenu = qs('.nav-dropdown-menu');
  var hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
  var hamburger = qs('.nav-hamburger');
  var mobileNav = qs('.mobile-nav');
  var closeBtn = qs('.mobile-nav-close');
  var mobileServicesGroup = qs('.mobile-nav-group');
  var mobileServicesToggle = qs('.mobile-nav-group-toggle', mobileNav);
  var previousFocus = null;

  function openDesktopDropdown() {
    if (!desktopDropdown || !dropdownToggle) return;
    desktopDropdown.classList.add('open');
    dropdownToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDesktopDropdown() {
    if (!desktopDropdown || !dropdownToggle) return;
    desktopDropdown.classList.remove('open');
    dropdownToggle.setAttribute('aria-expanded', 'false');
  }

  function openMobileServices() {
    if (!mobileServicesGroup || !mobileServicesToggle) return;
    mobileServicesGroup.classList.add('open');
    mobileServicesToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileServices() {
    if (!mobileServicesGroup || !mobileServicesToggle) return;
    mobileServicesGroup.classList.remove('open');
    mobileServicesToggle.setAttribute('aria-expanded', 'false');
  }

  function getFocusableWithin(container) {
    if (!container) return [];
    return qsa('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', container)
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function openNav() {
    if (!mobileNav) return;
    closeDesktopDropdown();
    previousFocus = document.activeElement;
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
    window.setTimeout(function () {
      if (closeBtn) closeBtn.focus();
    }, 90);
  }

  function closeNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    closeMobileServices();
    document.body.style.overflow = '';
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    } else if (hamburger) {
      hamburger.focus();
    }
  }

  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', function (event) {
      event.stopPropagation();
      if (desktopDropdown && desktopDropdown.classList.contains('open')) {
        closeDesktopDropdown();
      } else {
        openDesktopDropdown();
      }
    });

    dropdownToggle.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openDesktopDropdown();
        var firstDropdownLink = qs('a', dropdownMenu);
        if (firstDropdownLink) firstDropdownLink.focus();
      }
      if (event.key === 'Escape') {
        closeDesktopDropdown();
      }
    });
  }

  var dropdownCloseTimer = null;

  if (desktopDropdown) {
    desktopDropdown.addEventListener('mouseenter', function () {
      if (!isMobile && hoverCapable.matches) {
        window.clearTimeout(dropdownCloseTimer);
        openDesktopDropdown();
      }
    });

    desktopDropdown.addEventListener('mouseleave', function () {
      if (!isMobile && hoverCapable.matches) {
        window.clearTimeout(dropdownCloseTimer);
        dropdownCloseTimer = window.setTimeout(function () {
          closeDesktopDropdown();
        }, 140);
      }
    });

    desktopDropdown.addEventListener('focusout', function () {
      window.setTimeout(function () {
        if (desktopDropdown && !desktopDropdown.contains(document.activeElement)) {
          closeDesktopDropdown();
        }
      }, 0);
    });
  }

  if (dropdownMenu) {
    dropdownMenu.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDesktopDropdown();
        if (dropdownToggle) dropdownToggle.focus();
      }
    });
  }

  document.addEventListener('click', function (event) {
    if (desktopDropdown && desktopDropdown.classList.contains('open') && !desktopDropdown.contains(event.target)) {
      closeDesktopDropdown();
    }
  });

  if (hamburger) hamburger.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (mobileServicesToggle) {
    mobileServicesToggle.addEventListener('click', function () {
      if (mobileServicesGroup && mobileServicesGroup.classList.contains('open')) {
        closeMobileServices();
      } else {
        openMobileServices();
      }
    });
  }

  if (mobileNav) {
    mobileNav.addEventListener('click', function (event) {
      if (event.target === mobileNav) closeNav();
    });

    mobileNav.addEventListener('keydown', function (event) {
      if (!mobileNav.classList.contains('open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeNav();
        return;
      }

      if (event.key !== 'Tab') return;
      var focusable = getFocusableWithin(mobileNav);
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    qsa('a', mobileNav).forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (mobileNav && mobileNav.classList.contains('open')) {
        closeNav();
        return;
      }
      if (desktopDropdown && desktopDropdown.classList.contains('open')) {
        closeDesktopDropdown();
      }
    }
  });
  /* ── Scroll reveal ──────────────────────────────────────── */
  var revealItems = qsa('.reveal');
  if (revealItems.length) {
    if (reducedMotion) {
      revealItems.forEach(function (item) { item.classList.add('visible'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var delay = Math.min(parseInt(entry.target.dataset.delay || '0', 10), 560);
          window.setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });

      revealItems.forEach(function (item, index) {
        if (!item.dataset.delay) item.dataset.delay = String(Math.min(index * 120, 560));
        revealObserver.observe(item);
      });
    }
  }

  /* ── Parallax hero ──────────────────────────────────────── */
  var heroBg = qs('.hero-bg');
  var parallaxTicking = false;

  function applyParallax() {
    if (!heroBg) return;
    if (reducedMotion || isMobile) {
      heroBg.style.transform = 'scale(1.04) translateY(0)';
      return;
    }
    var offset = Math.min(window.scrollY * 0.06, 40);
    heroBg.style.transform = 'scale(1.04) translateY(' + offset + 'px)';
  }

  if (heroBg) {
    applyParallax();
    window.addEventListener('scroll', function () {
      if (parallaxTicking) return;
      parallaxTicking = true;
      window.requestAnimationFrame(function () {
        applyParallax();
        parallaxTicking = false;
      });
    }, { passive: true });

    window.addEventListener('resize', function () {
      applyParallax();
    }, { passive: true });
  }

  /* ── Smooth scroll ──────────────────────────────────────── */
  qsa('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var id = this.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      var navHeight = nav ? nav.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
      window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ── FAQ accordion ──────────────────────────────────────── */
  qsa('.faq-btn').forEach(function (button) {
    button.addEventListener('click', function () {
      var answer = this.nextElementSibling;
      var isOpen = this.getAttribute('aria-expanded') === 'true';

      qsa('.faq-btn').forEach(function (otherButton) {
        otherButton.setAttribute('aria-expanded', 'false');
        var otherAnswer = otherButton.nextElementSibling;
        if (otherAnswer) otherAnswer.classList.remove('open');
      });

      if (!isOpen) {
        this.setAttribute('aria-expanded', 'true');
        if (answer) answer.classList.add('open');
      }
    });
  });

  /* ── Payment portal copy actions ────────────────────────── */
  var copyFeedback = qs('.copy-feedback');
  var copyResetTimer = null;

  function setCopyFeedback(message) {
    if (!copyFeedback) return;
    copyFeedback.textContent = message;
    window.clearTimeout(copyResetTimer);
    copyResetTimer = window.setTimeout(function () {
      copyFeedback.textContent = '';
    }, 2400);
  }

  qsa('.copy-trigger[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = this.getAttribute('data-copy');
      var label = this.getAttribute('data-copy-label') || 'payment detail';
      if (!value) return;

      var onSuccess = function () {
        button.classList.add('is-copied');
        button.textContent = 'Copied';
        setCopyFeedback(label.charAt(0).toUpperCase() + label.slice(1) + ' copied.');
        window.setTimeout(function () {
          button.classList.remove('is-copied');
          button.textContent = button.getAttribute('data-default-label') || 'Copy';
        }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(onSuccess).catch(function () {
          setCopyFeedback('Unable to copy automatically. Please copy it manually.');
        });
      } else {
        setCopyFeedback('Unable to copy automatically. Please copy it manually.');
      }
    });
  });

  /* ── Optional video facades ─────────────────────────────── */
  qsa('.video-facade').forEach(function (facade) {
    function loadVideo() {
      var id = facade.dataset.videoid;
      if (!id) return;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.title = facade.getAttribute('aria-label') || 'Video';
      iframe.style.position = 'absolute';
      iframe.style.inset = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      facade.innerHTML = '';
      facade.appendChild(iframe);
      facade.classList.add('playing');
    }

    facade.addEventListener('click', loadVideo);
    facade.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        loadVideo();
      }
    });
  });
}());
