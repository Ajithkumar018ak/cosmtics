/* =========================================================
   ÉLORA — CINEMATIC BEAUTY PRELOADER
   LOADER PROGRESS + BRAND REVEAL + PAGE TRANSITION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    /* =====================================================
       SELECTORS
    ===================================================== */

    const preloader = document.getElementById("preloader");

    const preloaderStage = document.getElementById("preloaderStage");

    const loaderPercent = document.getElementById("loaderPercent");

    const loaderProgressBar = document.getElementById("loaderProgressBar");


    /* Stop safely if the preloader HTML is not on this page */

    if (!preloader) {
        return;
    }


    /* =====================================================
       SETTINGS
    ===================================================== */

    const minimumLoaderTime = 6500;

    const revealTime = 4500;

    const finalTransitionTime = 5700;

    const exitDelay = 900;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* =====================================================
       PRELOADER STATE
    ===================================================== */

    let loaderStartedAt = Date.now();

    let loaderFinished = false;

    let pageReady = document.readyState === "complete";

    let progress = 0;

    let animationFrame = null;

    let revealTimer = null;

    let exitTimer = null;


    /* =====================================================
       ACCESSIBILITY
    ===================================================== */

    preloader.setAttribute("role", "status");

    preloader.setAttribute("aria-label", "Loading Élora website");

    preloader.setAttribute("aria-live", "polite");


    /* Prevent scrolling while the preloader is visible */

    document.documentElement.classList.add("elora-loading");

    document.body.classList.add("elora-loading");

    document.body.style.overflow = "hidden";


    /* =====================================================
       PROGRESS DISPLAY
    ===================================================== */

    function updateProgress(value) {

        progress = Math.max(
            0,
            Math.min(100, Math.round(value))
        );

        if (loaderPercent) {
            loaderPercent.textContent = progress;
        }

        if (loaderProgressBar) {
            loaderProgressBar.style.width = progress + "%";
        }

        preloader.setAttribute(
            "aria-label",
            "Loading Élora website: " + progress + "%"
        );
    }


    /* =====================================================
       WAIT FOR PAGE RESOURCES
    ===================================================== */

    function markPageReady() {

        pageReady = true;

        checkLoaderCompletion();
    }


    if (document.readyState === "complete") {

        pageReady = true;

    } else {

        window.addEventListener(
            "load",
            markPageReady,
            { once: true }
        );

    }


    /* =====================================================
       CINEMATIC TIMELINE
    ===================================================== */

    function startCinematicTimeline() {

        /*
         * CSS controls the object animations.
         * JavaScript adds timeline states so the logo reveal
         * and final transition happen in sequence.
         */

        if (reducedMotion) {

            preloader.classList.add("is-revealing");

            return;
        }


        revealTimer = window.setTimeout(function () {

            if (loaderFinished) {
                return;
            }

            preloader.classList.add("is-revealing");

        }, revealTime);


        /*
         * Prepare the final logo reveal.
         * The actual logo animation uses CSS keyframes.
         */

        window.setTimeout(function () {

            if (loaderFinished) {
                return;
            }

            if (preloaderStage) {

                preloaderStage.classList.add(
                    "beauty-stage-finale"
                );

            }

        }, finalTransitionTime);

    }


    /* =====================================================
       PROGRESS ANIMATION
    ===================================================== */

    function animateProgress() {

        if (loaderFinished) {
            return;
        }

        const elapsed = Date.now() - loaderStartedAt;

        const elapsedProgress = Math.min(
            96,
            (elapsed / minimumLoaderTime) * 96
        );


        /*
         * Hold the loader at 96% until the page is ready.
         */

        let targetProgress = elapsedProgress;

        if (!pageReady) {

            targetProgress = Math.min(
                elapsedProgress,
                92
            );

        }


        /*
         * Ease progress instead of jumping abruptly.
         */

        const difference = targetProgress - progress;

        if (difference > 0) {

            const step = Math.max(
                0.15,
                difference * 0.075
            );

            updateProgress(progress + step);

        }


        checkLoaderCompletion();


        if (!loaderFinished) {

            animationFrame = window.requestAnimationFrame(
                animateProgress
            );

        }

    }


    /* =====================================================
       CHECK COMPLETION
    ===================================================== */

    function checkLoaderCompletion() {

        if (loaderFinished) {
            return;
        }

        const elapsed = Date.now() - loaderStartedAt;

        const minimumTimePassed = elapsed >= minimumLoaderTime;


        if (pageReady && minimumTimePassed) {

            finishPreloader();

        }

    }


    /* =====================================================
       FINISH PRELOADER
    ===================================================== */

    function finishPreloader() {

        if (loaderFinished) {
            return;
        }

        loaderFinished = true;


        /*
         * Stop progress animation.
         */

        if (animationFrame) {

            window.cancelAnimationFrame(animationFrame);

            animationFrame = null;

        }


        /*
         * Complete the progress bar.
         */

        updateProgress(100);


        /*
         * Keep the cinematic reveal visible briefly.
         */

        const remainingTime = reducedMotion ? 100 : exitDelay;


        exitTimer = window.setTimeout(function () {

            preloader.classList.add("is-loaded");


            /*
             * Release scrolling after the transition begins.
             */

            document.documentElement.classList.remove(
                "elora-loading"
            );

            document.body.classList.remove(
                "elora-loading"
            );

            document.body.style.overflow = "";


            /*
             * Remove the preloader after the CSS transition.
             * Removing it completely avoids blocking the page.
             */

            window.setTimeout(function () {

                if (preloader && preloader.parentNode) {

                    preloader.remove();

                }

            }, 1300);

        }, remainingTime);

    }


    /* =====================================================
       START
    ===================================================== */

    if (reducedMotion) {

        /*
         * Reduced-motion users receive a simpler,
         * quicker loading experience.
         */

        startCinematicTimeline();

        updateProgress(100);

        if (pageReady) {

            finishPreloader();

        } else {

            window.addEventListener(
                "load",
                markPageReady,
                { once: true }
            );

        }

    } else {

        startCinematicTimeline();

        updateProgress(0);

        animationFrame = window.requestAnimationFrame(
            animateProgress
        );

    }


    /* =====================================================
       SAFETY FALLBACK
    ===================================================== */

    /*
     * If a resource fails and the load event never completes,
     * don't leave the visitor stuck on the preloader forever.
     */

    window.setTimeout(function () {

        if (!loaderFinished) {

            pageReady = true;

            finishPreloader();

        }

    }, 12000);


    /* =====================================================
       CLEANUP ON PAGE HIDE
    ===================================================== */

    window.addEventListener("pagehide", function () {

        if (animationFrame) {

            window.cancelAnimationFrame(animationFrame);

        }

        window.clearTimeout(revealTimer);

        window.clearTimeout(exitTimer);

    });


});












