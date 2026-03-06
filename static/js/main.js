(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const body = document.body;
    const navToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    const progress = document.getElementById("scroll-progress");
    const hero = document.querySelector(".hero");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navLinks.classList.toggle("open");
        });
    }

    const updateScrollProgress = () => {
        if (!progress) return;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;
        progress.style.transform = `scaleX(${ratio})`;
    };

    const updateHeroParallax = () => {
        if (!hero || reduceMotion) return;
        const shift = Math.min(80, window.scrollY * 0.2);
        hero.style.setProperty("--hero-shift", `${shift}px`);
    };

    const onScroll = () => {
        updateScrollProgress();
        updateHeroParallax();
    };

    updateScrollProgress();
    updateHeroParallax();
    window.addEventListener("scroll", onScroll, { passive: true });

    const revealEls = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );
    revealEls.forEach((el, index) => {
        if (!reduceMotion) {
            el.style.transitionDelay = `${Math.min(index % 8, 7) * 70}ms`;
        }
        revealObserver.observe(el);
    });

    const counters = document.querySelectorAll(".counter");
    const countObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = Number(el.getAttribute("data-target") || 0);
                let current = 0;
                const step = Math.max(1, Math.floor(target / 50));
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        el.textContent = String(target);
                        clearInterval(timer);
                    } else {
                        el.textContent = String(current);
                    }
                }, 22);
                countObserver.unobserve(el);
            });
        },
        { threshold: 0.5 }
    );
    counters.forEach((el) => countObserver.observe(el));

    const typedEl = document.getElementById("typed-text");
    if (typedEl) {
        const words = JSON.parse(typedEl.dataset.words || "[]").filter(Boolean);
        if (words.length > 0) {
            let wordIndex = 0;
            typedEl.classList.add("word-rotator");
            typedEl.textContent = words[wordIndex];

            setInterval(() => {
                typedEl.style.opacity = "0";
                setTimeout(() => {
                    wordIndex = (wordIndex + 1) % words.length;
                    typedEl.textContent = words[wordIndex];
                    typedEl.style.opacity = "1";
                }, 180);
            }, 2200);
        }
    }

    const pageTransitionLinks = document.querySelectorAll("a[href]");
    pageTransitionLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");
            if (!href) return;
            if (href.startsWith("#")) return;
            if (link.target === "_blank") return;
            if (link.hasAttribute("download")) return;

            const url = new URL(link.href, window.location.href);
            if (url.origin !== window.location.origin) return;
            if (url.pathname === window.location.pathname && url.search === window.location.search) return;

            event.preventDefault();
            body.classList.add("is-transitioning");
            setTimeout(() => {
                window.location.assign(url.href);
            }, 260);
        });
    });

    const formFields = document.querySelectorAll("input, textarea");
    formFields.forEach((field) => {
        const markDirty = () => {
            if (field.value.trim().length > 0) {
                field.classList.add("is-dirty");
            }
        };
        field.addEventListener("input", markDirty);
        field.addEventListener("blur", markDirty);
    });

    const rippleTargets = document.querySelectorAll(".btn, .menu-toggle, .nav-links a, .service-card, .stat-card, blockquote, .about-grid article");
    rippleTargets.forEach((el) => {
        el.addEventListener("pointerdown", (event) => {
            if (reduceMotion) return;
            const rect = el.getBoundingClientRect();
            const ripple = document.createElement("span");
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            ripple.className = "ripple";
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            el.appendChild(ripple);
            ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
        });
    });

    window.addEventListener("pageshow", () => {
        body.classList.remove("is-loading", "is-transitioning");
    });
    window.addEventListener("load", () => {
        requestAnimationFrame(() => {
            body.classList.remove("is-loading");
        });
    });

    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    const initParticles = () => {
        particles.length = 0;
        const amount = Math.min(80, Math.floor(window.innerWidth / 18));
        for (let i = 0; i < amount; i += 1) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.8 + 0.6,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
            });
        }
    };

    const draw = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 245, 255, 0.8)";

        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(draw);
    };

    window.addEventListener("resize", () => {
        resize();
        initParticles();
        updateScrollProgress();
        updateHeroParallax();
    });

    resize();
    initParticles();
    draw();
})();
