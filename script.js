const btn=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav-links');
btn?.addEventListener('click',()=>nav.classList.toggle('show'));
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('show')));
const counters = document.querySelectorAll(".counter");

const runCounter = (counter) => {
  const target = Number(counter.dataset.target);
  let current = 0;
  const step = Math.ceil(target / 70);

  const updateCounter = () => {
    current += step;

    if (current >= target) {
      counter.textContent = target;
      return;
    }

    counter.textContent = current;
    requestAnimationFrame(updateCounter);
  };

  updateCounter();
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);

counters.forEach((counter) => counterObserver.observe(counter));
