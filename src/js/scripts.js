import { createClient } from '@supabase/supabase-js';

// Main interactivity + Supabase contact handler
const q = (s) => document.querySelector(s);
const qa = (s) => document.querySelectorAll(s);
const INTRO_KEY = 'shrukIntroPlayed';

// Mobile overlay/menu
function setupMobileMenu(){
  const hamburger = q('#hamburger') || q('#hamburgerProjects') || q('#hamburgerContact');
  const overlay = q('#mobileOverlay');
  const overlayClose = q('#overlayClose');
  if(!hamburger || !overlay) return;
  hamburger.addEventListener('click', ()=> overlay.classList.add('show'));
  if(overlayClose) overlayClose.addEventListener('click', ()=> overlay.classList.remove('show'));
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) overlay.classList.remove('show') });
}

// Simple fade-in on scroll for elements with .hero-title etc.
function setupObservers(){
  const elems = qa('.card, .project-card, .hero-title, .hero-sub, .vm-card, .scroll-reveal');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in') });
  },{threshold:0.1});
  elems.forEach(el=>obs.observe(el));
}

function setupHomepageIntro(){
  const pageShell = q('#pageShell');
  if(pageShell){
      pageShell.classList.add('is-visible', 'is-ready');
  }

  // Trigger hero content immediately since cinematic intro is removed
  const content = q('#heroContent');
  if(content) {
      content.classList.add('animate-in');
      setTimeout(() => {
          typeWriterEffect();
      }, 500); 
  }
}

function typeWriterEffect() {
    const title = document.getElementById('typewriterText');
    const sub = document.getElementById('heroSub');
    const actions = document.getElementById('heroActions');
    
    if (!title) return;
    
    const text = "We Build the Future, One Line at a Time";
    
    // Check if animation has already played this session
    if (sessionStorage.getItem(INTRO_KEY)) {
        title.innerHTML = text;
        if (sub) sub.style.opacity = '1';
        if (actions) actions.style.opacity = '1';
        return;
    }
    
    // Mark as played for this session
    sessionStorage.setItem(INTRO_KEY, 'true');

    let i = 0;
    title.innerHTML = ""; // Ensure it's empty
    
    function type() {
        if (i < text.length) {
            title.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 45); // typing speed
        } else {
            // Typing finished, reveal subtitle and buttons
            if (sub) sub.style.opacity = '1';
            if (actions) actions.style.opacity = '1';
        }
    }
    
    type();
}

// Read supabase config from hardcoded values for mobile compatibility
function getSupabaseConfig(){
  const url = 'https://jkqymxngwceeauxzevyp.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcXlteG5nd2NlZWF1eHpldnlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODI3MjIsImV4cCI6MjA5Mzg1ODcyMn0.1F5NTTRVEggetTeUdboQtYPke6lZc94LcItJg7mlLng';
  return { url, key };
}

// Add lightweight helper to show messages
function showFormMessage(el, msg, ok=true){
  el.textContent = msg;
  el.style.color = ok ? '#065f46' : '#b91c1c';
}

