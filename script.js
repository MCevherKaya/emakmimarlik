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

// Smart EMAK Chat Support: premium guided assistant + lead capture + WhatsApp handoff
(function initEmakSmartChat(){
  if (document.querySelector(".emak-chat-launcher")) return;

  const accessKey = "251475d5-185d-41c1-bb67-a38122b4efb8";
  const phoneDisplay = "0 (532) 120 47 85";
  const phoneHref = "tel:+905321204785";
  const emailHref = "mailto:emakmimari@gmail.com";
  const instagramHref = "https://www.instagram.com/emak_mimarlik/";
  const servicesHref = "hizmetler.html";
  const projectsHref = "projeler.html";
  const quoteHref = "iletisim.html";
  const mapsHref = "https://www.google.com/maps/search/?api=1&query=EMAK%20Mimarl%C4%B1k%20Yakuplu%20Mah.%20H%C3%BCrriyet%20Blv.%20Skyport%20Residence%20No%3A1%20Beylikd%C3%BCz%C3%BC%20%C4%B0stanbul";
  const whatsappUrl = "https://wa.me/905321204785?text=";
  const defaultWhatsappText = "Merhaba, EMAK Mimarlık web sitesindeki canlı destekten geliyorum. Projem hakkında bilgi almak istiyorum.";

  const normalize = (str) => (str || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const businessStatus = () => {
    const now = new Date();
    const day = now.getDay(); // 0 Sunday
    const hour = now.getHours();
    const open = day >= 1 && day <= 6 && hour >= 9 && hour < 19;
    return open
      ? "Şu anda ekibimiz hizmet vermektedir. Dilerseniz WhatsApp üzerinden hızlıca iletişime geçebilirsiniz."
      : "Şu anda mesai saatleri dışındayız. Mesajınızı bırakabilirsiniz; ilk iş gününde sizinle iletişime geçilecektir.";
  };

  const whatsappLink = (text = defaultWhatsappText) => whatsappUrl + encodeURIComponent(text);
  const actionButtons = (items = ["whatsapp", "call", "route", "quote"]) => {
    const map = {
      whatsapp:`<a class="emak-action whatsapp" href="${whatsappLink()}" target="_blank" rel="noopener">🟢 WhatsApp</a>`,
      call:`<a class="emak-action" href="${phoneHref}">📞 Ara</a>`,
      route:`<a class="emak-action" href="${mapsHref}" target="_blank" rel="noopener">📍 Yol Tarifi</a>`,
      quote:`<a class="emak-action" href="${quoteHref}">💰 Teklif Al</a>`,
      services:`<a class="emak-action" href="${servicesHref}">🏠 Hizmetler</a>`,
      projects:`<a class="emak-action" href="${projectsHref}">⭐⭐ Projeler</a>`,
      instagram:`<a class="emak-action" href="${instagramHref}" target="_blank" rel="noopener">Instagram</a>`,
      email:`<a class="emak-action" href="${emailHref}">✉️ Mail</a>`
    };
    return `<div class="emak-chat-actions">${items.map(i => map[i]).join("")}</div>`;
  };

  const questionBank = [
    "Ücretsiz keşif yapıyor musunuz?", "Teklif almak istiyorum", "Ortalama fiyat nedir?", "Ödeme seçenekleri nelerdir?",
    "Anahtar teslim yapıyor musunuz?", "Sadece tasarım hizmeti veriyor musunuz?", "Mobilya tasarlıyor musunuz?",
    "Villa yapıyor musunuz?", "Ofis tasarlıyor musunuz?", "Kafe tasarlıyor musunuz?", "Restoran tasarlıyor musunuz?",
    "Neredesiniz?", "Beylikdüzü dışında hizmet veriyor musunuz?", "İstanbul'un her yerine geliyor musunuz?",
    "Tadilat ne kadar sürüyor?", "Proje kaç günde hazırlanıyor?", "Ne zaman başlayabilirsiniz?",
    "İç mimarlık nedir?", "Mimar ile çalışmanın avantajı nedir?", "3D çizim yapıyor musunuz?",
    "Ruhsat projesi hazırlıyor musunuz?", "Uygulama yapıyor musunuz?", "Telefon", "Mail", "WhatsApp", "Adres", "Konum",
    "Projelerinizi nereden görebilirim?", "Hangi alanlarda hizmet veriyorsunuz?"
  ];

  const answers = [
    {
      keys:["merhaba","selam","iyi gunler","iyi günler"],
      text:`Merhaba, ben EMAK Asistan. Size hizmetler, teklif, keşif, konum, süre ve projeler hakkında hızlıca yardımcı olabilirim.<br><br><span class="emak-chat-note">${businessStatus()}</span>`,
      actions:["services","quote","whatsapp"]
    },
    {
      keys:["hizmet","ne yap","neler","hangi alan","mimarlık","mimari","ic mimarlik","iç mimarlık","dekorasyon","tadilat","uygulama","anahtar teslim"],
      text:"EMAK Mimarlık & Dekorasyon; İstanbul genelinde mimari tasarım, iç mimarlık, dekorasyon ve anahtar teslim uygulama süreçlerinde hizmet verir. Konut ve ticari alanlarda fikir aşamasından uygulamaya kadar süreci bütüncül şekilde yönetir.",
      actions:["services","projects","quote"]
    },
    {
      keys:["anahtar teslim","komple tadilat","baştan sona","bastan sona"],
      text:"Evet. Tasarımdan uygulamaya kadar tüm süreci planlayarak anahtar teslim ilerleyebiliriz. Kapsam; keşif, ihtiyaç analizi, tasarım, malzeme seçimi, uygulama planı ve saha süreci olarak netleştirilir.",
      actions:["quote","whatsapp","projects"]
    },
    {
      keys:["sadece tasarım","sadece tasarim","tasarım hizmeti","tasarim hizmeti"],
      text:"Evet, yalnızca tasarım/projelendirme hizmeti de alınabilir. İhtiyaca göre konsept tasarım, yerleşim planı, 3D görselleştirme ve uygulama çizimleri hazırlanabilir.",
      actions:["quote","whatsapp"]
    },
    {
      keys:["mobilya","dolap","özel üretim","ozel uretim"],
      text:"Evet, projeye göre mobilya tasarımı ve uygulama çizimleri hazırlanabilir. Ölçü, kullanım ihtiyacı, malzeme ve stil birlikte değerlendirilerek en uygun çözüm oluşturulur.",
      actions:["quote","whatsapp"]
    },
    {
      keys:["villa","ofis","kafe","cafe","restoran","restaurant","ticari","mağaza","magaza","konut","daire"],
      text:"Konut ve ticari alanlarda tasarım, danışmanlık ve uygulama süreçleri için destek veriyoruz. Villa, daire, ofis, kafe/restoran ve benzeri alanlarda proje kapsamına göre ilerlenebilir.",
      actions:["projects","quote","whatsapp"]
    },
    {
      keys:["fiyat","ücret","ucret","maliyet","kaç para","kac para","ortalama fiyat","teklif","metrekare","m2"],
      text:"Fiyatlandırma; alanın metrekaresi, kapsamı, malzeme tercihi, işçilik detayları ve uygulama süresine göre değişir. En doğru fiyat için kısa bir keşif/görüşme yapılması gerekir.",
      lead:true,
      actions:["quote","whatsapp"]
    },
    {
      keys:["ödeme","odeme","taksit","peşin","pesin"],
      text:"Ödeme planı proje kapsamına göre belirlenir. Uygulama başlamadan önce kapsam, iş programı ve ödeme adımları netleştirilerek ilerlenir.",
      lead:true,
      actions:["whatsapp","quote"]
    },
    {
      keys:["keşif","kesif","randevu","görüşme","gorusme","ücretsiz keşif","ucretsiz kesif","ücretsiz","ucretsiz"],
      text:"Keşif ve ön görüşme için telefon, WhatsApp veya iletişim formu üzerinden ulaşabilirsiniz. Projenizin konumu ve ihtiyacına göre size en uygun yönlendirme yapılır.",
      lead:true,
      actions:["whatsapp","call","quote"]
    },
    {
      keys:["adres","nerede","konum","ofis","harita","yol","yol tarifi","ulaşım","ulasim"],
      text:"Operasyon merkezimiz Beylikdüzü Skyport Residence'tadır. İstanbul genelinde hizmet vermekteyiz.<br><br><strong>Adres:</strong><br>Yakuplu Mah. Hürriyet Blv. Skyport Residence No:1 İç Kapı No:151<br>Beylikdüzü / İstanbul",
      actions:["route","whatsapp","call"]
    },
    {
      keys:["beylikdüzü dışında","beylikduzu disinda","istanbul","her yere","hizmet alanı","hizmet alani","avcılar","avcilar","büyükçekmece","buyukcekmece","bahçeşehir","bahcesehir","kartal","kadıköy","kadikoy","maltepe","başakşehir","basaksehir"],
      text:"Evet. Ofis konumumuz Beylikdüzü’nde olsa da hizmet alanımız İstanbul geneline yayılır. Projenizin bulunduğu ilçeyi paylaşırsanız uygun keşif/görüşme planı yapılabilir.",
      actions:["quote","whatsapp","route"]
    },
    {
      keys:["kaç gün","kac gun","kaç hafta","kac hafta","süre","sure","zaman","teslim","ne kadar sürer","ne kadar surer","ne zaman başlayabilirsiniz","baslayabilirsiniz"],
      text:"Süre; alanın büyüklüğüne, iş kapsamına, malzeme tedarikine ve uygulama yoğunluğuna göre değişir. Ön görüşme sonrası daha net bir iş takvimi paylaşılır.",
      lead:true,
      actions:["quote","whatsapp"]
    },
    {
      keys:["iç mimarlık nedir","ic mimarlik nedir"],
      text:"İç mimarlık; bir mekânın estetik, fonksiyon, kullanım alışkanlığı, malzeme, ışık ve uygulama detaylarıyla birlikte bütüncül olarak tasarlanmasıdır. Amaç yalnızca güzel görünen değil, doğru çalışan alanlar üretmektir.",
      actions:["services","projects"]
    },
    {
      keys:["mimar ile çalışmanın avantajı","mimar ile calismanin avantaji","neden mimar","avantaj"],
      text:"Mimar veya tasarımcıyla çalışmak; ölçü, planlama, malzeme seçimi, bütçe kontrolü, zaman yönetimi ve uygulama kalitesini daha güvenli hale getirir. Böylece sürpriz maliyet ve uygulama hatası riski azalır.",
      actions:["services","quote","projects"]
    },
    {
      keys:["3d","3d çizim","3d cizim","render","görselleştirme","gorsellestirme","tasarımdan gerçeğe","tasarimdan gercege"],
      text:"Evet, 3D tasarım ve görselleştirme ile proje uygulama öncesinde daha net görülebilir. Sitedeki ‘3D Tasarımdan Gerçeğe’ bölümünden örnekleri inceleyebilirsiniz.",
      actions:["projects","quote","whatsapp"]
    },
    {
      keys:["ruhsat","proje çizimi","proje cizimi","uygulama çizimi","uygulama cizimi","teknik çizim","teknik cizim"],
      text:"Proje kapsamına göre mimari çizim, uygulama çizimi, yerleşim planı ve teknik detay desteği sağlanabilir. Ruhsat/proje ihtiyacınız varsa kapsamı birlikte netleştirmek en doğru yol olur.",
      lead:true,
      actions:["quote","whatsapp"]
    },
    {
      keys:["telefon","ara","numara"],
      text:`Bize <strong>${phoneDisplay}</strong> numarasından ulaşabilirsiniz. Dilerseniz tek tıkla arayabilir veya WhatsApp üzerinden mesaj gönderebilirsiniz.`,
      actions:["call","whatsapp"]
    },
    {
      keys:["mail","e-posta","eposta","email"],
      text:"E-posta adresimiz: <strong>emakmimari@gmail.com</strong>. Dilerseniz teklif ve proje bilgilerinizi mail yoluyla da iletebilirsiniz.",
      actions:["email","quote"]
    },
    {
      keys:["whatsapp","wp","mesaj"],
      text:"WhatsApp üzerinden hızlıca iletişime geçebilirsiniz. Mesajınız otomatik olarak proje görüşmesi talebi şeklinde hazırlanır.",
      actions:["whatsapp","call"]
    },
    {
      keys:["instagram","sosyal","profil"],
      text:"Instagram hesabımız: <strong>@emak_mimarlik</strong>. Güncel çalışmalarımızı ve paylaşımlarımızı oradan da inceleyebilirsiniz.",
      actions:["instagram","projects"]
    },
    {
      keys:["proje","projeler","örnek","ornek","referans","önce sonra","once sonra"],
      text:"Projelerimizi ve önce/sonra karşılaştırmalarını web sitemizde inceleyebilirsiniz. Ayrıca ‘3D Tasarımdan Gerçeğe’ bölümü uygulama öncesi ve sonrası süreci daha net gösterir.",
      actions:["projects","quote","whatsapp"]
    }
  ];

  const relevantKeywords = [
    ...answers.flatMap(a => a.keys),
    "ev", "mekan", "mekân", "alan", "dizayn", "tasarla", "yenileme", "proje", "danışmanlık", "danismanlik", "emak"
  ].map(normalize);

  const isProbablyRelevant = (question) => {
    const q = normalize(question);
    if (q.length < 3) return true;
    return relevantKeywords.some(k => q.includes(k));
  };

  const getAnswer = (question) => {
    const q = normalize(question);
    return answers.find(item => item.keys.some(k => q.includes(normalize(k))));
  };

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
    <div class="emak-chat-suggestions" hidden></div>
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
  const suggestions = panel.querySelector(".emak-chat-suggestions");

  const scrollMessages = () => { messages.scrollTop = messages.scrollHeight; };
  const addMessage = (content, type = "bot", html = false) => {
    const msg = document.createElement("div");
    msg.className = `emak-msg ${type}`;
    if (html) msg.innerHTML = content;
    else msg.textContent = content;
    messages.appendChild(msg);
    scrollMessages();
    return msg;
  };
  const addTyping = () => addMessage(`<span class="typing-dots"><i></i><i></i><i></i></span>`, "bot typing", true);
  const typingThen = (fn) => {
    const typing = addTyping();
    setTimeout(() => { typing.remove(); fn(); }, 800);
  };

  const showSuggestions = (value) => {
    const q = normalize(value);
    if (!q || q.length < 2) {
      suggestions.hidden = true;
      suggestions.innerHTML = "";
      return;
    }
    const matches = questionBank.filter(item => normalize(item).includes(q)).slice(0, 5);
    if (!matches.length) {
      suggestions.hidden = true;
      suggestions.innerHTML = "";
      return;
    }
    suggestions.innerHTML = matches.map(item => `<button type="button" data-suggestion="${item.replace(/"/g, '&quot;')}">${item}</button>`).join("");
    suggestions.hidden = false;
  };

  const welcomeHtml = () => `
    <strong>👋 Merhaba!</strong><br><br>
    Ben <strong>EMAK Asistan</strong>. Size birkaç saniye içinde yardımcı olabilirim.<br><br>
    İsterseniz aşağıdaki konulardan birini seçebilir veya sorunuzu yazabilirsiniz.
    <div class="emak-chat-cards">
      <button type="button" data-chat="Anahtar teslim yapıyor musunuz?">🏡 <span>Anahtar Teslim</span></button>
      <button type="button" data-chat="İç mimarlık nedir?">📐 <span>İç Mimarlık</span></button>
      <button type="button" data-chat="Teklif almak istiyorum">💰 <span>Teklif Al</span></button>
      <button type="button" data-chat="Neredesiniz?">📍 <span>Konum</span></button>
      <button type="button" data-chat="Telefon">📞 <span>İletişim</span></button>
      <button type="button" data-chat="Projelerinizi nereden görebilirim?">⭐⭐ <span>Projeler</span></button>
    </div>
    <span class="emak-chat-note">${businessStatus()}</span>
  `;

  const finalPrompt = () => `<span class="emak-chat-note">Başka yardımcı olabileceğim bir konu var mı?</span>${actionButtons()}`;

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
    const clean = question.trim();
    if (!clean) return;
    addMessage(clean, "user");
    suggestions.hidden = true;
    suggestions.innerHTML = "";

    const answer = getAnswer(clean);
    typingThen(() => {
      if (answer) {
        addMessage(`${answer.text}${answer.actions ? actionButtons(answer.actions) : ""}`, "bot", true);
        if (answer.lead) showLeadForm(clean);
        else addMessage(finalPrompt(), "bot", true);
        return;
      }

      if (!isProbablyRelevant(clean)) {
        addMessage(`Ben yalnızca EMAK Mimarlık hizmetleri hakkında yardımcı olabiliyorum. Mimarlık, iç mimarlık, dekorasyon, tadilat ve anahtar teslim projeler hakkında sorularınızı memnuniyetle cevaplayabilirim.${actionButtons(["services","whatsapp","call"])}`, "bot", true);
        return;
      }

      addMessage(`Bu konuda sizi yanlış yönlendirmek istemem. Talebinizi bize iletin; EMAK ekibi size en kısa sürede dönüş yapsın.${actionButtons(["whatsapp","quote","call"])}`, "bot", true);
      showLeadForm(clean);
    });
  };

  launcher.addEventListener("click", () => {
    panel.classList.toggle("show");
    if (panel.classList.contains("show")) {
      if (!messages.dataset.started) {
        messages.dataset.started = "true";
        addMessage(welcomeHtml(), "bot", true);
      }
      setTimeout(() => input.focus(), 150);
    }
  });

  close.addEventListener("click", () => panel.classList.remove("show"));

  messages.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-chat]");
    if (btn) handleQuestion(btn.dataset.chat || btn.textContent);
  });

  suggestions.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-suggestion]");
    if (!btn) return;
    input.value = "";
    handleQuestion(btn.dataset.suggestion);
  });

  input.addEventListener("input", () => showSuggestions(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      suggestions.hidden = true;
      suggestions.innerHTML = "";
    }
  });

  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    input.value = "";
    handleQuestion(value);
  });
})();;

