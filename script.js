// ---------- ambient bubbles ----------
const bubbleLayer = document.getElementById('bubbles');
const bubbleCount = window.innerWidth < 640 ? 10 : 18;
for(let i=0;i<bubbleCount;i++){
  const b = document.createElement('div');
  b.className = 'bubble';
  const size = 6 + Math.random()*22;
  b.style.width = size+'px';
  b.style.height = size+'px';
  b.style.left = Math.random()*100+'%';
  b.style.animationDuration = (10 + Math.random()*14)+'s';
  b.style.animationDelay = (Math.random()*14)+'s';
  bubbleLayer.appendChild(b);
}

// ---------- scroll reveal ----------
const revealTargets = document.querySelectorAll('.polaroid, .memory-text');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
},{threshold:0.25});
revealTargets.forEach(t=>io.observe(t));

// ---------- signature name draw ----------
const sig = document.getElementById('signatureName');
const sigIO = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      sig.classList.add('draw');
      sigIO.disconnect();
    }
  });
},{threshold:0.5});
sigIO.observe(sig);

// ---------- hero parallax ----------
const heroImg = document.querySelector('.hero-img');
let ticking = false;
window.addEventListener('scroll', ()=>{
  if(!ticking){
    requestAnimationFrame(()=>{
      const y = window.scrollY;
      if(y < window.innerHeight){
        heroImg.style.transform = `scale(1.08) translateY(${y*0.15}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }
});

// ---------- sand drawing canvas ----------
const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let lastX, lastY;

function fitCanvas(){
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#7a5a34';
  ctx.lineWidth = 3;
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

function getPos(e){
  const rect = canvas.getBoundingClientRect();
  if(e.touches && e.touches.length){
    return {x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top};
  }
  return {x: e.clientX - rect.left, y: e.clientY - rect.top};
}

function startDraw(e){
  drawing = true;
  const p = getPos(e);
  lastX = p.x; lastY = p.y;
}
function moveDraw(e){
  if(!drawing) return;
  e.preventDefault();
  const p = getPos(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  lastX = p.x; lastY = p.y;
}
function endDraw(){ drawing = false; }

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', moveDraw);
window.addEventListener('mouseup', endDraw);
canvas.addEventListener('touchstart', startDraw, {passive:true});
canvas.addEventListener('touchmove', moveDraw, {passive:false});
canvas.addEventListener('touchend', endDraw);

document.getElementById('resetSand').addEventListener('click', ()=>{
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0,0,rect.width,rect.height);
});

// ---------- descargar dibujo de arena ----------
document.getElementById('downloadSand').addEventListener('click', ()=>{
  // el fondo arenoso es un gradiente CSS, no está pintado dentro del canvas,
  // así que lo replicamos en un canvas temporal antes de exportar
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const exportCtx = exportCanvas.getContext('2d');

  const gradient = exportCtx.createLinearGradient(0, 0, 0, exportCanvas.height);
  gradient.addColorStop(0, '#E8C9A0');
  gradient.addColorStop(1, '#D9B385');
  exportCtx.fillStyle = gradient;
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  exportCtx.drawImage(canvas, 0, 0);

  const link = document.createElement('a');
  link.download = 'mi-firma-en-la-arena.png';
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
});