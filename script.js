// ================================
// Mobile Menu
// ================================

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.classList.toggle("active");
  });
}

// ================================
// Header Scroll Effect
// ================================

const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 30) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// ================================
// Smooth Scroll
// ================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {

    const target = document.querySelector(this.getAttribute("href"));

    if (!target) return;

    e.preventDefault();

    target.scrollIntoView({
      behavior: "smooth"
    });

    navLinks.classList.remove("active");
    menuToggle.classList.remove("active");
  });
});

// ================================
// Counter Animation
// ================================

const counters = document.querySelectorAll(".counter");

const animateCounter = (counter) => {

  const target = Number(counter.dataset.target);

  const duration = 1800;

  const startTime = performance.now();

  const update = (currentTime) => {

    const progress = Math.min((currentTime - startTime) / duration, 1);

    const value = Math.floor(progress * target);

    counter.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      counter.textContent = target;
    }

  };

  requestAnimationFrame(update);

};

const observer = new IntersectionObserver(

  (entries) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        animateCounter(entry.target);

        observer.unobserve(entry.target);

      }

    });

  },

  {
    threshold: 0.4
  }

);

counters.forEach(counter => observer.observe(counter));
