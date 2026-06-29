const btn = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

btn?.addEventListener("click", () => {
  nav?.classList.toggle("show");
});

document.querySelectorAll(".nav-links a").forEach((a) => {
  a.addEventListener("click", () => nav?.classList.remove("show"));
});

/* COUNTERS */
const counters = document.querySelectorAll(".counter");
const animateCounter = (counter) => {
  const target = Number(counter.dataset.target || 0);
  const duration = 1500;
  const start = performance.now();

  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    counter.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(update);
    else counter.textContent = target;
  };

  requestAnimationFrame(update);
};

if (counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );
  counters.forEach((counter) => counterObserver.observe(counter));
}

/* REVEAL */
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

/* LIGHTBOX */
const galleryImages = document.querySelectorAll(".gallery-grid img");
if (galleryImages.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Kapat">×</button>
    <img src="" alt="Büyük proje görseli">
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".lightbox-close");

  const openLightbox = (img) => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "Büyük proje görseli";
    lightbox.classList.add("show");
    document.body.classList.add("lightbox-open");
  };

  const closeLightbox = () => {
    lightbox.classList.remove("show");
    document.body.classList.remove("lightbox-open");
    lightboxImg.src = "";
  };

  galleryImages.forEach((img) => img.addEventListener("click", () => openLightbox(img)));
  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && lightbox.classList.contains("show")) closeLightbox(); });
}

/* BEFORE / AFTER SLIDER */
document.querySelectorAll(".compare-slider").forEach((slider) => {
  const range = slider.querySelector(".compare-range");
  const afterImg = slider.querySelector(".compare-img.after");
  const handle = slider.querySelector(".compare-handle");
  if (!range || !afterImg || !handle) return;

  const updateSlider = () => {
    const value = range.value;
    afterImg.style.clipPath = `inset(0 0 0 ${value}%)`;
    handle.style.left = `${value}%`;
  };

  range.addEventListener("input", updateSlider);
  updateSlider();
});

/* HERO VIDEO SOUND TOGGLE */
document.querySelectorAll(".hero-video-frame").forEach((frame) => {
  const video = frame.querySelector("video");
  const toggle = frame.querySelector(".video-sound-toggle");
  if (!video || !toggle) return;

  const updateText = () => {
    toggle.textContent = video.muted ? "Sesi Aç" : "Sesi Kapat";
    toggle.setAttribute("aria-label", video.muted ? "Video sesini aç" : "Video sesini kapat");
  };

  const playVideo = () => video.play().catch(() => {});

  const toggleSound = () => {
    video.muted = !video.muted;
    video.volume = video.muted ? 0 : 1;
    playVideo();
    updateText();
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSound();
  });

  video.addEventListener("click", toggleSound);
  video.muted = true; // tarayıcıların otomatik oynatmayı engellememesi için ilk açılış sessizdir
  video.volume = 0;
  playVideo();
  updateText();
});

/* WEB3FORMS CONTACT FORMS */
document.querySelectorAll(".web3forms-form").forEach((form) => {
  const status = form.querySelector(".form-status");
  const submitButton = form.querySelector(".form-submit");
  if (!status || !submitButton) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    status.className = "form-status show";
    status.textContent = "Gönderiliyor...";
    submitButton.disabled = true;
    submitButton.textContent = "Gönderiliyor...";

    try {
      const formData = new FormData(form);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const result = await response.json();

      if (response.ok && result.success) {
        status.className = "form-status show success";
        status.innerHTML = "✅ Talebiniz başarıyla alınmıştır.<br>En kısa sürede sizinle iletişime geçeceğiz.";
        form.reset();
      } else {
        throw new Error(result.message || "Form gönderilemedi.");
      }
    } catch (error) {
      status.className = "form-status show error";
      status.textContent = "❌ Bir hata oluştu. Lütfen tekrar deneyin veya WhatsApp üzerinden iletişime geçin.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Gönder";
    }
  });
});

/* FLOATING ACTIONS */
if (!document.querySelector(".floating-actions")) {
  const actions = document.createElement("div");
  actions.className = "floating-actions";
  actions.innerHTML = `
    <a class="float-btn float-whatsapp" href="https://wa.me/905321204785?text=Merhaba,%20EMAK%20Mimarl%C4%B1k%20ile%20projem%20hakk%C4%B1nda%20g%C3%B6r%C3%BC%C5%9Fmek%20ve%20teklif%20almak%20istiyorum." target="_blank" rel="noopener" aria-label="WhatsApp ile iletişime geç">
      <span>💬 WhatsApp</span>
    </a>
    <button class="float-btn float-top" type="button" aria-label="Sayfanın üstüne çık">↑</button>
  `;
  document.body.appendChild(actions);

  const topBtn = actions.querySelector(".float-top");
  window.addEventListener("scroll", () => {
    topBtn.classList.toggle("show", window.scrollY > 500);
  });
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
