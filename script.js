const btn = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

btn?.addEventListener("click", () => {
  nav.classList.toggle("show");
});

document.querySelectorAll(".nav-links a").forEach((a) => {
  a.addEventListener("click", () => {
    nav.classList.remove("show");
  });
});

/* LIGHTBOX */
const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.innerHTML = `
  <button class="lightbox-close" aria-label="Kapat">×</button>
  <img src="" alt="Büyük proje görseli">
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector("img");
const closeBtn = lightbox.querySelector(".lightbox-close");

document.addEventListener("click", (e) => {
  const img = e.target.closest(".gallery-grid img");

  if (img) {
    lightboxImg.src = img.src;
    lightbox.classList.add("show");
  }

  if (e.target === lightbox || e.target === closeBtn) {
    lightbox.classList.remove("show");
    lightboxImg.src = "";
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    lightbox.classList.remove("show");
    lightboxImg.src = "";
  }
});