/* =========================================================
   ÉLORA — LUXURY BEAUTY & FASHION
   Main JavaScript
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       01. SELECTORS
    ===================================================== */

    const body = document.body;

    const siteHeader = document.getElementById("siteHeader");

    const mobileMenuToggle =
        document.getElementById("mobileMenuToggle");

    const mobileOverlay =
        document.getElementById("mobileOverlay");

    const mobileDrawer =
        document.getElementById("mobileDrawer");

    const drawerClose =
        document.getElementById("drawerClose");

    const loginModal =
        document.getElementById("loginModal");

    const loginModalOpen =
        document.getElementById("loginModalOpen");

    const loginModalClose =
        document.getElementById("loginModalClose");

    const loginDialog =
        loginModal?.querySelector(".login-modal");

    let lastFocusedElement = null;


    /* =====================================================
       02. HEADER SCROLL EFFECT
    ===================================================== */

    function updateHeader() {

        if (!siteHeader) return;

        siteHeader.classList.toggle(
            "scrolled",
            window.scrollY > 20
        );

    }

    updateHeader();

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );


    /* =====================================================
       03. MOBILE DRAWER
    ===================================================== */

    function openDrawer() {

        if (!mobileDrawer) return;

        mobileDrawer.classList.add("active");
        if (mobileOverlay) mobileOverlay.classList.add("active");

        body.classList.add("drawer-open");
        document.documentElement.classList.add("drawer-open");

        mobileDrawer.setAttribute("aria-hidden", "false");

        if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute("aria-expanded", "true");
            mobileMenuToggle.setAttribute("aria-label", "Close navigation menu");
            mobileMenuToggle.classList.add("is-active");
        }

        drawerClose?.focus();

    }


    function closeDrawer() {

        if (!mobileDrawer) return;

        mobileDrawer.classList.remove("active");
        if (mobileOverlay) mobileOverlay.classList.remove("active");

        body.classList.remove("drawer-open");
        document.documentElement.classList.remove("drawer-open");

        mobileDrawer.setAttribute("aria-hidden", "true");

        if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute("aria-expanded", "false");
            mobileMenuToggle.setAttribute("aria-label", "Open navigation menu");
            mobileMenuToggle.classList.remove("is-active");
        }

    }

    window.eloraOpenDrawer = openDrawer;
    window.eloraCloseDrawer = closeDrawer;

    mobileMenuToggle?.addEventListener("click", event => {

        event.preventDefault();

        const isOpen =
            mobileDrawer?.classList.contains("active") ||
            mobileMenuToggle.getAttribute("aria-expanded") === "true";

        if (isOpen) {
            closeDrawer();
        } else {
            openDrawer();
        }

    });


    drawerClose?.addEventListener("click", event => {
        event.preventDefault();
        closeDrawer();
    });


    mobileOverlay?.addEventListener("click", event => {
        event.preventDefault();
        closeDrawer();
    });


    /* Close drawer when a navigation link is selected */

    mobileDrawer?.querySelectorAll(
        ".drawer-navigation a, .drawer-promo a"
    ).forEach(link => {

        link.addEventListener("click", () => {
            closeDrawer();
        });

    });


    /* =====================================================
       04. LOGIN MODAL
    ===================================================== */

    function openLoginModal() {

        if (!loginModal) return;

        lastFocusedElement = document.activeElement;

        closeDrawer();

        loginModal.classList.add("active");

        loginModal.setAttribute("aria-hidden", "false");

        body.classList.add("modal-open");

        window.setTimeout(() => {

            const activeForm =
                loginModal.querySelector(".login-form.active");

            const firstInput =
                activeForm?.querySelector("input");

            if (firstInput) {
                firstInput.focus();
            } else {
                loginDialog?.focus();
            }

        }, 120);

    }


    function closeLoginModal() {

        if (!loginModal) return;

        loginModal.classList.remove("active");

        loginModal.setAttribute("aria-hidden", "true");

        body.classList.remove("modal-open");

        if (
            lastFocusedElement &&
            typeof lastFocusedElement.focus === "function"
        ) {
            lastFocusedElement.focus();
        }

    }


    /* Header login button */

    loginModalOpen?.addEventListener(
        "click",
        openLoginModal
    );


    /* Close button */

    loginModalClose?.addEventListener(
        "click",
        closeLoginModal
    );


    /* Open login from any element with data-open-login */

    document.querySelectorAll("[data-open-login]").forEach(button => {

        button.addEventListener("click", openLoginModal);

    });


    /* Close modal by clicking outside the dialog */

    loginModal?.addEventListener("click", event => {

        if (event.target === loginModal) {
            closeLoginModal();
        }

    });


    /* =====================================================
       05. ESCAPE KEY
    ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.key !== "Escape") return;

        if (loginModal?.classList.contains("active")) {

            closeLoginModal();
            return;

        }

        if (mobileDrawer?.classList.contains("active")) {

            closeDrawer();

        }

    });


    /* =====================================================
       06. LOGIN TABS
    ===================================================== */

    const loginTabs = document.querySelectorAll(
        "[data-login-tab]"
    );

    const loginForms = document.querySelectorAll(
        "[data-login-form]"
    );


    function activateLoginTab(tabName) {

        loginTabs.forEach(tab => {

            const isActive =
                tab.dataset.loginTab === tabName;

            tab.classList.toggle("active", isActive);

            tab.setAttribute(
                "aria-selected",
                String(isActive)
            );

        });


        loginForms.forEach(form => {

            const isActive =
                form.dataset.loginForm === tabName;

            form.classList.toggle("active", isActive);

            if (isActive) {
                form.removeAttribute("hidden");
            } else {
                form.setAttribute("hidden", "");
            }

        });

    }


    loginTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            activateLoginTab(tab.dataset.loginTab);

        });

    });


    /* =====================================================
       07. PASSWORD SHOW / HIDE
    ===================================================== */

    document.querySelectorAll(
        "[data-password-toggle]"
    ).forEach(toggle => {

        toggle.addEventListener("click", () => {

            const inputId = toggle.dataset.passwordToggle;

            const passwordInput =
                document.getElementById(inputId);

            if (!passwordInput) return;

            const shouldShow =
                passwordInput.type === "password";

            passwordInput.type =
                shouldShow ? "text" : "password";

            toggle.setAttribute(
                "aria-pressed",
                String(shouldShow)
            );

            toggle.setAttribute(
                "aria-label",
                shouldShow ? "Hide password" : "Show password"
            );

            const icon = toggle.querySelector("i");

            if (icon) {

                icon.classList.toggle(
                    "fa-eye",
                    !shouldShow
                );

                icon.classList.toggle(
                    "fa-eye-slash",
                    shouldShow
                );

            }

        });

    });


    /* =====================================================
       08. DEMO CUSTOMER / ADMIN LOGIN
       
       Demo credentials only.
       Not secure for production authentication.
    ===================================================== */

    const userLoginForm =
        document.getElementById("userLoginForm");

    const adminLoginForm =
        document.getElementById("adminLoginForm");


    userLoginForm?.addEventListener("submit", event => {

        event.preventDefault();

        if (!userLoginForm.reportValidity()) return;

        /*
          Demo only:
          Any valid email + password accepted.

          Production site:
          Connect this form to a secure authentication backend.
        */

        window.location.href = "user-dashboard.html";

    });


    adminLoginForm?.addEventListener("submit", event => {

        event.preventDefault();

        if (!adminLoginForm.reportValidity()) return;

        /*
          Demo only:
          Any valid email + password accepted.

          Production site:
          Verify administrator credentials on the server.
        */

        window.location.href = "admin-dashboard.html";

    });


    /* =====================================================
       09. HERO SLIDER
    ===================================================== */

    const heroVisual =
        document.getElementById("heroVisual");

    const heroSlides = heroVisual
        ? Array.from(heroVisual.querySelectorAll(".hero-slide"))
        : [];

    const heroDots = document.querySelectorAll(
        "[data-go-slide]"
    );

    const heroPrev = document.getElementById("heroPrev");

    const heroNext = document.getElementById("heroNext");

    const heroProgressBar =
        document.getElementById("heroProgressBar");

    const heroSideNumber =
        document.querySelector(".hero-side-number");

    const slideDuration = 5500;

    let currentSlide = 0;
    let sliderTimer = null;
    let progressAnimation = null;


    function updateSideNumber(index) {

        if (!heroSideNumber) return;

        const numberElements =
            heroSideNumber.querySelectorAll("span");

        if (numberElements.length >= 3) {

            numberElements[0].textContent =
                String(index + 1).padStart(2, "0");

            numberElements[2].textContent =
                String(heroSlides.length).padStart(2, "0");

        }

    }


    function resetProgress() {

        if (!heroProgressBar) return;

        if (progressAnimation) {

            progressAnimation.cancel();

            progressAnimation = null;

        }

        heroProgressBar.style.width = "0%";

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            heroProgressBar.style.width = "100%";
            return;
        }

        if (typeof heroProgressBar.animate === "function") {

            progressAnimation = heroProgressBar.animate(
                [
                    { width: "0%" },
                    { width: "100%" }
                ],
                {
                    duration: slideDuration,
                    easing: "linear",
                    fill: "forwards"
                }
            );

        }

    }


    function showSlide(index, restartTimer = true) {

        if (!heroSlides.length) return;

        currentSlide =
            (index + heroSlides.length) % heroSlides.length;


        heroSlides.forEach((slide, slideIndex) => {

            const isActive = slideIndex === currentSlide;

            slide.classList.toggle("active", isActive);

            slide.setAttribute(
                "aria-hidden",
                String(!isActive)
            );

        });


        heroDots.forEach((dot, dotIndex) => {

            const isActive = dotIndex === currentSlide;

            dot.classList.toggle("active", isActive);

            if (isActive) {

                dot.setAttribute("aria-current", "true");

            } else {

                dot.removeAttribute("aria-current");

            }

        });


        updateSideNumber(currentSlide);


        if (restartTimer) {
            startSlider();
        }

    }


    function stopSlider() {

        if (sliderTimer) {

            window.clearTimeout(sliderTimer);

            sliderTimer = null;

        }

        if (progressAnimation) {

            progressAnimation.cancel();

            progressAnimation = null;

        }

    }


    function startSlider() {

        stopSlider();

        if (heroSlides.length < 2) return;

        resetProgress();

        if (
            document.hidden ||
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            return;
        }

        sliderTimer = window.setTimeout(() => {

            showSlide(currentSlide + 1);

        }, slideDuration);

    }


    heroPrev?.addEventListener("click", () => {

        showSlide(currentSlide - 1);

    });


    heroNext?.addEventListener("click", () => {

        showSlide(currentSlide + 1);

    });


    heroDots.forEach(dot => {

        dot.addEventListener("click", () => {

            const index = Number(dot.dataset.goSlide);

            if (!Number.isInteger(index)) return;

            showSlide(index);

        });

    });


    /* Pause slider while browser tab is hidden */

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {

            stopSlider();

        } else {

            startSlider();

        }

    });


    /* Pause autoplay while hovering the hero image */

    heroVisual?.addEventListener("mouseenter", stopSlider);

    heroVisual?.addEventListener("mouseleave", startSlider);


    if (heroSlides.length) {

        showSlide(0);

    }


    /* =====================================================
       10. PRODUCT CATEGORY FILTERS
    ===================================================== */

    const filterButtons = document.querySelectorAll(
        "[data-filter]"
    );

    const productCards = document.querySelectorAll(
        ".product-card[data-category]"
    );


    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const selectedCategory = button.dataset.filter;

            filterButtons.forEach(filterButton => {

                filterButton.classList.toggle(
                    "active",
                    filterButton === button
                );

            });


            productCards.forEach(card => {

                const category = card.dataset.category;

                const shouldShow =
                    selectedCategory === "all" ||
                    category === selectedCategory;

                card.classList.toggle(
                    "is-filtered-out",
                    !shouldShow
                );

            });


            const visibleCount = Array.from(productCards).filter(card => {

                return !card.classList.contains("is-filtered-out");

            }).length;


            const countElement =
                document.querySelector(".product-count");

            if (countElement) {

                countElement.textContent =
                    `OUR LATEST EDIT — ${String(visibleCount).padStart(2, "0")} PIECES`;

            }

        });

    });


    /* =====================================================
       11. PRODUCT WISHLIST TOGGLE
    ===================================================== */

    document.querySelectorAll(".product-wishlist").forEach(button => {

        button.setAttribute("aria-pressed", "false");

        button.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();

            const isWishlisted =
                button.classList.toggle("is-wishlisted");

            button.setAttribute(
                "aria-pressed",
                String(isWishlisted)
            );

            const icon = button.querySelector("i");

            if (icon) {

                icon.classList.toggle(
                    "fa-solid",
                    isWishlisted
                );

                icon.classList.toggle(
                    "fa-regular",
                    !isWishlisted
                );

            }

            const productName =
                button.closest(".product-card")
                    ?.querySelector(".product-details h3")
                    ?.textContent.trim();

            button.setAttribute(
                "aria-label",
                isWishlisted
                    ? `Remove ${productName || "product"} from wishlist`
                    : `Add ${productName || "product"} to wishlist`
            );

        });

    });


    /* =====================================================
       12. NEWSLETTER FORMS
       
       The homepage newsletter and footer newsletter
       share IDs in the supplied HTML. This handler uses
       each form independently to avoid duplicate IDs.
    ===================================================== */

    const newsletterForms = document.querySelectorAll(
        "form.newsletter-form, .footer-newsletter form"
    );


    newsletterForms.forEach(form => {

        form.addEventListener("submit", event => {

            event.preventDefault();

            const emailInput =
                form.querySelector('input[type="email"]');

            const email = emailInput?.value.trim();

            if (!emailInput || !email) {

                emailInput?.focus();

                return;

            }

            if (!emailInput.checkValidity()) {

                emailInput.reportValidity();

                return;

            }


            const statusElement =
                form.querySelector(
                    "#newsletterStatus, #newsletterMessage, small"
                );


            if (statusElement) {

                statusElement.textContent =
                    "Thank you for joining the Élora community!";

            } else {

                const status = document.createElement("p");

                status.className = "newsletter-status";

                status.setAttribute("aria-live", "polite");

                status.textContent =
                    "Thank you for joining the Élora community!";

                form.insertAdjacentElement("afterend", status);

            }


            form.reset();

        });

    });


    /* =====================================================
       13. SCROLL REVEAL ANIMATIONS
    ===================================================== */

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    const revealElements = document.querySelectorAll(
        ".section-heading, " +
        ".category-card, " +
        ".product-card, " +
        ".makeup-content, " +
        ".makeup-visual, " +
        ".skincare-card, " +
        ".bestseller-card, " +
        ".fashion-content, " +
        ".fashion-visual, " +
        ".fragrance-content, " +
        ".fragrance-visual, " +
        ".story-content, " +
        ".story-visual, " +
        ".journal-card, " +
        ".community-image"
    );


    if (reducedMotion) {

        revealElements.forEach(element => {

            element.classList.add("is-visible");

        });

    } else if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");

                    observer.unobserve(entry.target);

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );


        revealElements.forEach((element, index) => {

            element.classList.add("js-reveal");

            element.style.transitionDelay =
                `${(index % 4) * 70}ms`;

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add("is-visible");

        });

    }


    /* =====================================================
       14. MOBILE VIEWPORT SAFETY
    ===================================================== */

    window.addEventListener("resize", () => {

        if (
            window.innerWidth > 992 &&
            mobileDrawer?.classList.contains("active")
        ) {
            closeDrawer();
        }

    });


    /* =====================================================
       15. CURRENT PAGE NAVIGATION
    ===================================================== */

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";


    document.querySelectorAll(
        ".main-navigation .nav-link, .footer-column .nav-link"
    ).forEach(link => {

        const href = link.getAttribute("href");

        if (!href) return;

        const targetPage = href.split("#")[0];

        if (
            targetPage &&
            targetPage === currentPage
        ) {

            link.classList.add("active");

        } else {

            link.classList.remove("active");

        }

    });


    /* =====================================================
       16. INITIAL ACCESSIBILITY STATE
    ===================================================== */

    mobileDrawer?.setAttribute("aria-hidden", "true");

    mobileMenuToggle?.setAttribute(
        "aria-expanded",
        "false"
    );

    loginModal?.setAttribute("aria-hidden", "true");


    /* =====================================================
       17. INITIAL LOGIN TAB
    ===================================================== */

    activateLoginTab("user");


    console.log("ÉLORA website initialized successfully.");

});




















































