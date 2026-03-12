// Custom cursor
const cursor = document.querySelector(".custom-cursor");

if (cursor) {
  let cursorVisible = false;

  const showCursor = () => {
    if (!cursorVisible) {
      cursorVisible = true;
      cursor.style.opacity = "1";
    }
  };

  const hideCursor = () => {
    cursorVisible = false;
    cursor.style.opacity = "0";
  };

  window.addEventListener("mousemove", (e) => {
    showCursor();
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  window.addEventListener("mouseleave", hideCursor);

  // Slight grow on interactive elements
  const interactiveSelectors = "a, button, .btn, .nav-cta, .project-card, .skill-card";
  document.querySelectorAll(interactiveSelectors).forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.style.transform += " scale(1.35)";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.transform = cursor.style.transform.replace(/scale\([^)]+\)/, "");
    });
  });
}

// Theme Toggle Logic
const themeToggleBtn = document.getElementById("theme-toggle");

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    // Add transition class for smooth theme changes
    document.documentElement.classList.add("theme-transition");
    
    // Determine the current theme
    const currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    
    // Set new theme
    if (newTheme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    
    // Save preference
    localStorage.setItem("theme", newTheme);
    
    // Remove transition class after animation completes
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 400);
  });
}

// Scroll reveal for sections
const revealSections = document.querySelectorAll(".section-reveal");

if ("IntersectionObserver" in window && revealSections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealSections.forEach((section) => observer.observe(section));
} else {
  // Fallback
  revealSections.forEach((section) => section.classList.add("in-view"));
}

// Mobile Menu Logic
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const navCloseBtn = document.getElementById("nav-close-btn");
const mobileNav = document.getElementById("mobile-nav");
const menuOverlay = document.getElementById("menu-overlay");
const navLinks = mobileNav ? mobileNav.querySelectorAll("a") : [];

const openMenu = () => {
  if (mobileNav && menuOverlay) {
    mobileNav.classList.add("open");
    menuOverlay.classList.add("open");
    document.body.style.overflow = "hidden"; // Prevent scrolling when menu is active
  }
};

const closeMenu = () => {
  if (mobileNav && menuOverlay) {
    mobileNav.classList.remove("open");
    menuOverlay.classList.remove("open");
    document.body.style.overflow = ""; // Restore scrolling
  }
};

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", openMenu);
}
if (navCloseBtn) {
  navCloseBtn.addEventListener("click", closeMenu);
}
if (menuOverlay) {
  menuOverlay.addEventListener("click", closeMenu);
}

// Close mobile menu when clicking a link
navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// SVG language ring progress animation
const langCards = document.querySelectorAll('.pm-lang-card[data-lang-level]');
const CIRCUMFERENCE = 2 * Math.PI * 35; // r=35 → ~219.9

langCards.forEach(card => {
  const level   = parseInt(card.dataset.langLevel || '0', 10);
  const ring    = card.querySelector('.pm-lang-ring-fill');
  if (!ring) return;

  const target = CIRCUMFERENCE * (1 - level / 100);

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          ring.style.strokeDashoffset = target;
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(card);
  } else {
    ring.style.strokeDashoffset = target;
  }
});

// Smooth scroll for anchor links (bonus for older browsers)
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72; // offset for sticky header
    window.scrollTo({ top, behavior: "smooth" });
  });
});

// Dynamic year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear().toString();
}

