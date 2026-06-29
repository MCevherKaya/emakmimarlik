// =========================
// CONTACT FORM (WEB3FORMS)
// =========================

const form = document.getElementById("contactForm");
const messageBox = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Gönderiliyor...";

    const formData = new FormData(form);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        messageBox.innerHTML = `
          <p style="color:#4ade80;font-weight:600;">
            ✅ Talebiniz başarıyla alınmıştır. <br>
            En kısa sürede sizinle iletişime geçeceğiz.
          </p>
        `;
        form.reset();
      } else {
        throw new Error("Form hatası");
      }

    } catch (err) {
      messageBox.innerHTML = `
        <p style="color:#f87171;font-weight:600;">
          ❌ Bir hata oluştu, lütfen tekrar deneyin.
        </p>
      `;
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Gönder";
  });
}