// Handle contact form submission via Supabase (client-side).
async function handleContactForm(){
  const form = q('#contactForm');
  if(!form) return;
  const submitBtn = q('#submitBtn');
  const submitBtnDefault = submitBtn ? submitBtn.innerHTML : 'Send Message';
  const msgEl = q('#formMessage');
  const phoneInput = q('#phone');

  if(phoneInput){
    phoneInput.addEventListener('input', ()=>{
      phoneInput.value = phoneInput.value.replace(/\D+/g, '').slice(0, 10);
    });
  }

  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span><span>Sending...</span>';
    showFormMessage(msgEl, '', true);

    const full_name = q('#fullName').value.trim();
    const email = q('#email').value.trim();
    const phone = q('#phone').value.trim();
    const message = q('#message').value.trim();

    if(!/^\d{10}$/.test(phone)){
      showFormMessage(msgEl, 'Phone number must be exactly 10 digits.', false);
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitBtnDefault;
      return;
    }

    const { url, key } = getSupabaseConfig();
    if(!url || !key){
      showFormMessage(msgEl, 'Something went wrong. Please try again.', false);
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitBtnDefault;
      return;
    }

    try{
      const supabase = createClient(url, key);

      const payload = { full_name, email, phone, message };
      const { error } = await supabase.from('contacts').insert([payload]);
      if(error){
        console.error('Supabase insert error', error);
        showFormMessage(msgEl, 'Something went wrong. Please try again.', false);
      } else {
        showFormMessage(msgEl, "Thanks! We'll be in touch within 24 hours ✅", true);
        setTimeout(() => {
          msgEl.style.transition = 'opacity 0.5s ease';
          msgEl.style.opacity = '0';
          setTimeout(() => {
            msgEl.textContent = '';
            msgEl.style.opacity = '1';
            msgEl.style.transition = '';
          }, 500);
        }, 10000);
        form.reset();
      }
    }catch(err){
      console.error(err);
      showFormMessage(msgEl, 'Something went wrong. Please try again.', false);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = submitBtnDefault;
  });
}

// Handle call modal on contact page
function setupCallModal(){
  const callBtn = q('#callBtn');
  const callModal = q('#callModal');
  const closeBtn = q('.call-modal__close');
  const backdrop = q('.call-modal__backdrop');
  
  if(!callBtn || !callModal) return;

  // Open modal when button clicked
  callBtn.addEventListener('click', ()=>{
    callModal.classList.add('show');
  });

  // Close modal when close button clicked
  if(closeBtn){
    closeBtn.addEventListener('click', ()=>{
      callModal.classList.remove('show');
    });
  }

  // Close modal when backdrop clicked
  if(backdrop){
    backdrop.addEventListener('click', ()=>{
      callModal.classList.remove('show');
    });
  }

  // Close modal when escape pressed
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && callModal.classList.contains('show')){
      callModal.classList.remove('show');
    }
  });
}

// Cookie Consent Banner
function setupCookieBanner(){
  const banner = q('#cookieBanner');
  const acceptBtn = q('#acceptCookies');
  const declineBtn = q('#declineCookies');

  if(!banner || !acceptBtn || !declineBtn) return;

  // Check if user has already made a choice
  const cookieConsent = getCookie('cookieConsent');
  if(cookieConsent === 'accepted'){
    return; // Don't show banner
  }

  // Show banner
  banner.classList.add('show');

  // Accept cookies
  acceptBtn.addEventListener('click', ()=>{
    setCookie('cookieConsent', 'accepted', 365);
    banner.classList.remove('show');
  });

  // Decline cookies
  declineBtn.addEventListener('click', ()=>{
    setCookie('cookieConsent', 'declined', 365);
    banner.classList.remove('show');
  });
}

