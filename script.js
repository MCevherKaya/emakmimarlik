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

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      counter.textContent = target;
    }
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

/* REVEAL ANIMATION */
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

/* GALLERY LIGHTBOX */
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

  galleryImages.forEach((img) => {
    img.addEventListener("click", () => openLightbox(img));
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("show")) {
      closeLightbox();
    }
  });
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

/* HERO VIDEO AUTOPLAY + SOUND TOGGLE */
document.querySelectorAll(".hero-video-frame").forEach((frame) => {
  const video = frame.querySelector("video");
  const toggle = frame.querySelector(".video-sound-toggle");
  if (!video) return;

  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "auto";

  const updateText = () => {
    if (!toggle) return;
    toggle.textContent = video.muted ? "Sesi Aç" : "Sesi Kapat";
    toggle.setAttribute("aria-label", video.muted ? "Video sesini aç" : "Video sesini kapat");
  };

  const playVideo = () => {
    video.play().catch(() => {});
  };

  const toggleSound = () => {
    video.muted = !video.muted;
    video.volume = 1.0;
    playVideo();
    updateText();
  };

  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSound();
  });

  video.addEventListener("click", toggleSound);

  playVideo();
  setTimeout(playVideo, 500);
  setTimeout(playVideo, 1500);
  updateText();
});

/* CONTACT FORM - WEB3FORMS */
document.querySelectorAll(".web3forms-form").forEach((form) => {
  const status = form.querySelector(".form-status");
  const submit = form.querySelector(".form-submit");

  const showStatus = (type, message) => {
    if (!status) return;
    status.className = `form-status show ${type}`;
    status.innerHTML = message;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const originalText = submit?.textContent || "Gönder";

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Gönderiliyor...";
    }

    showStatus("", "Talebiniz gönderiliyor...");

    const formData = new FormData(form);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showStatus(
          "success",
          "✅ Talebiniz başarıyla alınmıştır.<br>En kısa sürede sizinle iletişime geçeceğiz."
        );
        form.reset();
      } else {
        showStatus(
          "error",
          "❌ Mesaj gönderilemedi. Lütfen bilgileri kontrol edip tekrar deneyin."
        );
      }
    } catch (error) {
      showStatus(
        "error",
        "❌ Bağlantı hatası oluştu. Lütfen tekrar deneyin veya WhatsApp üzerinden iletişime geçin."
      );
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalText;
      }
    }
  });
});

/* FLOATING BUTTONS */
const topButton = document.querySelector(".float-top");

window.addEventListener("scroll", () => {
  if (!topButton) return;
  if (window.scrollY > 500) {
    topButton.classList.add("show");
  } else {
    topButton.classList.remove("show");
  }
});

topButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
