/* ============================================================
   Learning Life — main.js  v2
   Fixes: hamburger animation, nav scroll offset, mobile close,
          body scroll lock, escape key, focus trap in mobile nav
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* ── Sticky Nav: transparent → scrolled ── */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    nav.classList.add('transparent');
    window.addEventListener('scroll', function () {
      const scrolled = window.scrollY > 60;
      nav.classList.toggle('scrolled', scrolled);
      nav.classList.toggle('transparent', !scrolled);
    }, { passive: true });
  }

  /* ── Mobile Nav ── */
  const hamburger  = document.querySelector('.nav-hamburger');
  const mobileNav  = document.querySelector('.mobile-nav');
  const closeBtn   = document.querySelector('.mobile-nav-close');

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger && hamburger.setAttribute('aria-expanded', 'true');
    // Animate hamburger to X
    if (hamburger) {
      const spans = hamburger.querySelectorAll('span');
      if (spans[0]) spans[0].style.cssText = 'transform:translateY(7px) rotate(45deg)';
      if (spans[1]) spans[1].style.cssText = 'opacity:0; transform:scaleX(0)';
      if (spans[2]) spans[2].style.cssText = 'transform:translateY(-7px) rotate(-45deg)';
    }
    // Focus first link
    const first = mobileNav.querySelector('a');
    if (first) setTimeout(() => first.focus(), 50);
  }

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
    // Reset hamburger
    if (hamburger) {
      hamburger.querySelectorAll('span').forEach(s => s.style.cssText = '');
    }
    hamburger && hamburger.focus();
  }

  if (hamburger) hamburger.addEventListener('click', openMobileNav);
  if (closeBtn)  closeBtn.addEventListener('click', closeMobileNav);

  // Close on any nav link click
  mobileNav && mobileNav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', closeMobileNav)
  );

  // Escape key closes nav
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) {
      closeMobileNav();
    }
  });

  // Click outside nav closes it
  mobileNav && mobileNav.addEventListener('click', function (e) {
    if (e.target === mobileNav) closeMobileNav();
  });

  /* ── Scroll Reveal — staggered delays ── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, parseInt(entry.target.dataset.delay || 0, 10));
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (el, i) {
      if (!el.dataset.delay) el.dataset.delay = String(Math.min(i * 75, 450));
      io.observe(el);
    });
  }

  /* ── Hero Parallax ── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', function () {
      heroBg.style.transform = 'scale(1.05) translateY(' + window.scrollY * 0.18 + 'px)';
    }, { passive: true });
  }

  /* ── Smooth Scroll — offset for fixed nav ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const navH = nav ? nav.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── FAQ Accordion ── */
  document.querySelectorAll('.faq-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const answer = this.nextElementSibling;
      const isOpen = this.getAttribute('aria-expanded') === 'true';

      // Close all
      document.querySelectorAll('.faq-btn').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        const a = b.nextElementSibling;
        if (a) a.classList.remove('open');
      });

      // Toggle this one
      if (!isOpen) {
        this.setAttribute('aria-expanded', 'true');
        if (answer) answer.classList.add('open');
      }
    });
  });

  /* ── Video Facades ── */
  document.querySelectorAll('.video-facade').forEach(function (facade) {
    function loadVideo() {
      const videoId = facade.dataset.videoid;
      if (!videoId) return;
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.title = facade.getAttribute('aria-label') || 'Video';
      facade.innerHTML = '';
      facade.appendChild(iframe);
      facade.classList.add('playing');
    }
    facade.addEventListener('click', loadVideo);
    facade.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadVideo(); }
    });
  });

});
