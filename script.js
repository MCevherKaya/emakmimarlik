
const btn = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

btn?.addEventListener("click", () => {
  nav.classList.toggle("show");
});

document.querySelectorAll(".nav-links a").forEach((a) => {
  a.addEventListener("click", () => nav.classList.remove("show"));
});

const counters = document.querySelectorAll(".counter");

const animateCounter = (counter) => {
  const target = Number(counter.dataset.target);
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
    if (e.key === "Escape" && lightbox.classList.contains("show")) closeLightbox();
  });
}


/* BEFORE / AFTER SLIDER */
document.querySelectorAll(".compare-slider").forEach((slider) => {
  const range = slider.querySelector(".compare-range");
  const afterImg = slider.querySelector(".compare-img.after");
  const handle = slider.querySelector(".compare-handle");

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

  const toggleSound = () => {
    video.muted = !video.muted;
    video.volume = 0.65;
    video.play().catch(() => {});
    updateText();
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSound();
  });

  video.addEventListener("click", toggleSound);
  updateText();
});


/* FORCE HERO VIDEO AUTOPLAY */
window.addEventListener("load", () => {
  const video = document.querySelector(".hero-video");
  if (!video) return;

  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "auto";

  const playVideo = () => {
    video.play().catch(() => {});
  };

  playVideo();
  setTimeout(playVideo, 500);
  setTimeout(playVideo, 1500);
});


/* WEB3FORMS CONTACT FORM */
document.querySelectorAll(".web3forms-form").forEach((form) => {
  const submitBtn = form.querySelector(".form-submit");
  const status = form.querySelector(".form-status");

  const showStatus = (message, type) => {
    if (!status) return;
    status.innerHTML = message;
    status.className = `form-status show ${type}`;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const originalText = submitBtn ? submitBtn.textContent : "Gönder";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Gönderiliyor...";
    }
    showStatus("", "");

    try {
      const formData = new FormData(form);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        showStatus("✅ <strong>Talebiniz başarıyla alınmıştır.</strong><br>En kısa sürede sizinle iletişime geçeceğiz.", "success");
        form.reset();
      } else {
        showStatus("Bir sorun oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin ya da WhatsApp üzerinden bize ulaşın.", "error");
      }
    } catch (error) {
      showStatus("Bağlantı sırasında bir sorun oluştu. Lütfen tekrar deneyin ya da WhatsApp üzerinden bize ulaşın.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
});

/* FLOATING WHATSAPP + SCROLL TOP */
(() => {
  if (document.querySelector(".floating-actions")) return;

  const wrap = document.createElement("div");
  wrap.className = "floating-actions";
  wrap.innerHTML = `
    <a class="float-btn float-whatsapp" href="https://wa.me/905321204785?text=Merhaba,%20EMAK%20Mimarl%C4%B1k%20ile%20projem%20hakk%C4%B1nda%20g%C3%B6r%C3%BC%C5%9Fmek%20ve%20teklif%20almak%20istiyorum." target="_blank" rel="noopener" aria-label="WhatsApp üzerinden yazın">💬 <span>WhatsApp</span></a>
    <button class="float-btn float-top" type="button" aria-label="Yukarı çık">↑</button>
  `;
  document.body.appendChild(wrap);

  const topBtn = wrap.querySelector(".float-top");
  const toggleTop = () => {
    if (window.scrollY > 500) topBtn.classList.add("show");
    else topBtn.classList.remove("show");
  };
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", toggleTop, { passive: true });
  toggleTop();
})();
