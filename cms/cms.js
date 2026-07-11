const SITE = {
  base: "https://emakmimarlik.com.tr/",
  brand: "EMAK Mimarlık & Dekorasyon",
  author: "Emir Karaağaçlı",
  role: "İnşaat Teknikeri / Mimari Proje Tasarımcısı",
  phone: "+905321204785",
  email: "emakmimari@gmail.com"
};

const CATEGORIES = [
  "İç Mimarlık", "Ev Tasarımı", "Banyo", "Mutfak", "Maliyet ve Süre",
  "Malzemeler", "Aydınlatma", "Dekorasyon", "Ticari Mekânlar", "Trendler",
  "Tadilat ve Süreç"
];

const STATIC_URLS = [
  "", "hakkimizda.html", "hizmetler.html", "projeler.html", "rehberler.html",
  "banyo.html", "mutfak.html", "antre.html", "iletisim.html",
  "tasarimdan-gercege.html", "gizlilik-politikasi.html", "kvkk.html",
  "aydinlatma-metni.html", "cerez-politikasi.html"
];

let guides = [];
let editingId = null;
let projectHandle = null;

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = (v = "") => String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const slugify = (text = "") => text.toLocaleLowerCase("tr-TR")
  .replace(/ı/g,"i").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ö/g,"o").replace(/ç/g,"c")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const today = () => new Date().toISOString().slice(0,10);
