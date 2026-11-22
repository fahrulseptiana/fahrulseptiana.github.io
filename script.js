/* ============================================================
   Playful portfolio interactions in vanilla JS
   Each function owns one behaviour. No framework, no build step.
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasObserver = "IntersectionObserver" in window;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initIcons() {
    if (window.feather) window.feather.replace();
  }

  function initScrollReset() {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (!navigation || navigation.type !== "reload" || window.location.hash) return;

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    window.addEventListener("load", () => window.scrollTo(0, 0), { once: true });
  }

  function initHeader() {
    const header = $(".site-header");
    if (!header) return;

    const update = () => header.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initMenu() {
    const toggle = $("#nav-toggle");
    const links = $("#nav-links");
    if (!toggle || !links) return;

    const close = () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };

    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    $$("a", links).forEach((link) => link.addEventListener("click", close));
    document.addEventListener("click", (event) => {
      if (!links.contains(event.target) && !toggle.contains(event.target)) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  function initActiveLinks() {
    const anchors = $$(".nav-link");
    const sections = anchors
      .map((link) => $(link.getAttribute("href")))
      .filter(Boolean);
    if (!hasObserver || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          anchors.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
  }

  function initReveal() {
    const items = $$(".reveal");
    if (reduceMotion || !hasObserver) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const siblings = $$(".reveal", entry.target.parentElement);
          entry.target.style.transitionDelay = Math.max(0, siblings.indexOf(entry.target)) * 80 + "ms";
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((item) => observer.observe(item));
  }

  function countUp(element) {
    const target = parseInt(element.dataset.count, 10) || 0;
    if (reduceMotion) {
      element.textContent = target;
      return;
    }

    const duration = 1300;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      element.textContent = Math.round(target * easeOut(progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = $$("[data-count]");
    if (!hasObserver) {
      counters.forEach(countUp);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          instance.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((counter) => observer.observe(counter));
  }

  function initRotator() {
    const rotator = $(".highlight");
    if (!rotator || reduceMotion) return;

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

  function initMagneticButtons() {
    if (reduceMotion || !canHover) return;

    $$(".magnetic").forEach((button) => {
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

  function initCardTilt() {
    if (reduceMotion || !canHover) return;

    $$(".tilt").forEach((card) => {
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

  function initFooterYear() {
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  [
    initIcons,
    initScrollReset,
    initHeader,
    initMenu,
    initActiveLinks,
    initReveal,
    initCounters,
    initRotator,
    initMagneticButtons,
    initCardTilt,
    initFooterYear
  ].forEach((init) => init());
})();
