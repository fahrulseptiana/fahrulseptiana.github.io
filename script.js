/* ============================================================
   Playful portfolio interactions in vanilla JS
   ============================================================ */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Feather icons ---------- */
  if (window.feather) window.feather.replace();

  /* ---------- Start at the top after a refresh ---------- */
  const navigationEntry = performance.getEntriesByType("navigation")[0];
  if (navigationEntry && navigationEntry.type === "reload" && !window.location.hash) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    window.addEventListener("load", () => window.scrollTo(0, 0), { once: true });
  }

  /* ---------- Sticky header shadow ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");

  const closeMenu = () => {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("click", (event) => {
      if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  const navAnchors = Array.from(document.querySelectorAll(".nav-link"));
  const sections = navAnchors
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navAnchors.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- Scroll reveal ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const siblings = Array.from(entry.target.parentElement.children).filter((el) => el.classList.contains("reveal"));
          const index = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = Math.max(0, index) * 80 + "ms";
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll("[data-count]");

  const runCounter = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    const duration = 1300;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * easeOut(progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((counter) => countObserver.observe(counter));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Rotating hero word ---------- */
  const rotator = document.querySelector(".highlight");
  if (rotator && !prefersReducedMotion) {
    const words = ["delightful", "thoughtful", "playful", "human"];
    let index = 0;
    window.setInterval(() => {
      rotator.classList.add("is-swapping");
      window.setTimeout(() => {
        index = (index + 1) % words.length;
        rotator.textContent = words[index];
        rotator.classList.remove("is-swapping");
      }, 260);
    }, 3000);
  }

  /* ---------- Magnetic buttons ---------- */
  if (!prefersReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.28;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener("mouseleave", () => {
        button.style.transform = "";
      });
    });
  }

  /* ---------- 3D tilt on cards ---------- */
  if (!prefersReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
