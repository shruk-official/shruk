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
  const elems = qa('.card, .project-card, .hero-title, .hero-sub, .vm-card');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in') });
  },{threshold:0.08});
  elems.forEach(el=>obs.observe(el));
}

function setupHomepageIntro(){
  const splash = q('#introSplash');
  const pageShell = q('#pageShell');
  const isHomePage = location.pathname.endsWith('index.html') || location.pathname.endsWith('/') || location.pathname === '';

  if(!isHomePage || !splash || !pageShell){
    if(pageShell){
      pageShell.classList.add('is-visible', 'is-ready');
    }
    return;
  }

  if(sessionStorage.getItem(INTRO_KEY) === '1'){
    splash.remove();
    pageShell.classList.add('is-visible', 'is-ready');
    return;
  }

  sessionStorage.setItem(INTRO_KEY, '1');
  document.body.classList.add('intro-playing');
  pageShell.classList.remove('is-visible', 'is-ready');

  window.setTimeout(()=>{
    pageShell.classList.add('is-visible');
    splash.classList.add('is-hidden');
  }, 4600);

  window.setTimeout(()=>{
    pageShell.classList.add('is-ready');
    splash.remove();
    document.body.classList.remove('intro-playing');
  }, 5000);
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

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  setupHomepageIntro();
  setupMobileMenu();
  setupObservers();
  handleContactForm();
  setupCallModal();
  setupCookieBanner();
  setupProjectOverlay();
});
