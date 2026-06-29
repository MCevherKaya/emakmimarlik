// EMAK Mimarlık site interactions
const btn = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
btn?.addEventListener("click", () => nav?.classList.toggle("show"));
document.querySelectorAll(".nav-links a").forEach((a) => {
  a.addEventListener("click", () => nav?.classList.remove("show"));
});

// Counters
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
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  counters.forEach((counter) => counterObserver.observe(counter));
}

// Reveal animations
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => revealObserver.observe(el));
}

// Gallery lightbox
const galleryImages = document.querySelectorAll(".gallery-grid img");
if (galleryImages.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `<button class="lightbox-close" aria-label="Kapat">×</button><img src="" alt="Büyük proje görseli">`;
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

// Before / after sliders
function initCompareSliders() {
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
}
initCompareSliders();

// Hero video autoplay + sound toggle
function initHeroVideos() {
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
    const playVideo = () => video.play().catch(() => {});
    const toggleSound = () => {
      video.muted = !video.muted;
      video.volume = 1.0;
      playVideo();
      updateText();
    };
    toggle?.addEventListener("click", (e) => { e.stopPropagation(); toggleSound(); });
    video.addEventListener("click", toggleSound);
    playVideo();
    setTimeout(playVideo, 500);
    setTimeout(playVideo, 1500);
    updateText();
  });
}
window.addEventListener("load", initHeroVideos);

// Web3Forms AJAX submit
function initContactForms() {
  document.querySelectorAll(".web3forms-form").forEach((form) => {
    const status = form.querySelector(".form-status");
    const submit = form.querySelector(".form-submit");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (status) {
        status.className = "form-status show";
        status.textContent = "Gönderiliyor...";
      }
      if (submit) {
        submit.disabled = true;
        submit.dataset.originalText = submit.textContent;
        submit.textContent = "Gönderiliyor...";
      }
      try {
        const formData = new FormData(form);
        const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Form gönderilemedi");
        if (status) {
          status.className = "form-status show success";
          status.innerHTML = "✅ Talebiniz başarıyla alınmıştır.<br>En kısa sürede sizinle iletişime geçeceğiz.";
        }
        if (typeof window.gtag === "function") {
          window.gtag("event", "form_submit", {
            event_category: "lead",
            event_label: "contact_form"
          });
        }
        form.reset();
      } catch (error) {
        if (status) {
          status.className = "form-status show error";
          status.textContent = "❌ Bir hata oluştu. Lütfen tekrar deneyin veya WhatsApp üzerinden iletişime geçin.";
        }
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = submit.dataset.originalText || "Gönder";
        }
      }
    });
  });
}
initContactForms();

