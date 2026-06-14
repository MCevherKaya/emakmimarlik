const btn=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav-links');
btn?.addEventListener('click',()=>nav.classList.toggle('show'));
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('show')));