const displayDate = d => new Intl.DateTimeFormat("tr-TR", {day:"numeric",month:"long",year:"numeric"}).format(new Date(`${d}T12:00:00`));
const uid = () => `guide-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

async function init(){
  try{
    const saved = localStorage.getItem("emakCmsGuides");
    if(saved) guides = JSON.parse(saved);
    else {
      const res = await fetch("data/guides.json", {cache:"no-store"});
      guides = await res.json();
      saveLocal();
    }
  } catch(err){
    console.error(err);
    guides = [];
    toast("İçerikler yüklenemedi. CMS'yi site üzerinden açın.", true);
  }
  fillCategories();
  bindEvents();
  renderAll();
  resetForm();
}

function saveLocal(){ localStorage.setItem("emakCmsGuides", JSON.stringify(guides)); }
function fillCategories(){
  const editor = $("#category");
  const filter = $("#filterCategory");
  editor.innerHTML = CATEGORIES.map(c=>`<option>${esc(c)}</option>`).join("");
  filter.innerHTML = `<option value="all">Tüm kategoriler</option>${CATEGORIES.map(c=>`<option>${esc(c)}</option>`).join("")}`;
}

function bindEvents(){
  $$(".nav-item").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
  $$('[data-go]').forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));
  $("#newGuideTop").onclick = ()=>{ resetForm(); showView("editor"); };
  $("#startGuide").onclick = ()=>{ resetForm(); showView("editor"); };
  $("#openSite").onclick = ()=>window.open("../index.html","_blank");
  $("#title").addEventListener("input", e=>{ if(!editingId || !$("#slug").dataset.touched) $("#slug").value=slugify(e.target.value); updateScore(); });
  $("#slug").addEventListener("input", e=>{ e.target.dataset.touched="1"; e.target.value=slugify(e.target.value); updateScore(); });
  ["summary","shortAnswer","category","status","readTime","updated"].forEach(id=>$("#"+id).addEventListener("input",updateScore));
  $("#addSection").onclick = ()=>addSection();
  $("#addFaq").onclick = ()=>addFaq();
  $("#guideForm").addEventListener("submit", saveGuide);
  $("#previewGuide").onclick = previewCurrent;
  $("#deleteGuide").onclick = deleteCurrent;
  $("#searchGuides").addEventListener("input",renderGuideTable);
  $("#filterCategory").addEventListener("change",renderGuideTable);
  $("#filterStatus").addEventListener("change",renderGuideTable);
  $("#closePreview").onclick=()=>$("#previewDialog").close();
  $("#chooseFolder").onclick=chooseFolder;
  $("#publishAll").onclick=publishAll;
  $("#downloadChanged").onclick=downloadChanged;
  $("#exportData").onclick=exportData;
  $("#importData").addEventListener("change", importData);
}

function showView(name){
  $$(".view").forEach(v=>v.classList.remove("active"));
  $$(".nav-item").forEach(v=>v.classList.toggle("active",v.dataset.view===name));
  $("#"+name+"View").classList.add("active");
  const titles={dashboard:"Genel Bakış",guides:"Mimarlık Rehberleri",editor:editingId?"Rehberi Düzenle":"Yeni Rehber",publish:"Yayınlama"};
  $("#pageTitle").textContent=titles[name]||"EMAK CMS";
  if(name==="publish") renderPublishSummary();
}

function renderAll(){
  const pub=guides.filter(g=>g.status==="published");
  $("#totalGuides").textContent=guides.length;
  $("#publishedGuides").textContent=pub.length;
  $("#draftGuides").textContent=guides.length-pub.length;
  $("#categoryCount").textContent=new Set(guides.map(g=>g.category)).size;
  $("#recentList").innerHTML=[...guides].sort((a,b)=>(b.updated||"").localeCompare(a.updated||"")).slice(0,6).map(g=>`<div class="recent-item"><div><strong>${esc(g.title)}</strong><span>${esc(g.category)} • ${g.status==="published"?"Yayında":"Taslak"}</span></div><button class="icon-btn" data-edit="${g.id}">Düzenle</button></div>`).join("")||"<p class='muted'>Henüz rehber yok.</p>";
  $$('[data-edit]').forEach(b=>b.onclick=()=>editGuide(b.dataset.edit));
  renderGuideTable();
}

function renderGuideTable(){
  const q=$("#searchGuides").value.toLocaleLowerCase("tr-TR");
  const cat=$("#filterCategory").value, status=$("#filterStatus").value;
  const rows=guides.filter(g=>(cat==="all"||g.category===cat)&&(status==="all"||g.status===status)&&(`${g.title} ${g.category}`.toLocaleLowerCase("tr-TR").includes(q)));
  $("#guideTable").innerHTML=rows.map(g=>`<article class="guide-row"><div><h3>${esc(g.title)}</h3><p>${esc(g.slug)}.html • ${g.readTime||8} dk</p></div><span class="badge">${esc(g.category)}</span><span class="badge ${g.status}">${g.status==="published"?"Yayında":"Taslak"}</span><div class="row-actions"><button class="icon-btn" data-preview="${g.id}">Önizle</button><button class="icon-btn" data-edit="${g.id}">Düzenle</button></div></article>`).join("")||"<section class='panel'><p class='muted'>Bu ölçütlere uygun rehber bulunamadı.</p></section>";
  $$('[data-edit]').forEach(b=>b.onclick=()=>editGuide(b.dataset.edit));
  $$('[data-preview]').forEach(b=>b.onclick=()=>previewGuide(guides.find(g=>g.id===b.dataset.preview)));
}

function resetForm(){
  editingId=null; $("#guideForm").reset(); $("#updated").value=today(); $("#readTime").value=8; $("#status").value="draft"; $("#slug").dataset.touched="";
  $("#sections").innerHTML=""; $("#faqs").innerHTML="";
  addSection(); addSection(); addSection(); addFaq(); addFaq(); addFaq();
  $("#deleteGuide").style.display="none"; updateScore();
}

function editGuide(id){
  const g=guides.find(x=>x.id===id); if(!g)return;
  editingId=id; $("#title").value=g.title||""; $("#slug").value=g.slug||""; $("#slug").dataset.touched="1"; $("#category").value=g.category||CATEGORIES[0]; $("#summary").value=g.summary||""; $("#shortAnswer").value=g.shortAnswer||""; $("#status").value=g.status||"draft"; $("#readTime").value=g.readTime||8; $("#updated").value=g.updated||today();
  $("#sections").innerHTML=""; (g.sections?.length?g.sections:[{title:"",content:""}]).forEach(s=>addSection(s));
  $("#faqs").innerHTML=""; (g.faqs?.length?g.faqs:[{question:"",answer:""}]).forEach(f=>addFaq(f));
  $("#deleteGuide").style.display="block"; updateScore(); showView("editor");
}

function addSection(data={title:"",content:""}){
  const el=document.createElement("div"); el.className="repeat-card section-item";
  el.innerHTML=`<div class="repeat-head"><strong>Bölüm</strong><button type="button" class="remove-btn">Kaldır</button></div><label>Bölüm başlığı<input class="section-title" value="${esc(data.title)}" placeholder="Örn. Planlama neden önemlidir?"></label><label>Açıklama<textarea class="section-content" rows="7" placeholder="Paragrafları boş satırla ayırabilirsin.">${esc(data.content)}</textarea></label>`;
  el.querySelector(".remove-btn").onclick=()=>{el.remove();renumber();updateScore()}; el.addEventListener("input",updateScore); $("#sections").appendChild(el); renumber();
}
function addFaq(data={question:"",answer:""}){
  const el=document.createElement("div"); el.className="repeat-card faq-item";
  el.innerHTML=`<div class="repeat-head"><strong>Soru</strong><button type="button" class="remove-btn">Kaldır</button></div><label>Soru<input class="faq-question" value="${esc(data.question)}" placeholder="Örn. İç mimarlık projesi ne kadar sürer?"></label><label>Cevap<textarea class="faq-answer" rows="3">${esc(data.answer)}</textarea></label>`;
  el.querySelector(".remove-btn").onclick=()=>{el.remove();renumber();updateScore()}; el.addEventListener("input",updateScore); $("#faqs").appendChild(el); renumber();
}
function renumber(){ $$(".section-item .repeat-head strong").forEach((e,i)=>e.textContent=`Bölüm ${i+1}`); $$(".faq-item .repeat-head strong").forEach((e,i)=>e.textContent=`Soru ${i+1}`); }

function collectForm(){
  return {
    id: editingId||uid(), slug:slugify($("#slug").value), filename:`${slugify($("#slug").value)}.html`, title:$("#title").value.trim(), category:$("#category").value, summary:$("#summary").value.trim(), lead:$("#summary").value.trim(), shortAnswer:$("#shortAnswer").value.trim(), status:$("#status").value, readTime:Number($("#readTime").value)||8, updated:$("#updated").value||today(),
    sections:$$('.section-item').map(el=>({title:$('.section-title',el).value.trim(),content:$('.section-content',el).value.trim()})).filter(s=>s.title&&s.content),
    faqs:$$('.faq-item').map(el=>({question:$('.faq-question',el).value.trim(),answer:$('.faq-answer',el).value.trim()})).filter(f=>f.question&&f.answer)
  };
}
function saveGuide(e){
  e.preventDefault(); const g=collectForm();
  if(!g.title||!g.slug||!g.summary||!g.shortAnswer||g.sections.length<1){toast("Başlık, URL, açıklama, kısa cevap ve en az bir bölüm gerekli.",true);return}
  if(guides.some(x=>x.slug===g.slug&&x.id!==g.id)){toast("Bu URL kısa adı başka bir rehberde kullanılıyor.",true);return}
  const i=guides.findIndex(x=>x.id===g.id); if(i>=0)guides[i]=g; else guides.unshift(g);
  editingId=g.id; saveLocal(); renderAll(); $("#deleteGuide").style.display="block"; toast("Rehber kaydedildi.");
}
function deleteCurrent(){
  if(!editingId)return; const g=guides.find(x=>x.id===editingId); if(!confirm(`“${g.title}” rehberini silmek istediğinize emin misiniz?`))return;
  guides=guides.filter(x=>x.id!==editingId); saveLocal(); renderAll(); resetForm(); showView("guides"); toast("Rehber silindi.");
}
function updateScore(){
  const g=collectForm(); let score=0; if(g.title)score+=12;if(g.slug)score+=8;if(g.summary.length>80)score+=12;if(g.shortAnswer.length>80)score+=12;if(g.sections.length>=4)score+=26;else score+=g.sections.length*5;if(g.faqs.length>=3)score+=18;else score+=g.faqs.length*5;if(g.readTime)score+=5;if(g.updated)score+=5;
  score=Math.min(100,score); $("#contentScore").textContent=`${score}%`; $("#scoreBar").style.width=`${score}%`;
}

function paragraphs(text){ return text.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join(""); }
function jsonLd(obj){return JSON.stringify(obj).replace(/</g,"\\u003c")}
function relatedFor(g){ return guides.filter(x=>x.status==="published"&&x.id!==g.id).sort((a,b)=>Number(b.category===g.category)-Number(a.category===g.category)).slice(0,3); }

function articleHtml(g){
  const url=SITE.base+g.filename; const related=relatedFor(g);
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage","mainEntity":g.faqs.map(f=>({"@type":"Question","name":f.question,"acceptedAnswer":{"@type":"Answer","text":f.answer}}))};
  const articleSchema={"@context":"https://schema.org","@type":"Article","headline":g.title,"description":g.summary,"datePublished":g.updated,"dateModified":g.updated,"author":{"@type":"Person","name":SITE.author,"jobTitle":SITE.role,"url":SITE.base+"hakkimizda.html"},"publisher":{"@type":"Organization","name":SITE.brand,"url":SITE.base,"logo":{"@type":"ImageObject","url":SITE.base+"assets/logo.png"}},"mainEntityOfPage":{"@type":"WebPage","@id":url},"image":SITE.base+"assets/logo.png","articleSection":g.category};
  const breadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Ana Sayfa","item":SITE.base},{"@type":"ListItem","position":2,"name":"Mimarlık Rehberi","item":SITE.base+"rehberler.html"},{"@type":"ListItem","position":3,"name":g.title,"item":url}]};
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(g.title)} | EMAK Mimarlık</title><meta name="description" content="${esc(g.summary)}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="author" content="${esc(SITE.brand)}"><meta name="theme-color" content="#090b0f"><link rel="canonical" href="${url}"><link rel="icon" href="assets/favicon.ico"><link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png"><link rel="apple-touch-icon" href="assets/apple-touch-icon.png"><link rel="manifest" href="site.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="style.css"><meta property="og:type" content="article"><meta property="og:locale" content="tr_TR"><meta property="og:site_name" content="${esc(SITE.brand)}"><meta property="og:title" content="${esc(g.title)}"><meta property="og:description" content="${esc(g.summary)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE.base}assets/logo.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(g.title)}"><meta name="twitter:description" content="${esc(g.summary)}"><meta name="twitter:image" content="${SITE.base}assets/logo.png"><script type="application/ld+json">${jsonLd(articleSchema)}</script><script type="application/ld+json">${jsonLd(breadcrumb)}</script>${g.faqs.length?`<script type="application/ld+json">${jsonLd(faqSchema)}</script>`:""}</head><body><div class="noise"></div>${siteHeader("rehberler")}<main><article class="guide-article"><header class="guide-hero"><div class="container guide-hero-grid"><div><nav class="breadcrumb" aria-label="Sayfa yolu"><a href="index.html">Ana Sayfa</a><span>/</span><a href="rehberler.html">Mimarlık Rehberi</a><span>/</span><span>${esc(g.category)}</span></nav><p class="eyebrow">${esc(g.category)} • ${g.readTime} dk okuma</p><h1>${esc(g.title)}</h1><p class="guide-lead">${esc(g.summary)}</p><div class="guide-meta"><span>EMAK Mimarlık Editoryal Ekibi</span><span>Güncelleme: ${displayDate(g.updated)}</span></div></div><aside class="guide-answer-card"><small>Kısa cevap</small><p>${esc(g.shortAnswer)}</p></aside></div></header><div class="container guide-layout"><aside class="guide-toc"><strong>Bu rehberde</strong>${g.sections.map((s,i)=>`<a href="#bolum-${i+1}"><span>${String(i+1).padStart(2,"0")}</span>${esc(s.title)}</a>`).join("")}<a class="guide-toc-cta" href="iletisim.html">Projenizi konuşalım</a></aside><div class="guide-content">${g.sections.map((s,i)=>`<section class="guide-section" id="bolum-${i+1}"><p class="guide-section-number">${String(i+1).padStart(2,"0")}</p><h2>${esc(s.title)}</h2>${paragraphs(s.content)}</section>`).join("")}${g.faqs.length?`<section class="guide-section guide-faq-section"><p class="guide-section-number">SSS</p><h2>Sık sorulan sorular</h2>${g.faqs.map(f=>`<details class="guide-faq"><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join("")}</section>`:""}<div class="guide-disclaimer"><strong>Not:</strong> Bu içerik genel bilgilendirme amacı taşır. Her yapının mevcut durumu, teknik ihtiyaçları ve uygulama koşulları farklıdır. Kesin kararlar keşif ve projelendirme sonrasında verilmelidir.</div></div></div>${related.length?`<section class="section guide-related"><div class="container"><div class="section-title"><p class="eyebrow">Okumaya devam edin</p><h2>İlgili mimarlık rehberleri</h2></div><div class="guide-grid">${related.map(r=>`<a class="guide-card compact" href="${r.filename}"><small>${esc(r.category)}</small><h3>${esc(r.title)}</h3><span>Rehberi oku →</span></a>`).join("")}</div></div></section>`:""}<section class="section cta-section"><div class="container cta-box"><p class="eyebrow">Projeniz için</p><h2>Doğru planı birlikte oluşturalım.</h2><p class="guide-cta-text">İstanbul genelindeki mimari tasarım, iç mekân planlama ve uygulama ihtiyaçlarınız için EMAK Mimarlık ile iletişime geçin.</p><a class="btn primary" href="iletisim.html">Ücretsiz görüşme talep et</a></div></section></article></main>${siteFooter()}<script src="script.js"></script></body></html>`;
}

function siteHeader(active="") {return `<header class="site-header"><div class="container nav"><a class="brand" href="index.html" aria-label="EMAK Mimarlık ana sayfa"><img src="assets/logo.png" alt="EMAK Mimarlık & Dekorasyon logosu"></a><button class="menu-toggle" aria-label="Menüyü aç/kapat"><span></span><span></span></button><nav class="nav-links"><a href="index.html">Ana Sayfa</a><a href="hakkimizda.html">Hakkımızda</a><a href="hizmetler.html">Hizmetler</a><a href="projeler.html">Projeler</a><a class="${active==="rehberler"?"active":""}" href="rehberler.html">Mimarlık Rehberi</a><a href="iletisim.html">İletişim</a></nav><a class="header-cta" href="https://wa.me/${SITE.phone.replace('+','')}?text=Merhaba,%20EMAK%20Mimarl%C4%B1k%20ile%20projem%20hakk%C4%B1nda%20g%C3%B6r%C3%BC%C5%9Fmek%20istiyorum." target="_blank" rel="noopener">Teklif Al</a></div></header>`}
function siteFooter(){return `<footer class="footer"><div class="container footer-grid"><img src="assets/logo.png" alt="EMAK Mimarlık & Dekorasyon logosu"><p>© 2026 EMAK Mimarlık & Dekorasyon. Tüm hakları saklıdır.</p><a href="iletisim.html">Teklif Al</a></div><div class="container legal-footer-links"><a href="gizlilik-politikasi.html">Gizlilik Politikası</a><a href="kvkk.html">KVKK</a><a href="aydinlatma-metni.html">Aydınlatma Metni</a><a href="cerez-politikasi.html">Çerez Politikası</a></div></footer>`}

function hubHtml(){
  const pubs=guides.filter(g=>g.status==="published"); const cats=[...new Set(pubs.map(g=>g.category))].sort((a,b)=>a.localeCompare(b,"tr"));
  const schema={"@context":"https://schema.org","@type":"CollectionPage","name":"EMAK Mimarlık Rehberi","url":SITE.base+"rehberler.html","description":"İç mimarlık, tadilat, malzeme, banyo, mutfak ve aydınlatma hakkında sade ve uygulanabilir rehberler.","inLanguage":"tr-TR","hasPart":pubs.map(g=>({"@type":"Article","name":g.title,"url":SITE.base+g.filename}))};
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mimarlık Rehberi | EMAK Mimarlık</title><meta name="description" content="İç mimarlık, ev yenileme, tadilat, banyo, mutfak, malzeme ve aydınlatma konularında sade, güvenilir ve uygulanabilir rehberler."><meta name="robots" content="index,follow,max-image-preview:large"><meta name="author" content="${SITE.brand}"><meta name="theme-color" content="#090b0f"><link rel="canonical" href="${SITE.base}rehberler.html"><link rel="icon" href="assets/favicon.ico"><link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png"><link rel="apple-touch-icon" href="assets/apple-touch-icon.png"><link rel="manifest" href="site.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="style.css"><meta property="og:type" content="website"><meta property="og:locale" content="tr_TR"><meta property="og:site_name" content="${SITE.brand}"><meta property="og:title" content="Mimarlık Rehberi | EMAK Mimarlık"><meta property="og:description" content="İç mimarlık, ev yenileme ve tadilat hakkında sade, güvenilir rehberler."><meta property="og:url" content="${SITE.base}rehberler.html"><meta property="og:image" content="${SITE.base}assets/logo.png"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${jsonLd(schema)}</script></head><body><div class="noise"></div>${siteHeader("rehberler")}<main><section class="guide-hub-hero"><div class="container"><p class="eyebrow">EMAK Bilgi Merkezi</p><h1>Mimarlık Rehberi</h1><p>Karar vermeyi kolaylaştıran; teknik konuları sade anlatan ve gerçek uygulama sürecine odaklanan rehberler.</p></div></section><section class="section"><div class="container"><div class="guide-filter" aria-label="Rehber kategorileri"><button class="active" type="button" data-guide-filter="all" aria-pressed="true">Tümü</button>${cats.map(c=>`<button type="button" data-guide-filter="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join("")}</div><p class="guide-filter-status" aria-live="polite"></p><div class="guide-grid guide-hub-grid">${pubs.map(g=>`<a class="guide-card" data-guide-category="${esc(g.category)}" href="${g.filename}"><div class="guide-card-top"><small>${esc(g.category)}</small><span>${g.readTime} dk</span></div><h2>${esc(g.title)}</h2><p>${esc(g.summary)}</p><strong>Rehberi oku →</strong></a>`).join("")}</div></div></section></main>${siteFooter()}<script src="script.js"></script></body></html>`;
}
function sitemapXml(){ const pubs=guides.filter(g=>g.status==="published"); return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...STATIC_URLS,...pubs.map(g=>g.filename)].map((u,i)=>`  <url><loc>${SITE.base}${u}</loc><lastmod>${i<STATIC_URLS.length?today():(pubs.find(g=>g.filename===u)?.updated||today())}</lastmod><priority>${u===""?"1.0":u==="rehberler.html"?"0.9":"0.8"}</priority></url>`).join("\n")}\n</urlset>\n`; }
function llmsTxt(){ const pubs=guides.filter(g=>g.status==="published"); return `# EMAK Mimarlık & Dekorasyon\n\nEMAK Mimarlık & Dekorasyon, İstanbul genelinde mimari tasarım, iç mimarlık, dekorasyon ve anahtar teslim uygulama hizmetleri sunar.\n\n## Ana Sayfalar\n- ${SITE.base}\n- ${SITE.base}hizmetler.html\n- ${SITE.base}projeler.html\n- ${SITE.base}rehberler.html\n- ${SITE.base}iletisim.html\n\n## Mimarlık Rehberleri\n${pubs.map(g=>`- [${g.title}](${SITE.base}${g.filename}): ${g.summary}`).join("\n")}\n\n## İletişim\n- Telefon: 0 (532) 120 47 85\n- E-posta: ${SITE.email}\n- Hizmet alanı: İstanbul geneli\n`; }