// Cookie helpers
function setCookie(name, value, days){
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name){
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++){
    let c = ca[i];
    while(c.charAt(0) === ' ') c = c.substring(1, c.length);
    if(c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Handle project view overlay on projects page
function setupProjectOverlay(){
  const btn = q('#viewProjectBtn');
  const overlay = q('#projectOverlay');
  const closeBtn = q('.project-overlay__close');
  const iframe = q('#projectIframe');

  if(!btn || !overlay) return;

  const projectUrl = 'https://splendid-mooncake-2f71dd.netlify.app/';

  btn.addEventListener('click', ()=>{
    iframe.src = projectUrl;
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  });

  closeBtn.addEventListener('click', ()=>{
    overlay.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
    // Clear iframe src after animation to stop loading
    setTimeout(() => {
      iframe.src = '';
    }, 300);
  });

  // Close on escape key
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && overlay.classList.contains('show')){
      closeBtn.click();
    }
  });
}
// Realistic Silk Simulation
class RealisticSilkSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.width = 0;
        this.height = 0;
        this.gridSize = 40; // Increased for better performance (less lag)
        this.points = [];
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2, radius: 400, strength: 0.6 };
        this.time = 0;
        this.noiseOffset = Math.random() * 1000;
        this.extra = 4; // Extra rows/cols to cover edges completely
        this.cols = 0;
        this.rows = 0;
        
        this.init();
        this.animate();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = e.clientX;
            this.mouse.targetY = e.clientY;
        });
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.createGrid();
    }

    createGrid() {
        this.points = [];
        this.cols = Math.ceil(this.width / this.gridSize) + this.extra * 2;
        this.rows = Math.ceil(this.height / this.gridSize) + this.extra * 2;

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.points.push({
                    x: (x - this.extra) * this.gridSize,
                    y: (y - this.extra) * this.gridSize,
                    baseX: (x - this.extra) * this.gridSize,
                    baseY: (y - this.extra) * this.gridSize,
                    vx: 0,
                    vy: 0,
                    offset: (x + y) * 0.15
                });
            }
        }
    }

    noise(x, y, t) {
        return Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t) * Math.sin((x + y) * 0.005 + t * 0.5);
    }

    animate() {
        this.time += 0.006;
        
        // Smooth mouse movement for reactive feel
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;
        
        this.ctx.fillStyle = '#B0D4E3';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.points.forEach((point, i) => {
            const x = i % this.cols;
            const y = Math.floor(i / this.cols);
            
            const wave1 = Math.sin(this.time * 1.5 + point.offset * 2) * 35;
            const wave2 = Math.cos(this.time * 0.8 + point.offset * 1.5) * 30;
            const wave3 = Math.sin(this.time * 2.2 + x * 0.1) * 20;
            const wave4 = Math.cos(this.time * 1.3 + y * 0.1) * 25;
            
            const noiseVal = this.noise(x, y, this.time + this.noiseOffset) * 40;
            
            let targetX = point.baseX + wave1 + wave3 + noiseVal;
            let targetY = point.baseY + wave2 + wave4 + noiseVal * 0.8;
            
            const dx = this.mouse.x - point.baseX;
            const dy = this.mouse.y - point.baseY;
            const distanceSq = dx * dx + dy * dy;
            const radiusSq = this.mouse.radius * this.mouse.radius;
            
            if (distanceSq < radiusSq) {
                const distance = Math.sqrt(distanceSq);
                const force = Math.pow((1 - distance / this.mouse.radius), 2.5) * this.mouse.strength;
                targetX += (dx / distance) * force * 200;
                targetY += (dy / distance) * force * 200;
            }
            
            point.vx += (targetX - point.x) * 0.06;
            point.vy += (targetY - point.y) * 0.06;
            point.vx *= 0.85;
            point.vy *= 0.85;
            point.x += point.vx;
            point.y += point.vy;
        });

        this.drawSilkMesh();
        requestAnimationFrame(() => this.animate());
    }

    drawSilkMesh() {
        for (let y = 0; y < this.rows - 1; y++) {
            for (let x = 0; x < this.cols - 1; x++) {
                const i = y * this.cols + x;
                const p1 = this.points[i];
                const p2 = this.points[i + 1];
                const p3 = this.points[i + this.cols];
                const p4 = this.points[i + this.cols + 1];
                
                if (!p1 || !p2 || !p3 || !p4) continue;
                
                const lighting = this.calculateLighting(p1, p2, p3, p4);
                const baseColor = this.getColorForPosition(y, this.rows, lighting);
                
                this.ctx.fillStyle = baseColor;
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.lineTo(p4.x, p4.y);
                this.ctx.lineTo(p3.x, p3.y);
                this.ctx.closePath();
                this.ctx.fill();
                
                if (lighting > 1.1) {
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${(lighting - 1.1) * 0.5})`;
                    this.ctx.fill();
                }
                
                if (lighting < 0.9) {
                    this.ctx.fillStyle = `rgba(0, 0, 0, ${(0.9 - lighting) * 0.3})`;
                    this.ctx.fill();
                }
            }
        }
    }

    calculateLighting(p1, p2, p3, p4) {
        const v1x = p2.x - p1.x;
        const v1y = p2.y - p1.y;
        const v2x = p3.x - p1.x;
        const v2y = p3.y - p1.y;
        
        const avgDisplacement = (
            Math.abs(p1.x - p1.baseX) + Math.abs(p1.y - p1.baseY) +
            Math.abs(p2.x - p2.baseX) + Math.abs(p2.y - p2.baseY) +
            Math.abs(p3.x - p3.baseX) + Math.abs(p3.y - p3.baseY) +
            Math.abs(p4.x - p4.baseX) + Math.abs(p4.y - p4.baseY)
        ) / 4;
        
        const cross = v1x * v2y - v1y * v2x;
        const normalizedCross = cross / (this.gridSize * this.gridSize * 25);
        
        const lightIntensity = 1 + normalizedCross + (avgDisplacement / 150);
        return Math.max(0.6, Math.min(1.4, lightIntensity));
    }

    getColorForPosition(y, rows, lighting) {
        const progress = y / rows;
        let r, g, b;
        
        if (progress < 0.33) {
            const t = progress / 0.33;
            r = Math.floor(176 + (147 - 176) * t);
            g = Math.floor(212 + (112 - 212) * t);
            b = Math.floor(227 + (219 - 227) * t);
        } else if (progress < 0.66) {
            const t = (progress - 0.33) / 0.33;
            r = Math.floor(147 + (100 - 147) * t);
            g = Math.floor(112 + (149 - 112) * t);
            b = Math.floor(219 + (237 - 219) * t);
        } else {
            const t = (progress - 0.66) / 0.34;
            r = Math.floor(100 + (135 - 100) * t);
            g = Math.floor(149 + (206 - 149) * t);
            b = Math.floor(237 + (250 - 237) * t);
        }
        
        r = Math.floor(r * lighting);
        g = Math.floor(g * lighting);
        b = Math.floor(b * lighting);
        
        return `rgb(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)})`;
    }
}
// Custom Cursor Initialization
function initCustomCursor() {
    const dot = document.getElementById('cursorDot');
    const circle = document.getElementById('cursorCircle');
    
    if (!dot || !circle) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let circleX = mouseX;
    let circleY = mouseY;
    let hasMoved = false;
    
    // Hide initially
    dot.style.opacity = '0';
    circle.style.opacity = '0';
    
    window.addEventListener('mousemove', (e) => {
        if (!hasMoved) {
            hasMoved = true;
            dot.style.opacity = '1';
            circle.style.opacity = '1';
            circleX = e.clientX;
            circleY = e.clientY;
        }
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Dot follows instantly
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });
    
    // Circle follows with delay
    function render() {
        circleX += (mouseX - circleX) * 0.15;
        circleY += (mouseY - circleY) * 0.15;
        circle.style.transform = `translate(${circleX}px, ${circleY}px) translate(-50%, -50%)`;
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    
    // Hover effects on interactive elements
    const clickables = document.querySelectorAll('a, button, input, textarea, select, .card, .btn');
    clickables.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            circle.style.width = '60px';
            circle.style.height = '60px';
            circle.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            circle.style.borderColor = '#C084FC';
            dot.style.backgroundColor = '#C084FC';
        });
        el.addEventListener('mouseleave', () => {
            circle.style.width = '40px';
            circle.style.height = '40px';
            circle.style.backgroundColor = 'transparent';
            circle.style.borderColor = 'var(--white)';
            dot.style.backgroundColor = 'var(--white)';
        });
    });
}

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  setupHomepageIntro();
  setupMobileMenu();
  setupObservers();
  handleContactForm();
  setupCallModal();
  setupCookieBanner();
  setupProjectOverlay();

  const silkCanvas = document.getElementById('silkCanvas');
  if (silkCanvas) {
      new RealisticSilkSimulation(silkCanvas);
  }
  initCustomCursor();
});