/* PREMIUM WHATSAPP FLOATING ICON NORMALIZER */
(function(){
  const svg = '<span class="wa-icon" aria-hidden="true"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16.03 3.2c-7.02 0-12.72 5.61-12.72 12.53 0 2.2.59 4.34 1.7 6.22L3.2 28.8l7.03-1.78a12.9 12.9 0 0 0 5.8 1.38c7.02 0 12.72-5.61 12.72-12.53S23.05 3.2 16.03 3.2Zm0 22.99c-1.82 0-3.6-.47-5.16-1.37l-.37-.21-4.16 1.05 1.1-4.01-.24-.41a10.22 10.22 0 0 1-1.55-5.5c0-5.7 4.66-10.34 10.38-10.34 5.73 0 10.39 4.64 10.39 10.34 0 5.7-4.66 10.45-10.39 10.45Zm5.69-7.76c-.31-.16-1.85-.9-2.13-1-.29-.11-.5-.16-.71.15-.21.31-.81 1-.99 1.2-.18.21-.36.23-.67.08-.31-.16-1.31-.48-2.5-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.14-.63.14-.14.31-.36.47-.54.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.54-.08-.16-.71-1.7-.97-2.32-.26-.61-.52-.53-.71-.54h-.6c-.21 0-.55.08-.84.39-.29.31-1.11 1.08-1.11 2.64s1.14 3.06 1.3 3.27c.16.21 2.24 3.39 5.42 4.75.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.85-.75 2.11-1.48.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.36Z"/></svg></span>';
  document.querySelectorAll('.float-whatsapp').forEach((btn) => {
    const label = (btn.textContent || 'WhatsApp').replace(/💬/g,'').trim() || 'WhatsApp';
    btn.innerHTML = `${svg}<span class="wa-label">${label}</span>`;
    btn.setAttribute('aria-label','WhatsApp ile iletişime geç');
  });
})();