function previewCurrent(){ const g=collectForm(); if(!g.title){toast("Önce başlık girin.",true);return} previewGuide(g); }
function previewGuide(g){ const blob=new Blob([articleHtml(g)],{type:"text/html"}); const url=URL.createObjectURL(blob); $("#previewFrame").src=url; $("#previewDialog").showModal(); setTimeout(()=>URL.revokeObjectURL(url),60000); }

async function chooseFolder(){
  if(!window.showDirectoryPicker){toast("Bu özellik Chrome veya Edge gerektiriyor. Safari'de indirme yöntemini kullanın.",true);return}
  try{ projectHandle=await window.showDirectoryPicker({mode:"readwrite"}); $("#folderStatus").textContent=`Seçildi: ${projectHandle.name}`; $("#publishAll").disabled=false; toast("Proje klasörü seçildi."); }catch(e){ if(e.name!=="AbortError")toast("Klasör seçilemedi.",true); }
}
async function writeFile(handle,name,content){ const fh=await handle.getFileHandle(name,{create:true}); const w=await fh.createWritable(); await w.write(content); await w.close(); }
async function getDir(handle,name){return await handle.getDirectoryHandle(name,{create:true})}
async function publishAll(){
  if(!projectHandle)return; const btn=$("#publishAll"); btn.disabled=true;btn.textContent="Dosyalar yazılıyor…";
  try{
    const cmsDir=await getDir(projectHandle,"cms"), dataDir=await getDir(cmsDir,"data");
    for(const g of guides.filter(x=>x.status==="published")) await writeFile(projectHandle,g.filename,articleHtml(g));
    await writeFile(projectHandle,"rehberler.html",hubHtml()); await writeFile(projectHandle,"sitemap.xml",sitemapXml()); await writeFile(projectHandle,"llms.txt",llmsTxt()); await writeFile(dataDir,"guides.json",JSON.stringify(guides,null,2));
    toast("Site dosyaları başarıyla güncellendi.");
  }catch(e){console.error(e);toast("Dosyalar yazılırken hata oluştu.",true)}finally{btn.disabled=false;btn.textContent="Değişiklikleri Projeye Yaz"}
}
function download(name,content,type="text/plain"){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function downloadChanged(){
  const pubs=guides.filter(g=>g.status==="published"); pubs.forEach((g,i)=>setTimeout(()=>download(g.filename,articleHtml(g),"text/html"),i*120)); setTimeout(()=>download("rehberler.html",hubHtml(),"text/html"),pubs.length*120); setTimeout(()=>download("sitemap.xml",sitemapXml(),"application/xml"),(pubs.length+1)*120); setTimeout(()=>download("llms.txt",llmsTxt()),(pubs.length+2)*120); setTimeout(()=>download("guides.json",JSON.stringify(guides,null,2),"application/json"),(pubs.length+3)*120); toast("Dosya indirmeleri başlatıldı.");
}
function exportData(){download(`emak-cms-yedek-${today()}.json`,JSON.stringify({version:1,exportedAt:new Date().toISOString(),guides},null,2),"application/json")}
async function importData(e){
  const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());const imported=Array.isArray(data)?data:data.guides;if(!Array.isArray(imported))throw new Error();guides=imported;saveLocal();renderAll();toast("CMS yedeği geri yüklendi.")}catch{toast("Geçersiz CMS yedek dosyası.",true)}e.target.value="";
}
function renderPublishSummary(){ const pubs=guides.filter(g=>g.status==="published"); $("#publishSummary").innerHTML=[...pubs.map(g=>g.filename),"rehberler.html","sitemap.xml","llms.txt","cms/data/guides.json"].map(f=>`<div class="publish-file"><span>${esc(f)}</span><strong>Güncellenecek</strong></div>`).join(""); }
function toast(msg,error=false){const t=$("#toast");t.textContent=msg;t.className=`toast show${error?" error":""}`;clearTimeout(t._timer);t._timer=setTimeout(()=>t.className="toast",3200)}

init();
