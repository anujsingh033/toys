(function () {
  const data = window.ToyShopData || { categories: [], products: [], testimonials: [] };
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionApi = window.Motion || window.motion || null;
  const state = {
    cart: [],
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initLoader() {
    window.addEventListener("load", () => {
      setTimeout(() => $("#loader")?.classList.add("is-hidden"), 450);
    });
  }

  function initTheme() {
    const root = document.documentElement;
    const toggle = $("#theme-toggle");
    const saved = localStorage.getItem("toy-theme");
    const useDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;

    root.classList.toggle("dark", useDark);
    updateThemeIcon();

    toggle?.addEventListener("click", () => {
      root.classList.toggle("dark");
      localStorage.setItem("toy-theme", root.classList.contains("dark") ? "dark" : "light");
      updateThemeIcon();
      bounce(toggle);
    });

    function updateThemeIcon() {
      const icon = toggle?.querySelector("i");
      if (!icon) return;
      icon.className = root.classList.contains("dark") ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  }

  function renderCategories() {
    const grid = $("#category-grid");
    if (!grid) return;
    grid.innerHTML = data.categories
      .map(
        (category) => `
          <article class="category-card reveal-up ${category.gradient}" tabindex="0">
            <span class="cat-icon"><i class="fa-solid ${category.icon}"></i></span>
            <h3>${category.title}</h3>
            <p>Curated picks for playful moments and thoughtful gifting.</p>
          </article>
        `
      )
      .join("");
  }

  function renderProducts() {
    const grid = $("#product-grid");
    if (!grid) return;
    grid.innerHTML = data.products
      .map(
        (product) => `
          <article class="product-card reveal-up tilt-card" data-product-id="${product.id}" tabindex="0">
            <div class="product-media">
              <span class="product-badge">${product.badge}</span>
              <button class="icon-button wishlist-btn" type="button" aria-label="Add ${product.title} to wishlist">
                <i class="fa-regular fa-heart"></i>
              </button>
              <img src="${product.image}" alt="${product.title}" loading="lazy" />
            </div>
            <div class="relative z-10 p-3">
              <div class="rating mt-3" aria-label="${product.rating} out of 5 stars">
                ${"&#9733;".repeat(product.rating)}${"&#9734;".repeat(5 - product.rating)}
              </div>
              <div class="mt-2 flex items-start justify-between gap-3">
                <h3 class="font-display text-2xl font-extrabold leading-none">${product.title}</h3>
                <div class="text-right">
                  <strong class="text-2xl font-black text-plum dark:text-white">$${product.price}</strong>
                  <del class="block text-sm font-bold text-slate-400">$${product.oldPrice}</del>
                </div>
              </div>
              <button class="add-cart candy-button mt-5 w-full" type="button" data-product-id="${product.id}">
                <i class="fa-solid fa-cart-plus"></i>
                Add to Cart
              </button>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderTestimonials() {
    const track = $("#testimonial-track");
    if (!track) return;
    const cards = [...data.testimonials, ...data.testimonials]
      .map(
        (review) => `
          <article class="review-card">
            <div class="flex items-center gap-3">
              <span class="avatar">${review.avatar}</span>
              <div>
                <h3 class="font-display text-2xl font-extrabold leading-none">${review.name}</h3>
                <p class="font-bold text-slate-500 dark:text-white/62">${review.role}</p>
              </div>
            </div>
            <div class="rating mt-4">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p class="mt-3 text-lg font-bold leading-relaxed">&quot;${review.quote}&quot;</p>
          </article>
        `
      )
      .join("");
    track.innerHTML = cards;
  }

  function initCart() {
    const cartOpen = $("#cart-open");
    const cartClose = $("#cart-close");
    const overlay = $("#cart-overlay");

    document.addEventListener("click", (event) => {
      const addButton = event.target.closest(".add-cart");
      const wishlist = event.target.closest(".wishlist-btn");

      if (addButton) {
        addToCart(addButton.dataset.productId);
        bounce(addButton);
      }

      if (wishlist) {
        wishlist.classList.toggle("is-loved");
        const icon = wishlist.querySelector("i");
        icon.className = wishlist.classList.contains("is-loved") ? "fa-solid fa-heart" : "fa-regular fa-heart";
        bounce(wishlist);
      }
    });

    cartOpen?.addEventListener("click", openCart);
    cartClose?.addEventListener("click", closeCart);
    overlay?.addEventListener("click", closeCart);

    renderCart();

    function addToCart(id) {
      const product = data.products.find((item) => item.id === id);
      if (!product) return;
      const line = state.cart.find((item) => item.id === id);
      if (line) line.qty += 1;
      else state.cart.push({ ...product, qty: 1 });
      renderCart();
      openCart();
    }

    function openCart() {
      document.body.classList.add("cart-open");
      $("#cart-sidebar")?.setAttribute("aria-hidden", "false");
    }

    function closeCart() {
      document.body.classList.remove("cart-open");
      $("#cart-sidebar")?.setAttribute("aria-hidden", "true");
    }
  }

  function renderCart() {
    const items = $("#cart-items");
    const count = $("#cart-count");
    const total = $("#cart-total");
    const qty = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const sum = state.cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    if (count) count.textContent = qty;
    if (total) total.textContent = `$${sum}`;
    if (!items) return;

    if (!state.cart.length) {
      items.innerHTML = '<div class="cart-empty"><p>Your bag is ready for a favorite toy.</p></div>';
      return;
    }

    items.innerHTML = state.cart
      .map(
        (item) => `
          <div class="cart-line">
            <img src="${item.image}" alt="" />
            <div>
              <h3 class="font-display text-xl font-extrabold leading-none">${item.title}</h3>
              <p class="font-bold text-slate-500 dark:text-white/60">Qty ${item.qty}</p>
            </div>
            <strong class="font-black text-plum dark:text-white">$${item.price * item.qty}</strong>
          </div>
        `
      )
      .join("");
  }

  function initMenu() {
    const toggle = $("#menu-toggle");
    const menu = $("#mobile-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
      toggle.querySelector("i").className = menu.classList.contains("is-open")
        ? "fa-solid fa-xmark"
        : "fa-solid fa-bars-staggered";
    });

    $$("#mobile-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        document.body.classList.remove("menu-open");
        toggle.querySelector("i").className = "fa-solid fa-bars-staggered";
      });
    });
  }

  function initCountdown() {
    const end = new Date();
    end.setDate(end.getDate() + ((7 - end.getDay()) % 7 || 7));
    end.setHours(23, 59, 59, 999);

    const nodes = {
      days: $("#days"),
      hours: $("#hours"),
      minutes: $("#minutes"),
      seconds: $("#seconds"),
    };

    function update() {
      const diff = Math.max(0, end.getTime() - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff / 3600000) % 24);
      const minutes = Math.floor((diff / 60000) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      nodes.days.textContent = String(days).padStart(2, "0");
      nodes.hours.textContent = String(hours).padStart(2, "0");
      nodes.minutes.textContent = String(minutes).padStart(2, "0");
      nodes.seconds.textContent = String(seconds).padStart(2, "0");
    }

    update();
    setInterval(update, 1000);
  }

  function initGSAP() {
    if (!window.gsap || prefersReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    const playReveal = (targets, options = {}) => {
      const elements = gsap.utils.toArray(targets).filter(Boolean);
      if (!elements.length) return;

      gsap.fromTo(
        elements,
        {
          autoAlpha: 0,
          y: options.y ?? 42,
          x: options.x ?? 0,
        },
        {
          autoAlpha: 1,
          y: 0,
          x: 0,
          duration: options.duration ?? 0.75,
          stagger: options.stagger ?? 0.09,
          ease: options.ease ?? "power3.out",
          clearProps: "opacity,visibility,transform",
        }
      );
    };

    const revealOnEnter = (trigger, targets, options = {}) => {
      const elements = gsap.utils.toArray(targets).filter(Boolean);
      if (!elements.length || !trigger) return;

      ScrollTrigger.create({
        trigger,
        start: options.start ?? "top 82%",
        once: true,
        onEnter: () => playReveal(elements, options),
      });
    };

    playReveal("#home .reveal-up", {
      y: 48,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
    });

    $$(".section-pad").forEach((section) => {
      revealOnEnter(section, section.querySelectorAll(".reveal-up"), {
        y: 44,
        duration: 0.8,
        stagger: 0.09,
        ease: "power3.out",
        start: "top 82%",
      });
    });

    revealOnEnter("#favorites", ".reveal-left", {
      x: -48,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      start: "top 78%",
    });

    revealOnEnter("#favorites", ".reveal-right", {
      x: 48,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      start: "top 78%",
    });

    gsap.to(".toy-float", {
      y: "random(-22, 22)",
      x: "random(-12, 12)",
      rotation: "random(-7, 7)",
      duration: "random(2.2, 4.2)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.22,
    });

    animateIfPresent(".hero-gallery", {
      yPercent: -5,
      ease: "none",
      scrollTrigger: {
        trigger: "#home",
        scrub: true,
        start: "top top",
        end: "bottom top",
      },
    });

    gsap.to(".testimonial-track", {
      xPercent: -50,
      duration: 26,
      ease: "none",
      repeat: -1,
    });

    animateIfPresent(".robot-mascot", { y: -14, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
    animateIfPresent(".unicorn-mascot", { y: -12, rotation: -3, duration: 1.3, yoyo: true, repeat: -1, ease: "sine.inOut" });

    ScrollTrigger.create({
      start: 70,
      end: 99999,
      toggleClass: { targets: "#navbar", className: "shadow-2xl" },
    });

    ScrollTrigger.refresh();
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

    function animateIfPresent(selector, vars) {
      if (document.querySelector(selector)) gsap.to(selector, vars);
    }
  }

  function initTilt() {
    $$(".tilt-card, .category-card, .product-card, .mascot-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        if (prefersReducedMotion) return;
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 12;
        const rotateX = ((y / rect.height) - 0.5) * -12;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  function initMotionInteractions() {
    if (!motionApi || prefersReducedMotion) {
      $$(".motion-button").forEach((button) => {
        button.addEventListener("mouseenter", () => bounce(button));
      });
      return;
    }

    const animate = motionApi.animate || motionApi.motionValue ? motionApi.animate : null;
    if (!animate) return;

    $$(".motion-button, .icon-button, .category-card").forEach((element) => {
      element.addEventListener("pointerenter", () => {
        animate(element, { scale: [1, 1.06, 1.02], rotate: [0, -1, 0] }, { duration: 0.36, easing: "ease-out" });
      });
      element.addEventListener("pointerleave", () => {
        animate(element, { scale: 1, rotate: 0 }, { duration: 0.2 });
      });
    });
  }

  function bounce(element) {
    if (!element) return;
    if (window.gsap && !prefersReducedMotion) {
      gsap.fromTo(element, { scale: 0.94 }, { scale: 1, duration: 0.38, ease: "elastic.out(1, 0.45)" });
    }
  }

  function initCursorGlow() {
    const glow = $(".cursor-glow");
    if (!glow || prefersReducedMotion) return;
    window.addEventListener("pointermove", (event) => {
      glow.animate(
        { transform: `translate(${event.clientX - glow.offsetWidth / 2}px, ${event.clientY - glow.offsetHeight / 2}px)` },
        { duration: 550, fill: "forwards", easing: "ease-out" }
      );
    });
  }

  function initParallaxPointer() {
    const floats = $$(".toy-float");
    if (!floats.length || prefersReducedMotion) return;
    window.addEventListener("pointermove", (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 24;
      const y = (event.clientY / window.innerHeight - 0.5) * 24;
      floats.forEach((item) => {
        const depth = Number(item.dataset.depth || 0.2);
        item.style.translate = `${x * depth}px ${y * depth}px`;
      });
    });
  }

  function initParticles() {
    const canvas = $("#particle-canvas");
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext("2d");
    const colors = ["#ff4fb8", "#ffe35c", "#45caff", "#58e6a7", "#8b5cf6"];
    let particles = [];

    function resize() {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      particles = Array.from({ length: Math.min(90, Math.floor(window.innerWidth / 18)) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 3 + 1,
        c: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.random() * 0.35 - 0.18,
        vy: Math.random() * 0.45 + 0.12,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > window.innerHeight + 10) p.y = -10;
        if (p.x < -10) p.x = window.innerWidth + 10;
        if (p.x > window.innerWidth + 10) p.x = -10;
        ctx.globalAlpha = 0.48;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }

    resize();
    frame();
    window.addEventListener("resize", resize);
  }

  function initConfetti() {
    const canvas = $("#confetti-canvas");
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext("2d");
    const colors = ["#fff", "#ffe35c", "#45caff", "#58e6a7", "#ff4fb8"];
    let pieces = [];

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      pieces = Array.from({ length: 80 }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 14 + 5,
        c: colors[Math.floor(Math.random() * colors.length)],
        s: Math.random() * 1.6 + 0.7,
        a: Math.random() * Math.PI,
      }));
    }

    function frame() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      pieces.forEach((p) => {
        p.y += p.s;
        p.a += 0.04;
        if (p.y > rect.height + 20) p.y = -20;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      requestAnimationFrame(frame);
    }

    resize();
    frame();
    window.addEventListener("resize", resize);
  }

  function initForms() {
    $$("form").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const button = form.querySelector("button");
        const original = button?.innerHTML;
        if (button) {
          button.innerHTML = '<i class="fa-solid fa-check"></i>';
          bounce(button);
          setTimeout(() => {
            button.innerHTML = original;
            form.reset();
          }, 1200);
        }
      });
    });
  }

  function boot() {
    initLoader();
    initTheme();
    renderCategories();
    renderProducts();
    renderTestimonials();
    initMenu();
    initCart();
    initCountdown();
    initParticles();
    initConfetti();
    initCursorGlow();
    initParallaxPointer();
    initTilt();
    initForms();
    initGSAP();
    initMotionInteractions();
    if (window.lucide) window.lucide.createIcons();
  }

  boot();
})();
