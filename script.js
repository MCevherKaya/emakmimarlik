const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("show");
    const isExpanded = nav.classList.contains("show");
    menuToggle.setAttribute("aria-expanded", isExpanded);
  });
}

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("show");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});