/* =========================================================
   ÉLORA — NEW ARRIVALS JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       HELPERS
    ===================================================== */

    const select = (selector, parent = document) =>
        parent.querySelector(selector);

    const selectAll = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    function lockBody() {
        document.body.style.overflow = "hidden";
    }

    function unlockBody() {
        document.body.style.overflow = "";
    }


    function showNotice(message) {
        let notice = select("#eloraNotice");

        if (!notice) {
            notice = document.createElement("div");
            notice.id = "eloraNotice";
            notice.setAttribute("role", "status");

            Object.assign(notice.style, {
                position: "fixed",
                left: "50%",
                bottom: "25px",
                zIndex: "3000",
                maxWidth: "calc(100% - 30px)",
                padding: "14px 22px",
                background: "#29251f",
                color: "#fffdf9",
                fontSize: "12px",
                textAlign: "center",
                boxShadow: "0 10px 35px rgba(0,0,0,.15)",
                opacity: "0",
                transform: "translate(-50%, 12px)",
                transition: "opacity .3s ease, transform .3s ease",
                pointerEvents: "none"
            });

            document.body.appendChild(notice);
        }

        notice.textContent = message;
        notice.style.opacity = "1";
        notice.style.transform = "translate(-50%, 0)";

        clearTimeout(notice.hideTimer);

        notice.hideTimer = setTimeout(() => {
            notice.style.opacity = "0";
            notice.style.transform = "translate(-50%, 12px)";
        }, 2600);
    }



    /* =====================================================
       HEADER SCROLL STATE + SCROLL PROGRESS + SCROLL TO TOP
    ===================================================== */

    const header = select("#siteHeader");
    const scrollProgress = select("#scrollProgress");
    const scrollTopButton = select("#scrollTop");


    function updateScrollUI() {

        const scrollableHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress = scrollableHeight > 0
            ? (window.scrollY / scrollableHeight) * 100
            : 0;


        if (scrollProgress) {
            scrollProgress.style.width = `${progress}%`;
        }


        if (header) {
            header.classList.toggle(
                "header-scrolled",
                window.scrollY > 30
            );
        }


        if (scrollTopButton) {
            scrollTopButton.classList.toggle(
                "show",
                window.scrollY > 400
            );
        }

    }


    window.addEventListener("scroll", updateScrollUI, {
        passive: true
    });

    updateScrollUI();


    if (scrollTopButton) {

        scrollTopButton.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "auto" : "smooth"
            });

        });

    }



    /* =====================================================
       MOBILE DRAWER (Delegates to centralized main nav)
    ===================================================== */

    function openDrawer() {
        if (typeof window.eloraOpenDrawer === "function") {
            window.eloraOpenDrawer();
        }
    }

    function closeDrawer() {
        if (typeof window.eloraCloseDrawer === "function") {
            window.eloraCloseDrawer();
        }
    }



    /* =====================================================
       HERO — FIVE PRODUCT CURVED CAROUSEL
    ===================================================== */

    const arrivalSlides = selectAll(".arrival-slide");
    const arrivalDots = selectAll(".arrival-dot");

    const arrivalPrev = select("#arrivalPrev");
    const arrivalNext = select("#arrivalNext");

    const arrivalCategory = select("#arrivalCategory");
    const arrivalBadge = select("#arrivalBadge");
    const arrivalTitle = select("#arrivalProductTitle");
    const arrivalDescription = select("#arrivalDescription");

    const arrivalPrice = select("#arrivalPrice");
    const arrivalOldPrice = select("#arrivalOldPrice");

    const arrivalShopLink = select("#arrivalShopLink");
    const arrivalCurrentNumber = select("#arrivalCurrentNumber");
    const arrivalProgress = select("#arrivalProgress");

    const arrivalHeroContent = select("#arrivalHeroContent");
    const arrivalCarousel = select("#arrivalCarousel");


    let activeSlideIndex = 0;
    let heroTimer = null;

    const heroInterval = 5500;


    function normalizeSlideIndex(index) {

        return (index + arrivalSlides.length) % arrivalSlides.length;

    }


    function getSlideData(slide) {

        return {
            category: slide.dataset.category || "",
            name: slide.dataset.name || "",
            description: slide.dataset.description || "",
            price: slide.dataset.price || "",
            oldPrice: slide.dataset.oldPrice || "",
            badge: slide.dataset.badge || "",
            link: slide.dataset.link || "fashion.html"
        };

    }


    function setSlidePositionClasses() {

        arrivalSlides.forEach((slide, index) => {

            slide.classList.remove(
                "position-left-2",
                "position-left-1",
                "position-right-1",
                "position-right-2",
                "is-active"
            );


            const difference =
                (index - activeSlideIndex + arrivalSlides.length)
                % arrivalSlides.length;


            if (difference === 0) {

                slide.classList.add("is-active");

            } else if (difference === 1) {

                slide.classList.add("position-right-1");

            } else if (difference === 2) {

                slide.classList.add("position-right-2");

            } else if (difference === arrivalSlides.length - 1) {

                slide.classList.add("position-left-1");

            } else if (difference === arrivalSlides.length - 2) {

                slide.classList.add("position-left-2");

            }


            slide.setAttribute(
                "aria-hidden",
                index === activeSlideIndex ? "false" : "true"
            );

        });

    }


    function updateHeroContent() {

        if (!arrivalSlides.length) return;

        const activeSlide = arrivalSlides[activeSlideIndex];
        const data = getSlideData(activeSlide);


        if (arrivalCategory) {
            arrivalCategory.textContent = data.category;
        }

        if (arrivalBadge) {
            arrivalBadge.textContent = data.badge;
        }

        if (arrivalTitle) {
            arrivalTitle.textContent = data.name;
        }

        if (arrivalDescription) {
            arrivalDescription.textContent = data.description;
        }

        if (arrivalPrice) {
            arrivalPrice.textContent = data.price;
        }

        if (arrivalOldPrice) {

            arrivalOldPrice.textContent = data.oldPrice;

            arrivalOldPrice.hidden = !data.oldPrice;

        }

        if (arrivalShopLink) {
            arrivalShopLink.href = data.link;
        }

        if (arrivalCurrentNumber) {

            arrivalCurrentNumber.textContent =
                String(activeSlideIndex + 1).padStart(2, "0");

        }


        arrivalDots.forEach((dot, index) => {

            const isActive = index === activeSlideIndex;

            dot.classList.toggle("active", isActive);

            dot.setAttribute("aria-current", String(isActive));

        });


        updateHeroWishlistState();

        restartHeroProgress();

    }


    function restartHeroProgress() {

        if (!arrivalProgress) return;

        arrivalProgress.classList.remove("running");

        arrivalProgress.style.width = "0%";

        // Force the browser to restart the CSS animation.
        void arrivalProgress.offsetWidth;

        if (!reducedMotion) {

            arrivalProgress.classList.add("running");

        } else {

            arrivalProgress.style.width = "100%";

        }

    }


    function goToArrivalSlide(index, userInitiated = false) {

        if (!arrivalSlides.length) return;

        activeSlideIndex = normalizeSlideIndex(index);

        setSlidePositionClasses();

        updateHeroContent();


        if (userInitiated) {
            restartHeroAutoplay();
        }

    }


    function nextArrivalSlide(userInitiated = false) {

        goToArrivalSlide(activeSlideIndex + 1, userInitiated);

    }


    function previousArrivalSlide(userInitiated = false) {

        goToArrivalSlide(activeSlideIndex - 1, userInitiated);

    }


    function stopHeroAutoplay() {

        if (heroTimer) {

            clearInterval(heroTimer);

            heroTimer = null;

        }

    }


    function startHeroAutoplay() {

        stopHeroAutoplay();

        if (reducedMotion || arrivalSlides.length < 2) return;

        heroTimer = setInterval(() => {

            nextArrivalSlide(false);

        }, heroInterval);

    }


    function restartHeroAutoplay() {

        startHeroAutoplay();

    }


    if (arrivalSlides.length) {

        goToArrivalSlide(0);

        startHeroAutoplay();


        if (arrivalNext) {

            arrivalNext.addEventListener("click", () => {

                nextArrivalSlide(true);

            });

        }


        if (arrivalPrev) {

            arrivalPrev.addEventListener("click", () => {

                previousArrivalSlide(true);

            });

        }


        arrivalDots.forEach((dot, index) => {

            dot.addEventListener("click", () => {

                goToArrivalSlide(index, true);

            });

        });


        // Pause autoplay while the pointer is over the carousel.
        if (arrivalCarousel) {

            arrivalCarousel.addEventListener("mouseenter", stopHeroAutoplay);

            arrivalCarousel.addEventListener("mouseleave", startHeroAutoplay);


            arrivalCarousel.addEventListener("focusin", stopHeroAutoplay);

            arrivalCarousel.addEventListener("focusout", event => {

                if (!arrivalCarousel.contains(event.relatedTarget)) {
                    startHeroAutoplay();
                }

            });

        }


        // Pause while the browser tab is hidden.
        document.addEventListener("visibilitychange", () => {

            if (document.hidden) {

                stopHeroAutoplay();

            } else {

                startHeroAutoplay();

            }

        });


        // Swipe support for touchscreens.
        let touchStartX = 0;
        let touchEndX = 0;


        if (arrivalCarousel) {

            arrivalCarousel.addEventListener("touchstart", event => {

                touchStartX = event.changedTouches[0].screenX;

            }, { passive: true });


            arrivalCarousel.addEventListener("touchend", event => {

                touchEndX = event.changedTouches[0].screenX;

                const distance = touchEndX - touchStartX;

                if (Math.abs(distance) < 45) return;

                if (distance < 0) {

                    nextArrivalSlide(true);

                } else {

                    previousArrivalSlide(true);

                }

            }, { passive: true });

        }

    }



    /* =====================================================
       WISHLIST
       In-memory demo only. Refreshing the page resets it.
    ===================================================== */

    const wishlistCount = select("#wishlistCount");
    const wishlistItems = new Set();

    const arrivalWishlist = select("#arrivalWishlist");


    function updateWishlistCount() {

        if (wishlistCount) {
            wishlistCount.textContent = wishlistItems.size;
        }

    }


    function setWishlistButtonState(button, isFavourite) {

        if (!button) return;

        button.classList.toggle("is-favourite", isFavourite);

        button.setAttribute("aria-pressed", String(isFavourite));


        const icon = select("i", button);

        if (icon) {

            icon.classList.toggle("fa-solid", isFavourite);

            icon.classList.toggle("fa-regular", !isFavourite);

        }

    }


    function toggleWishlist(productId, button, productName = "Product") {

        if (!productId) return;

        const isFavourite = wishlistItems.has(productId);


        if (isFavourite) {

            wishlistItems.delete(productId);

            setWishlistButtonState(button, false);

            showNotice(`${productName} removed from your wishlist.`);

        } else {

            wishlistItems.add(productId);

            setWishlistButtonState(button, true);

            showNotice(`${productName} added to your wishlist.`);

        }


        updateWishlistCount();

    }


    function updateHeroWishlistState() {

        if (!arrivalWishlist || !arrivalSlides.length) return;

        const activeSlide = arrivalSlides[activeSlideIndex];

        const productId =
            activeSlide.dataset.productId ||
            `hero-product-${activeSlideIndex}`;

        const isFavourite = wishlistItems.has(productId);

        setWishlistButtonState(arrivalWishlist, isFavourite);

    }


    if (arrivalSlides.length) {

        arrivalSlides.forEach((slide, index) => {

            if (!slide.dataset.productId) {

                slide.dataset.productId = `hero-product-${index}`;

            }

        });

    }


    if (arrivalWishlist) {

        arrivalWishlist.addEventListener("click", () => {

            const activeSlide = arrivalSlides[activeSlideIndex];

            if (!activeSlide) return;

            toggleWishlist(
                activeSlide.dataset.productId,
                arrivalWishlist,
                activeSlide.dataset.name || "Product"
            );

        });

    }


    selectAll(".product-wishlist").forEach(button => {

        button.addEventListener("click", () => {

            const card = button.closest(".product-card");

            const productId = button.dataset.product;

            const productName =
                select("h3", card)?.textContent.trim() || "Product";

            toggleWishlist(productId, button, productName);

        });

    });


    updateWishlistCount();



    /* =====================================================
       PRODUCT FILTERS
    ===================================================== */

    const productFilters = selectAll(".product-filter");
    const productCards = selectAll(".product-card");


    productFilters.forEach(button => {

        button.addEventListener("click", () => {

            const selectedFilter = button.dataset.filter || "all";


            productFilters.forEach(filterButton => {

                const isActive = filterButton === button;

                filterButton.classList.toggle("active", isActive);

                filterButton.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );

            });


            productCards.forEach(card => {

                const category = card.dataset.category || "all";

                const shouldShow =
                    selectedFilter === "all" ||
                    category === selectedFilter;

                card.classList.toggle("is-hidden", !shouldShow);

            });

        });

    });



    /* =====================================================
       TRENDING PRODUCT HORIZONTAL SLIDER
    ===================================================== */

    const trendingTrack = select("#trendingTrack");
    const trendingPrev = select("#trendingPrev");
    const trendingNext = select("#trendingNext");


    function getTrendingScrollDistance() {

        if (!trendingTrack) return 0;

        const firstCard = select(".trending-card", trendingTrack);

        if (!firstCard) return trendingTrack.clientWidth * 0.8;

        const trackStyles = getComputedStyle(trendingTrack);

        const gap = parseFloat(trackStyles.columnGap) || 0;

        return firstCard.getBoundingClientRect().width + gap;

    }


    if (trendingPrev && trendingTrack) {

        trendingPrev.addEventListener("click", () => {

            trendingTrack.scrollBy({

                left: -getTrendingScrollDistance(),

                behavior: reducedMotion ? "auto" : "smooth"

            });

        });

    }


    if (trendingNext && trendingTrack) {

        trendingNext.addEventListener("click", () => {

            trendingTrack.scrollBy({

                left: getTrendingScrollDistance(),

                behavior: reducedMotion ? "auto" : "smooth"

            });

        });

    }



    /* =====================================================
       NEWSLETTER FORM
       Front-end demonstration; no email is sent or stored.
    ===================================================== */

    const newsletterForm = select("#arrivalNewsletterForm");
    const newsletterEmail = select("#arrivalNewsletterEmail");
    const newsletterMessage = select("#arrivalNewsletterMessage");


    if (newsletterForm) {

        newsletterForm.addEventListener("submit", event => {

            event.preventDefault();


            if (!newsletterEmail || !newsletterEmail.checkValidity()) {

                newsletterEmail?.reportValidity();

                return;

            }


            if (newsletterMessage) {

                newsletterMessage.textContent =
                    "Thank you for your interest in ÉLORA. Connect a newsletter service to complete your subscription.";

            }


            showNotice("Thank you for your interest in ÉLORA.");

            newsletterForm.reset();

        });

    }



    /* =====================================================
       SEARCH MODAL
    ===================================================== */

    const searchModal = select("#searchModal");
    const searchOpen = select("#searchOpen");
    const searchClose = select("#searchClose");
    const searchBackdrop = select("#searchBackdrop");
    const searchInput = select("#arrivalSearchInput");
    const searchForm = select("#arrivalSearchForm");


    function openSearch() {

        if (!searchModal) return;

        closeDrawer();

        searchModal.classList.add("active");

        searchModal.setAttribute("aria-hidden", "false");

        lockBody();

        setTimeout(() => searchInput?.focus(), 100);

    }


    function closeSearch() {

        if (!searchModal) return;

        searchModal.classList.remove("active");

        searchModal.setAttribute("aria-hidden", "true");

        unlockBody();

    }


    if (searchOpen) {

        searchOpen.addEventListener("click", openSearch);

    }


    if (searchClose) {

        searchClose.addEventListener("click", closeSearch);

    }


    if (searchBackdrop) {

        searchBackdrop.addEventListener("click", closeSearch);

    }


    if (searchForm) {

        searchForm.addEventListener("submit", event => {

            event.preventDefault();

            const query = searchInput?.value.trim();

            if (!query) return;

            const normalizedQuery = query.toLowerCase();


            const matchingProduct = productCards.find(card => {

                return card.textContent.toLowerCase().includes(normalizedQuery);

            });


            closeSearch();


            if (matchingProduct) {

                matchingProduct.scrollIntoView({

                    behavior: reducedMotion ? "auto" : "smooth",

                    block: "center"

                });

                matchingProduct.style.outline =
                    "2px solid var(--arrival-gold)";

                setTimeout(() => {

                    matchingProduct.style.outline = "";

                }, 2000);

            } else {

                showNotice(
                    `No matching product found for "${query}". Try another search.`
                );

            }

        });

    }



    /* =====================================================
       LOGIN MODAL
       Front-end prototype only. Not real authentication.
    ===================================================== */

    const loginModal = select("#loginModal");
    const loginModalOpen = select("#loginModalOpen");
    const loginModalClose = select("#loginModalClose");
    const loginModalOverlay = select("#loginModalOverlay");

    const loginTabs = selectAll(".login-tab");
    const loginAccountType = select("#loginAccountType");

    const loginForm = select("#eloraLoginForm");
    const loginEmail = select("#loginEmail");
    const loginPassword = select("#loginPassword");

    const toggleLoginPassword = select("#toggleLoginPassword");
    const loginMessage = select("#loginMessage");


    function openLoginModal() {

        if (!loginModal) return;

        closeDrawer();
        closeSearch();

        loginModal.classList.add("active");

        loginModal.setAttribute("aria-hidden", "false");

        lockBody();

        setTimeout(() => loginEmail?.focus(), 100);

    }


    function closeLoginModal() {

        if (!loginModal) return;

        loginModal.classList.remove("active");

        loginModal.setAttribute("aria-hidden", "true");

        unlockBody();

    }


    /* Login modal open/close is handled centrally by the main module */


    loginTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            loginTabs.forEach(otherTab => {

                const isActive = otherTab === tab;

                otherTab.classList.toggle("active", isActive);

                otherTab.setAttribute(
                    "aria-selected",
                    String(isActive)
                );

            });


            if (loginAccountType) {

                loginAccountType.value =
                    tab.dataset.loginTab || "customer";

            }


            if (loginMessage) {

                loginMessage.textContent = "";

            }

        });

    });


    if (toggleLoginPassword && loginPassword) {

        toggleLoginPassword.addEventListener("click", () => {

            const currentlyHidden = loginPassword.type === "password";

            loginPassword.type = currentlyHidden ? "text" : "password";

            toggleLoginPassword.setAttribute(
                "aria-label",
                currentlyHidden ? "Hide password" : "Show password"
            );


            const icon = select("i", toggleLoginPassword);

            if (icon) {

                icon.classList.toggle("fa-eye", !currentlyHidden);

                icon.classList.toggle("fa-eye-slash", currentlyHidden);

            }

        });

    }


    if (loginForm) {

        loginForm.addEventListener("submit", event => {

            event.preventDefault();


            if (!loginForm.checkValidity()) {

                loginForm.reportValidity();

                return;

            }


            if (loginMessage) {

                loginMessage.textContent =
                    "This is a front-end demo. Connect a secure authentication service to sign in.";

            }

        });

    }



    /* =====================================================
       ESC KEY — CLOSE OPEN OVERLAYS (Delegated)
    ===================================================== */

    window.closeSearch = closeSearch;



    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements = selectAll(
        ".luxury-strip-item, .section-heading, .product-card, " +
        ".category-card, .editors-content, .editors-visual, " +
        ".trending-card, .exclusive-content"
    );


    if ("IntersectionObserver" in window && !reducedMotion) {

        const revealObserver = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("is-visible");

                    revealObserver.unobserve(entry.target);

                }

            });

        }, {
            threshold: 0.12
        });


        revealElements.forEach(element => {

            element.classList.add("reveal-on-scroll");

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add("is-visible");

        });

    }



    /* =====================================================
       IMAGE FALLBACK
       Displays a neutral placeholder if an image is missing.
    ===================================================== */

    selectAll(".new-arrivals-page img").forEach(img => {

        img.addEventListener("error", () => {

            if (img.dataset.fallbackApplied === "true") return;

            img.dataset.fallbackApplied = "true";

            img.style.background = "#e9dfd0";

            img.style.objectFit = "contain";

            img.alt = img.alt || "Product image unavailable";

        });

    });


});









