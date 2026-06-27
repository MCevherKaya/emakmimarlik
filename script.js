const btn=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav-links');

btn?.addEventListener('click',()=>{
  nav.classList.toggle('show');
});

document.querySelectorAll('.nav-links a').forEach((a)=>{
  a.addEventListener('click',()=>{
    nav.classList.remove('show');
  });
});

const counters=document.querySelectorAll('.counter');

const animateCounter=(counter)=>{
  const target=Number(counter.dataset.target);
  const duration=1500;
  const start=performance.now();

  const update=(time)=>{
    const progress=Math.min((time-start)/duration,1);
    counter.textContent=Math.floor(progress*target);

    if(progress<1){
      requestAnimationFrame(update);
    }else{
      counter.textContent=target;
    }
  };

  requestAnimationFrame(update);
};

if(counters.length){
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.35});

  counters.forEach((counter)=>observer.observe(counter));
}

const galleryImages=document.querySelectorAll('.gallery-grid img');

if(galleryImages.length){
  const lightbox=document.createElement('div');
  lightbox.className='lightbox';
  lightbox.innerHTML=`
    <button class="lightbox-close" aria-label="Görseli kapat">&times;</button>
    <img src="" alt="Büyük proje görseli">
  `;
  document.body.appendChild(lightbox);

  const lightboxImg=lightbox.querySelector('img');
  const closeBtn=lightbox.querySelector('.lightbox-close');

  galleryImages.forEach((img)=>{
    img.addEventListener('click',()=>{
      lightboxImg.src=img.src;
      lightboxImg.alt=img.alt || 'Büyük proje görseli';
      lightbox.classList.add('show');
      document.body.classList.add('lightbox-open');
    });
  });

  const closeLightbox=()=>{
    lightbox.classList.remove('show');
    document.body.classList.remove('lightbox-open');
    lightboxImg.src='';
  };

  closeBtn.addEventListener('click',closeLightbox);

  lightbox.addEventListener('click',(e)=>{
    if(e.target===lightbox){
      closeLightbox();
    }
  });

  document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape' && lightbox.classList.contains('show')){
      closeLightbox();
    }
  });
}