// Floating buttons
const topBtn = document.querySelector(".float-top");
if (topBtn) {
  window.addEventListener("scroll", () => topBtn.classList.toggle("show", window.scrollY > 450));
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// Cookie consent banner + real Analytics consent control
(function initCookieConsent(){
  const storageKey = "emak_cookie_consent";
  const analyticsId = "G-P24ZPV3R5X";

  const loadAnalytics = () => {
    if (window.__emakAnalyticsLoaded) return;
    window.__emakAnalyticsLoaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", analyticsId, { anonymize_ip: true });
  };

  const consent = localStorage.getItem(storageKey);
  if (consent === "accepted") {
    loadAnalytics();
    return;
  }
  if (consent === "rejected") return;

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-live", "polite");
  banner.innerHTML = `
    <div>
      <strong>🍪 Çerez Kullanımı</strong>
      <p>Deneyiminizi iyileştirmek ve ziyaretçi analizlerini değerlendirmek için analitik çerezler kullanıyoruz. Reddederseniz Google Analytics çalışmaz. Detaylar için <a href="cerez-politikasi.html">Çerez Politikası</a> sayfamızı inceleyebilirsiniz.</p>
    </div>
    <div class="cookie-actions">
      <button class="cookie-btn reject" type="button">Reddet</button>
      <button class="cookie-btn accept" type="button">Kabul Et</button>
    </div>
  `;
  document.body.appendChild(banner);

  requestAnimationFrame(() => banner.classList.add("show"));

  const closeBanner = (value) => {
    localStorage.setItem(storageKey, value);
    if (value === "accepted") loadAnalytics();
    banner.classList.remove("show");
    setTimeout(() => banner.remove(), 350);
  };

  banner.querySelector(".accept")?.addEventListener("click", () => closeBanner("accepted"));
  banner.querySelector(".reject")?.addEventListener("click", () => closeBanner("rejected"));
})();

// Smart EMAK Chat Support: guided assistant + lead capture + WhatsApp handoff
(function initEmakSmartChat(){
  if (document.querySelector(".emak-chat-launcher")) return;

  const accessKey = "251475d5-185d-41c1-bb67-a38122b4efb8";
  const whatsappUrl = "https://wa.me/905321204785?text=";
  const defaultWhatsappText = "Merhaba, EMAK Mimarlık web sitesindeki canlı destekten geliyorum. Projem hakkında bilgi almak istiyorum.";

  const answers = [
    {
      keys:["hizmet","ne yap","neler","iç mimarlık","mimarlık","dekorasyon","tadilat","anahtar teslim","uygulama"],
      text:"EMAK Mimarlık; İstanbul genelinde mimari tasarım, iç mimarlık, dekorasyon ve anahtar teslim uygulama süreçlerinde hizmet verir. Konut ve ticari alanlarda fikir aşamasından uygulamaya kadar süreci profesyonel şekilde yönetir."
    },
    {
      keys:["fiyat","ücret","maliyet","kaç para","teklif","metrekare","m2"],
      text:"Fiyatlandırma; alanın metrekaresi, kapsamı, malzeme tercihi ve uygulama detaylarına göre değişir. En doğru teklif için kısa bir keşif/görüşme yapılması gerekir. İsterseniz bilgilerinizi bırakın, EMAK ekibi size dönüş yapsın."
    },
    {
      keys:["keşif","kesif","randevu","görüşme","gorusme","ücretsiz","ucretsiz"],
      text:"Keşif ve ön görüşme için telefon, WhatsApp veya iletişim formu üzerinden ulaşabilirsiniz. İstanbul genelinde proje ihtiyacına göre yönlendirme yapılır."
    },
    {
      keys:["adres","nerede","konum","ofis","harita","yol"],
      text:"Operasyon merkezimiz Beylikdüzü Skyport Residence'tadır. Adres: Yakuplu Mah. Hürriyet Blv. Skyport Residence No:1 İç Kapı No:151 Beylikdüzü / İstanbul. İstanbul genelinde hizmet veriyoruz."
    },
    {
      keys:["telefon","ara","numara","iletişim","iletisim"],
      text:"Bize 0 (532) 120 47 85 numarasından ulaşabilirsiniz. Dilerseniz WhatsApp üzerinden de hızlıca mesaj gönderebilirsiniz."
    },
    {
      keys:["instagram","sosyal","profil"],
      text:"Instagram hesabımız: @emak_mimarlik. Güncel çalışmalarımızı ve paylaşımlarımızı oradan da inceleyebilirsiniz."
    },
    {
      keys:["3d","tasarım","tasarim","render","görselleştirme","gorsellestirme","tasarımdan gerçeğe"],
      text:"Evet, 3D tasarım ve görselleştirme süreciyle proje uygulama öncesinde daha net görülebilir. Sitedeki ‘3D Tasarımdan Gerçeğe’ bölümünden örnekleri inceleyebilirsiniz."
    },
    {
      keys:["kaç gün","kaç hafta","süre","zaman","teslim","ne kadar sürer","sure"],
      text:"Proje süresi; işin kapsamına, uygulama alanına ve malzeme tedarik sürecine göre değişir. Ön görüşme sonrası daha net bir takvim paylaşılır."
    },
    {
      keys:["bölge","bolge","istanbul","beylikdüzü","avcılar","esen yurt","esen yurt","hizmet alanı","nerelere"],
      text:"Ofis konumumuz Beylikdüzü’nde olsa da hizmet alanımız İstanbul geneline yayılır. Projenizin konumunu paylaşırsanız uygun yönlendirme yapılır."
    }
  ];

  const launcher = document.createElement("button");
  launcher.className = "emak-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Canlı destek sohbetini aç");
  launcher.innerHTML = `<span class="chat-dot"></span><span class="chat-icon">💬</span><span><small>EMAK Asistan</small><strong>Canlı Destek</strong></span>`;

  const panel = document.createElement("div");
  panel.className = "emak-chat-panel";
  panel.setAttribute("aria-label", "EMAK Mimarlık canlı destek");
  panel.innerHTML = `
    <div class="emak-chat-head">
      <div class="emak-chat-brand">
        <div class="emak-chat-avatar">E</div>
        <div class="emak-chat-title">
          <strong>EMAK Asistan</strong>
          <span>Projeniz için hızlı yönlendirme</span>
        </div>
      </div>
      <button class="emak-chat-close" type="button" aria-label="Sohbeti kapat">×</button>
    </div>
    <div class="emak-chat-messages" role="log" aria-live="polite"></div>
    <div class="emak-chat-quick">
      <button class="chat-quick-btn" type="button" data-chat="Hizmetleriniz neler?">Hizmetler</button>
      <button class="chat-quick-btn" type="button" data-chat="Teklif almak istiyorum">Teklif</button>
      <button class="chat-quick-btn" type="button" data-chat="Keşif randevusu almak istiyorum">Keşif</button>
      <button class="chat-quick-btn" type="button" data-chat="Ofis adresiniz nerede?">Adres</button>
      <button class="chat-quick-btn" type="button" data-chat="3D tasarım yapıyor musunuz?">3D Tasarım</button>
      <button class="chat-quick-btn" type="button" data-action="lead">Beni arasınlar</button>
    </div>
    <form class="emak-chat-input">
      <input type="text" name="chatMessage" placeholder="Sorunuzu yazın..." autocomplete="off" aria-label="Mesajınızı yazın">
      <button class="emak-chat-send" type="submit" aria-label="Mesaj gönder">›</button>
    </form>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const messages = panel.querySelector(".emak-chat-messages");
  const inputForm = panel.querySelector(".emak-chat-input");
  const input = inputForm.querySelector("input");
  const close = panel.querySelector(".emak-chat-close");

  const scrollMessages = () => { messages.scrollTop = messages.scrollHeight; };
  const addMessage = (text, type = "bot", html = false) => {
    const msg = document.createElement("div");
    msg.className = `emak-msg ${type}`;
    if (html) msg.innerHTML = text;
    else msg.textContent = text;
    messages.appendChild(msg);
    scrollMessages();
    return msg;
  };
  const typingThen = (fn) => {
    const typing = addMessage("Yazıyor...", "bot");
    setTimeout(() => { typing.remove(); fn(); }, 420);
  };
  const normalize = (str) => str.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const getAnswer = (question) => {
    const q = normalize(question);
    return answers.find(item => item.keys.some(k => q.includes(normalize(k))));
  };
  const whatsappLink = (text = defaultWhatsappText) => whatsappUrl + encodeURIComponent(text);

  const showLeadForm = (reason = "Canlı destek talebi") => {
    const wrap = document.createElement("div");
    wrap.className = "emak-msg bot";
    wrap.innerHTML = `
      <strong>Size dönüş yapalım.</strong><br>
      <span class="emak-chat-note">Adınızı ve telefonunuzu bırakırsanız EMAK ekibi en kısa sürede size ulaşır.</span>
      <form class="emak-lead-form">
        <input name="name" type="text" placeholder="Adınız Soyadınız" required>
        <input name="phone" type="tel" placeholder="Telefon Numaranız" required>
        <textarea name="message" placeholder="Kısaca projenizi yazın">${reason}</textarea>
        <button type="submit">Bilgilerimi Gönder</button>
      </form>
      <a class="emak-chat-whatsapp" href="${whatsappLink()}" target="_blank" rel="noopener">💬 WhatsApp'a Geç</a>
    `;
    messages.appendChild(wrap);
    scrollMessages();

    const form = wrap.querySelector(".emak-lead-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("button");
      btn.disabled = true;
      btn.textContent = "Gönderiliyor...";
      const fd = new FormData(form);
      fd.append("access_key", accessKey);
      fd.append("subject", "EMAK Mimarlık Canlı Destek Talebi");
      fd.append("from_name", "EMAK Canlı Destek");
      fd.append("talep_kaynagi", "Canlı destek chatbox");
      try {
        const response = await fetch("https://api.web3forms.com/submit", { method:"POST", body:fd });
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Gönderilemedi");
        form.innerHTML = `<span class="emak-chat-note">✅ Talebiniz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçilecektir.</span>`;
        if (typeof window.gtag === "function") window.gtag("event", "chat_lead_submit", { event_category:"lead", event_label:"chatbox" });
      } catch (err) {
        btn.disabled = false;
        btn.textContent = "Bilgilerimi Gönder";
        addMessage("❌ Talebiniz gönderilemedi. Lütfen WhatsApp üzerinden iletişime geçin.", "bot");
      }
    });
  };

  const handleQuestion = (question) => {
    addMessage(question, "user");
    const answer = getAnswer(question);
    typingThen(() => {
      if (answer) {
        addMessage(answer.text, "bot");
        if (/teklif|fiyat|ücret|ucret|keşif|kesif|randevu/i.test(question)) {
          showLeadForm(question);
        }
      } else {
        addMessage("Bu konuda sizi yanlış yönlendirmek istemem. Talebinizi bize iletin; EMAK ekibi size en kısa sürede dönüş yapsın.", "bot");
        showLeadForm(question);
      }
    });
  };

  launcher.addEventListener("click", () => {
    panel.classList.toggle("show");
    if (panel.classList.contains("show")) {
      if (!messages.dataset.started) {
        messages.dataset.started = "true";
        addMessage("Merhaba, EMAK Mimarlık canlı destek asistanıyım. Hizmetler, teklif, keşif, adres veya 3D tasarım hakkında hızlıca yardımcı olabilirim.", "bot");
      }
      setTimeout(() => input.focus(), 150);
    }
  });
  close.addEventListener("click", () => panel.classList.remove("show"));
  panel.querySelectorAll(".chat-quick-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.action === "lead") {
        addMessage("Beni arasınlar", "user");
        typingThen(() => showLeadForm("Canlı destek üzerinden aranma talebi"));
      } else {
        handleQuestion(btn.dataset.chat || btn.textContent);
      }
    });
  });
  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    input.value = "";
    handleQuestion(value);
  });
})();