/* =========================================================
   ÉLAN STUDIO — WEBSITE INTERACTIONS
   Vanilla JavaScript only
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       01. HERO SLIDER
    ========================= */

    const heroStage = document.getElementById("heroModelStage");

    if (heroStage) {
        const slides = Array.from(
            heroStage.querySelectorAll(".hero-model-slide")
        );

        const dots = Array.from(
            document.querySelectorAll(".hero-dot")
        );

        const previousButton = document.querySelector(".hero-prev");
        const nextButton = document.querySelector(".hero-next");

        let currentSlide = 0;
        let sliderTimer = null;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const sliderInterval = 5000;

        function showSlide(index) {
            if (!slides.length) return;

            currentSlide = (index + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                const isActive = slideIndex === currentSlide;

                slide.classList.toggle("is-active", isActive);

                slide.setAttribute(
                    "aria-hidden",
                    String(!isActive)
                );

                slide.querySelectorAll("a, button").forEach((element) => {
                    if (!isActive) {
                        element.setAttribute("tabindex", "-1");
                    } else {
                        element.removeAttribute("tabindex");
                    }
                });
            });

            dots.forEach((dot, dotIndex) => {
                const isActive = dotIndex === currentSlide;

                dot.classList.toggle("is-active", isActive);

                dot.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            });
        }

        function stopSlider() {
            if (sliderTimer !== null) {
                window.clearInterval(sliderTimer);
                sliderTimer = null;
            }
        }

        function startSlider() {
            stopSlider();

            if (reduceMotion || slides.length < 2) return;

            sliderTimer = window.setInterval(() => {
                if (!document.hidden) {
                    showSlide(currentSlide + 1);
                }
            }, sliderInterval);
        }

        function goToSlide(index) {
            showSlide(index);
            startSlider();
        }

        previousButton?.addEventListener("click", () => {
            goToSlide(currentSlide - 1);
        });

        nextButton?.addEventListener("click", () => {
            goToSlide(currentSlide + 1);
        });

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                const requestedIndex = Number(
                    dot.dataset.slideTo ?? index
                );

                goToSlide(
                    Number.isFinite(requestedIndex)
                        ? requestedIndex
                        : index
                );
            });
        });

        heroStage.addEventListener("mouseenter", stopSlider);
        heroStage.addEventListener("mouseleave", startSlider);

        heroStage.addEventListener("focusin", stopSlider);
        heroStage.addEventListener("focusout", (event) => {
            if (!heroStage.contains(event.relatedTarget)) {
                startSlider();
            }
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopSlider();
            } else {
                startSlider();
            }
        });

        showSlide(0);
        startSlider();
    }


    /* =========================
       02. WISHLIST BUTTONS
    ========================= */

    const wishlistButtons = document.querySelectorAll(
        ".wishlist-button"
    );

    wishlistButtons.forEach((button) => {
        button.setAttribute(
            "aria-pressed",
            button.classList.contains("is-active") ? "true" : "false"
        );

        button.addEventListener("click", () => {
            const isActive = button.classList.toggle("is-active");

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );

            const icon = button.querySelector("i");

            if (icon) {
                icon.classList.toggle("fa-solid", isActive);
                icon.classList.toggle("fa-regular", !isActive);
            }

            button.setAttribute(
                "aria-label",
                isActive
                    ? "Remove from wishlist"
                    : "Add to wishlist"
            );
        });
    });


    /* =========================
       03. QUICK ADD TO BAG
    ========================= */

    const quickAddButtons = document.querySelectorAll(".quick-add");

    const bagCount = document.querySelector(
        ".bag-count, #bagCount, [data-bag-count]"
    );

    let totalItems = Number(bagCount?.textContent) || 0;

    quickAddButtons.forEach((button) => {
        button.addEventListener("click", () => {

            // Update bag count if a bag counter exists in the HTML.
            totalItems += 1;

            if (bagCount) {
                bagCount.textContent = String(totalItems);

                bagCount.setAttribute(
                    "aria-label",
                    `${totalItems} items in bag`
                );
            }

            const originalText =
                button.dataset.originalText ||
                button.textContent.trim() ||
                "ADD TO BAG";

            button.dataset.originalText = originalText;

            button.textContent = "ADDED ✓";
            button.classList.add("is-added");

            button.setAttribute("aria-live", "polite");

            window.setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove("is-added");
            }, 1500);
        });
    });


    /* =========================
       04. PRODUCT SWATCHES
    ========================= */

    document.querySelectorAll(".product-swatches").forEach((group) => {
        const swatches = group.querySelectorAll(".swatch");

        swatches.forEach((swatch, index) => {
            swatch.setAttribute(
                "aria-pressed",
                swatch.classList.contains("is-active")
                    ? "true"
                    : "false"
            );

            swatch.addEventListener("click", () => {
                swatches.forEach((item) => {
                    item.classList.remove("is-active");
                    item.setAttribute("aria-pressed", "false");
                });

                swatch.classList.add("is-active");
                swatch.setAttribute("aria-pressed", "true");

                // Visual selection only; no product variant backend.
                swatch.setAttribute(
                    "aria-label",
                    `Selected colour ${index + 1}`
                );
            });
        });
    });


    /* =========================
       05. NEWSLETTER FORM
    ========================= */

    const newsletterForm = document.getElementById("newsletterForm");

    if (newsletterForm) {
        const emailInput = document.getElementById("newsletterEmail");

        const messageElement = document.getElementById(
            "newsletterMessage"
        );

        newsletterForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!emailInput) return;

            const email = emailInput.value.trim();

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                if (messageElement) {
                    messageElement.textContent =
                        "Please enter a valid email address.";

                    messageElement.style.color = "#dfcba5";
                }

                emailInput.setAttribute("aria-invalid", "true");
                emailInput.focus();

                return;
            }

            emailInput.removeAttribute("aria-invalid");

            if (messageElement) {
                messageElement.textContent =
                    "Thank you! Your email has been validated.";

                messageElement.style.color = "#dfcba5";
            }

            /*
              Frontend demo only.
              A backend or email marketing service is required
              to save email addresses or send newsletters.
            */

            newsletterForm.reset();
        });
    }


    /* =========================
       06. SCROLL REVEAL
    ========================= */

    const revealElements = document.querySelectorAll(
        ".section-heading, " +
        ".collection-card, " +
        ".product-card, " +
        ".category-card, " +
        ".story-visual, " +
        ".story-content, " +
        ".newsletter-content"
    );

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if ("IntersectionObserver" in window && !prefersReducedMotion) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach((element) => {
            element.classList.add("js-reveal");
            revealObserver.observe(element);
        });

    } else {
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });
    }


    /* =========================
       07. ANCHOR SCROLL
    ========================= */

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!href || href === "#") return;

            const target = document.querySelector(href);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });
        });
    });

});














/* =========================================================
   ÉLORA — COMPLETE AUTO-ROTATING PRODUCT CAROUSEL
   Automatic rotation | Dynamic content | Dots | Progress
   Previous / Next | Swipe | Wishlist
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    const carousel = document.getElementById("arrivalCarousel");

    if (!carousel) return;

    const slides = [...carousel.querySelectorAll(".arrival-slide")];

    const prevButton = document.getElementById("arrivalPrev");
    const nextButton = document.getElementById("arrivalNext");

    const heroTitle = document.getElementById("arrivalProductTitle");
    const heroCategory = document.getElementById("arrivalCategory");
    const heroDescription = document.getElementById("arrivalDescription");
    const heroPrice = document.getElementById("arrivalPrice");
    const heroOldPrice = document.getElementById("arrivalOldPrice");
    const heroBadge = document.getElementById("arrivalBadge");
    const shopLink = document.getElementById("arrivalShopLink");

    const dots = [
        ...document.querySelectorAll(".arrival-dot")
    ];

    const currentNumber = document.getElementById("arrivalCurrentNumber");
    const progressBar = document.getElementById("arrivalProgress");

    const wishlistButton = document.getElementById("arrivalWishlist");

    if (!slides.length) return;

    /* SETTINGS */

    const ROTATION_DELAY = 4500;
    const ANIMATION_DURATION = 850;

    let currentIndex = Math.max(
        0,
        slides.findIndex(slide =>
            slide.classList.contains("is-active")
        )
    );

    let autoplayTimer = null;
    let progressAnimation = null;
    let isAnimating = false;

    /* ==========================================
       PRODUCT DATA
    ========================================== */

    function getProduct(slide) {
        return {
            category: slide.dataset.category || "",
            name: slide.dataset.name || "",
            description: slide.dataset.description || "",
            price: slide.dataset.price || "",
            oldPrice: slide.dataset.oldPrice || "",
            badge: slide.dataset.badge || "",
            link: slide.dataset.link || "index.html"
        };
    }

    /* ==========================================
       UPDATE HERO CONTENT
    ========================================== */

    function updateContent(index) {

        const product = getProduct(slides[index]);

        if (heroCategory) {
            heroCategory.textContent = product.category;
        }

        if (heroTitle) {
            heroTitle.textContent = product.name;
        }

        if (heroDescription) {
            heroDescription.textContent = product.description;
        }

        if (heroPrice) {
            heroPrice.textContent = product.price;
        }

        if (heroOldPrice) {
            heroOldPrice.textContent = product.oldPrice;
        }

        if (heroBadge) {
            heroBadge.textContent = product.badge;
        }

        if (shopLink) {
            shopLink.href = product.link;
        }

        if (currentNumber) {
            currentNumber.textContent =
                String(index + 1).padStart(2, "0");
        }

        /* Update pagination */

        dots.forEach((dot, dotIndex) => {

            const isCurrent = dotIndex === index;

            dot.classList.toggle("active", isCurrent);

            if (isCurrent) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });

        /* Update image indexes */

        slides.forEach((slide, slideIndex) => {

            const number = slide.querySelector(".product-index");

            if (number) {
                number.textContent =
                    `${String(slideIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
            }
        });

        /* Reset wishlist state for new product */

        if (wishlistButton) {

            wishlistButton.setAttribute("aria-pressed", "false");

            const icon = wishlistButton.querySelector("i");

            if (icon) {
                icon.classList.remove("fa-solid");
                icon.classList.add("fa-regular");
            }
        }

        /* Notify other scripts if needed */

        carousel.dispatchEvent(
            new CustomEvent("arrival:change", {
                detail: {
                    index,
                    product
                }
            })
        );
    }

    /* ==========================================
       SHOW SLIDE
    ========================================== */

    function showSlide(index, direction = "next", force = false) {

        if (isAnimating && !force) return;

        const nextIndex =
            (index + slides.length) % slides.length;

        if (nextIndex === currentIndex && !force) return;

        isAnimating = true;

        const oldSlide = slides[currentIndex];
        const newSlide = slides[nextIndex];

        /* Reset previous slide */

        slides.forEach(slide => {

            slide.classList.remove(
                "is-entering",
                "is-leaving",
                "slide-next",
                "slide-prev"
            );

        });

        oldSlide.classList.remove("is-active");
        oldSlide.classList.add("is-leaving");

        oldSlide.setAttribute("aria-hidden", "true");

        /* Activate next slide */

        newSlide.classList.add("is-active", "is-entering");

        newSlide.classList.toggle(
            "slide-next",
            direction === "next"
        );

        newSlide.classList.toggle(
            "slide-prev",
            direction === "prev"
        );

        newSlide.setAttribute("aria-hidden", "false");

        currentIndex = nextIndex;

        updateContent(currentIndex);

        /* Clean animation classes */

        window.setTimeout(() => {

            slides.forEach(slide => {

                slide.classList.remove(
                    "is-entering",
                    "is-leaving",
                    "slide-next",
                    "slide-prev"
                );

            });

            isAnimating = false;

        }, ANIMATION_DURATION);
    }

    /* ==========================================
       AUTOPLAY PROGRESS BAR
    ========================================== */

    function startProgress() {

        if (!progressBar) return;

        if (progressAnimation) {
            cancelAnimationFrame(progressAnimation);
        }

        progressBar.style.transition = "none";
        progressBar.style.width = "0%";

        /* Force browser layout */

        void progressBar.offsetWidth;

        progressBar.style.transition =
            `width ${ROTATION_DELAY}ms linear`;

        progressBar.style.width = "100%";
    }

    /* ==========================================
       AUTOPLAY
    ========================================== */

    function stopAutoplay() {

        if (autoplayTimer) {
            clearTimeout(autoplayTimer);
            autoplayTimer = null;
        }

        if (progressAnimation) {
            cancelAnimationFrame(progressAnimation);
            progressAnimation = null;
        }

        if (progressBar) {
            progressBar.style.transition = "none";
        }
    }

    function startAutoplay() {

        stopAutoplay();

        if (document.hidden) return;

        startProgress();

        autoplayTimer = window.setTimeout(() => {

            showSlide(currentIndex + 1, "next");

            startAutoplay();

        }, ROTATION_DELAY);
    }

    /* ==========================================
       PREVIOUS / NEXT BUTTONS
    ========================================== */

    if (nextButton) {

        nextButton.addEventListener("click", () => {

            showSlide(currentIndex + 1, "next");

            startAutoplay();

        });
    }

    if (prevButton) {

        prevButton.addEventListener("click", () => {

            showSlide(currentIndex - 1, "prev");

            startAutoplay();

        });
    }

    /* ==========================================
       PAGINATION DOTS
    ========================================== */

    dots.forEach((dot, index) => {

        dot.addEventListener("click", () => {

            if (index === currentIndex) {
                startAutoplay();
                return;
            }

            showSlide(
                index,
                index > currentIndex ? "next" : "prev"
            );

            startAutoplay();

        });
    });

    /* ==========================================
       PAUSE WHEN HOVERING
    ========================================== */

    carousel.addEventListener("mouseenter", stopAutoplay);

    carousel.addEventListener("mouseleave", startAutoplay);

    /* Also pause while interacting with hero content */

    const heroContent = document.getElementById("arrivalHeroContent");

    if (heroContent) {

        heroContent.addEventListener("mouseenter", stopAutoplay);

        heroContent.addEventListener("mouseleave", startAutoplay);
    }

    /* ==========================================
       PAUSE WHEN TAB IS HIDDEN
    ========================================== */

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }

    });

    /* ==========================================
       TOUCH SWIPE
    ========================================== */

    let touchStartX = 0;
    let touchStartY = 0;

    carousel.addEventListener("touchstart", event => {

        if (!event.changedTouches.length) return;

        touchStartX = event.changedTouches[0].clientX;
        touchStartY = event.changedTouches[0].clientY;

    }, { passive: true });

    carousel.addEventListener("touchend", event => {

        if (!event.changedTouches.length) return;

        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaX) < 50) return;
        if (Math.abs(deltaX) < Math.abs(deltaY)) return;

        if (deltaX < 0) {
            showSlide(currentIndex + 1, "next");
        } else {
            showSlide(currentIndex - 1, "prev");
        }

        startAutoplay();

    }, { passive: true });

    /* ==========================================
       KEYBOARD CONTROLS
    ========================================== */

    carousel.addEventListener("keydown", event => {

        if (event.key === "ArrowRight") {
            showSlide(currentIndex + 1, "next");
            startAutoplay();
        }

        if (event.key === "ArrowLeft") {
            showSlide(currentIndex - 1, "prev");
            startAutoplay();
        }
    });

    /* ==========================================
       WISHLIST BUTTON
    ========================================== */

    if (wishlistButton) {

        wishlistButton.addEventListener("click", () => {

            const isSaved =
                wishlistButton.getAttribute("aria-pressed") === "true";

            wishlistButton.setAttribute(
                "aria-pressed",
                String(!isSaved)
            );

            const icon = wishlistButton.querySelector("i");

            if (icon) {

                icon.classList.toggle("fa-solid", !isSaved);

                icon.classList.toggle("fa-regular", isSaved);
            }
        });
    }

    /* ==========================================
       INITIALIZE
    ========================================== */

    slides.forEach((slide, index) => {

        slide.classList.toggle(
            "is-active",
            index === currentIndex
        );

        slide.classList.remove(
            "is-entering",
            "is-leaving",
            "slide-next",
            "slide-prev"
        );

        slide.setAttribute(
            "aria-hidden",
            index === currentIndex ? "false" : "true"
        );
    });

    updateContent(currentIndex);
    startAutoplay();

});













/* =========================================================
   ÉLAN STUDIO — AUTOMATIC HERO MODEL SLIDER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const slides = document.querySelectorAll(".hero-model-slide");

    if (!slides.length) return;

    let currentSlide = 0;
    const slideDuration = 3500; // 3.5 seconds

    function showSlide(index) {

        slides.forEach((slide, i) => {

            slide.classList.remove("active");

            if (i === index) {
                slide.classList.add("active");
            }

        });

    }

    // Initial slide
    showSlide(currentSlide);

    // Automatic slide change
    setInterval(() => {

        currentSlide = (currentSlide + 1) % slides.length;

        showSlide(currentSlide);

    }, slideDuration);

});
