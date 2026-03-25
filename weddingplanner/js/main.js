/* ================================================
   main.js — Fetches data.json and renders all sections
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  fetch('./data.json')
    .then(res => res.json())
    .then(data => {
      renderNav(data);
      renderHero(data);
      renderTrustBanner(data);
      renderServices(data);
      renderPhotoGallery(data);
      renderVideoGallery(data);
      renderAboutUs(data);
      renderTestimonials(data);
      renderFaq(data);
      renderSocial(data);
      renderContact(data);
      renderFooter(data);
      initChatbot();
      initScrollEffects();
      initLightbox();
      initScrollSpy();
    })
    .catch(err => console.error('Failed to load data.json:', err));
});

/* ─── NAV ─────────────────────────────────────── */
function renderNav(data) {
  const brand = data.brand;
  document.querySelector('#nav-brand-name').textContent = brand.name;
  document.querySelector('#nav-brand-sub').textContent  = brand.tagline;

  const ul = document.querySelector('#navLinks');
  ul.innerHTML = data.nav.links.map(link => `
    <li class="nav-item">
      <a class="nav-link" href="${link.href}">${link.label}</a>
    </li>
  `).join('');

  // Scroll effect
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* ─── HERO ────────────────────────────────────── */
function renderHero(data) {
  const h = data.hero;
  const carouselInner = document.querySelector('#hero-carousel-inner');
  const carouselIndicators = document.querySelector('#hero-carousel-indicators');
  
  if (carouselInner && carouselIndicators && Array.isArray(h.heroImages) && h.heroImages.length > 0) {
    carouselInner.innerHTML = '';
    carouselIndicators.innerHTML = '';
    
    h.heroImages.forEach((slide, idx) => {
      carouselInner.insertAdjacentHTML('beforeend', `
        <div class="carousel-item ${idx === 0 ? 'active' : ''}">
          <img src="${slide.src}" alt="${slide.alt || ''}" class="hero-bg d-block w-100" />
        </div>
      `);
      
      carouselIndicators.insertAdjacentHTML('beforeend', `
        <button type="button" data-bs-target="#hero-carousel" data-bs-slide-to="${idx}" class="${idx === 0 ? 'active' : ''}" aria-current="${idx === 0 ? 'true' : 'false'}" aria-label="Slide ${idx + 1}"></button>
      `);
    });
  }

}

/* ─── SERVICES ────────────────────────────────── */
function renderServices(data) {
  const s = data.services;
  if(!s) return;
  document.querySelector('#services-title').textContent    = s.sectionTitle;
  document.querySelector('#services-subtitle').textContent = s.sectionSubtitle;
  
  const descEl = document.querySelector('#services-description');
  if (descEl && s.description) descEl.textContent = s.description;

  const grid = document.querySelector('#services-grid');
  grid.innerHTML = s.items.map(item => `
    <div class="col-md-6 col-lg-4 reveal">
      <div class="service-card">
        <div class="service-card-img-wrapper">
          <img src="${item.image}" alt="${item.title}" class="service-card-img">
        </div>
        <div class="service-card-body">
          <div class="service-icon-wrap">
            <i class="${item.icon}"></i>
          </div>
          <h5>${item.title}</h5>
          <p>${item.description}</p>
        </div>
      </div>
    </div>
  `).join('');
}

/* ─── PHOTO GALLERY ───────────────────────────── */
function renderPhotoGallery(data) {
  const g = data.photoGallery;
  document.querySelector('#photo-gallery-title').textContent    = g.sectionTitle;
  document.querySelector('#photo-gallery-subtitle').textContent = g.sectionSubtitle;

  const grid = document.querySelector('#photo-gallery-grid');
  grid.innerHTML = g.photos.map((photo, i) => `
    <div class="col-6 col-md-4 col-lg-3 reveal">
      <div class="gallery-item" data-img="${photo.src}" data-caption="${photo.caption}">
        <img src="${photo.src}" alt="${photo.alt}" loading="lazy">
        <div class="gallery-overlay">
          <span class="gallery-caption"><i class="fa-solid fa-camera me-1"></i>${photo.caption}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* ─── VIDEO GALLERY ───────────────────────────── */
function renderVideoGallery(data) {
  const v = data.videoGallery;
  document.querySelector('#video-gallery-title').textContent    = v.sectionTitle;
  document.querySelector('#video-gallery-subtitle').textContent = v.sectionSubtitle;

  const carouselInner = document.querySelector('#video-gallery-grid');
  carouselInner.innerHTML = v.videos.map((video, index) => `
    <div class="carousel-item${index === 0 ? ' active' : ''}">
      <div class="video-card mx-auto" style="max-width: 900px;">
        <div class="ratio ratio-16x9">
          <iframe
            src="${video.embedUrl}"
            title="${video.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
        <div class="video-card-title text-white mt-3">
          <i class="fa-solid fa-clapperboard me-2" style="color:var(--pink)"></i>${video.title}
        </div>
      </div>
    </div>
  `).join('');

  // Activate first slide explicitly as a fallback
  const firstSlide = carouselInner.querySelector('.carousel-item');
  if (firstSlide) firstSlide.classList.add('active');
}


/* ─── ABOUT US ────────────────────────────────── */
function renderAboutUs(data) {
  const a = data.aboutUs;
  if (!a) return;
  document.querySelector('#about-title').textContent    = a.sectionTitle;
  document.querySelector('#about-subtitle').textContent = a.sectionSubtitle;
  
  const descEl = document.querySelector('#about-description');
  if (descEl && a.description) descEl.innerHTML = a.description;

  const grid = document.querySelector('#about-grid');
  grid.innerHTML = a.founders.map(founder => `
    <div class="col-md-6 reveal">
      <div class="founder-card">
        <img src="${founder.photo}" alt="${founder.name}" loading="lazy" />
        <div class="founder-content">
          <h3>${founder.name}</h3>
          <p class="founder-title">${founder.title}</p>
          <p>${founder.bio}</p>
        </div>
      </div>
    </div>
  `).join('');
}


/* ─── SOCIAL ──────────────────────────────────── */
function renderSocial(data) {
  const s = data.social;
  document.querySelector('#social-title').textContent    = s.sectionTitle;
  document.querySelector('#social-subtitle').textContent = s.sectionSubtitle;

  const grid = document.querySelector('#social-grid');
  grid.innerHTML = s.platforms.map(p => `
    <div class="col-6 col-md-4 col-lg-2 reveal">
      <a href="${p.url}" target="_blank" rel="noopener" class="social-card">
        <i class="${p.icon} social-icon"></i>
        <span class="social-platform">${p.platform}</span>
        <span class="social-handle">${p.handle}</span>
      </a>
    </div>
  `).join('');
}

/* ─── CONTACT ─────────────────────────────────── */
function renderContact(data) {
  const c = data.contact;
  document.querySelector('#contact-title').textContent    = c.sectionTitle;
  document.querySelector('#contact-subtitle').textContent = c.sectionSubtitle;

  document.querySelector('#contact-info-block').innerHTML = `
    <h4><i class="fa-solid fa-heart me-2" style="color:var(--gold)"></i>Get In Touch</h4>
    <div class="contact-info-item">
      <div class="contact-info-icon"><i class="fa-solid fa-phone"></i></div>
      <div class="contact-info-text"><strong>Phone</strong>${c.phone}</div>
    </div>
    <div class="contact-info-item">
      <div class="contact-info-icon"><i class="fa-solid fa-envelope"></i></div>
      <div class="contact-info-text"><strong>Email</strong>${c.email}</div>
    </div>
    <div class="contact-info-item">
      <div class="contact-info-icon"><i class="fa-solid fa-location-dot"></i></div>
      <div class="contact-info-text"><strong>Address</strong>${c.address}</div>
    </div>
    <div class="contact-info-item">
      <div class="contact-info-icon"><i class="fa-solid fa-clock"></i></div>
      <div class="contact-info-text"><strong>Hours</strong>${c.hours}</div>
    </div>
  `;

  const fl = c.formLabels;
  document.querySelector('#contact-form-block').innerHTML = `
    <form id="contactForm" novalidate>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">${fl.name}</label>
          <input type="text" id="contactName" class="form-control" placeholder="Jane & John Smith" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">${fl.email}</label>
          <input type="email" id="contactEmail" class="form-control" placeholder="hello@example.com" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">${fl.phone}</label>
          <input type="tel" id="contactPhone" class="form-control" placeholder="+91 00000 00000">
        </div>
        <div class="col-md-6">
          <label class="form-label">${fl.weddingDate}</label>
          <input type="date" id="contactDate" class="form-control">
        </div>
        <div class="col-12">
          <label class="form-label">${fl.message}</label>
          <textarea id="contactMessage" class="form-control" rows="5" placeholder="Tell us your vision, venue ideas, guest count…"></textarea>
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-submit">${fl.submit} <i class="fa-solid fa-paper-plane ms-2"></i></button>
        </div>
      </div>
    </form>
  `;

  // Form submit handler - redirect to WhatsApp
  document.getElementById('contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const date = document.getElementById('contactDate').value;
    const msg = document.getElementById('contactMessage').value.trim();

    if (!name || (!email && !phone)) {
      alert("Please enter at least your name and a contact detail.");
      return;
    }

    const phoneNum = "919876543210"; // Default phone from data.json
    let waText = `Hello Whimsical Wonder team! 👋\n\nI would like to inquire about wedding planning:\n\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone}\n*Planned Date:* ${date}\n\n*Message:* \n${msg}`;

    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodedText}`;

    window.open(waUrl, '_blank');

    // Visual feedback
    const btn = e.target.querySelector('[type=submit]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-brands fa-whatsapp me-2"></i>Redirecting...';
    btn.style.background = 'linear-gradient(135deg, #25D366, #128C7E)';
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      e.target.reset();
    }, 3000);
  });
}

/* ─── FOOTER ──────────────────────────────────── */
function renderFooter(data) {
  const f = data.footer;
  document.querySelector('#footer-brand').textContent    = data.brand.name;
  document.querySelector('#footer-tagline').textContent  = f.tagline;
  document.querySelector('#footer-copy').textContent     = f.copyright;
}

/* ─── CHATBOT WIDGET ──────────────────────────── */
function initChatbot() {
  const toggleBtn = document.getElementById('chatbot-toggle');
  const closeBtn = document.getElementById('chatbot-close');
  const popup = document.getElementById('chatbot-popup');
  const form = document.getElementById('chatbot-form');

  if (!toggleBtn || !popup) return;

  toggleBtn.addEventListener('click', () => {
    popup.classList.remove('d-none');
    toggleBtn.classList.add('d-none');
  });

  closeBtn.addEventListener('click', () => {
    popup.classList.add('d-none');
    toggleBtn.classList.remove('d-none');
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('cb-name').value.trim();
    const phone = document.getElementById('cb-phone').value.trim();
    const eventType = document.getElementById('cb-event').value;

    const phoneNum = "919876543210"; 
    const textMsg = `Hello! I'm interested in starting my planning ❤️\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Event Type:* ${eventType}`;
    const waUrl = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(textMsg)}`;
    
    window.open(waUrl, '_blank');
    
    // reset and close
    form.reset();
    popup.classList.add('d-none');
    toggleBtn.classList.remove('d-none');
  });
}

/* ─── LIGHTBOX ────────────────────────────────── */
function initLightbox() {
  const overlay  = document.getElementById('lightbox-overlay');
  const img      = document.getElementById('lightbox-img');
  const caption  = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');

  document.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (item) {
      img.src        = item.dataset.img;
      caption.textContent = item.dataset.caption;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  const closeLightbox = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    img.src = '';
  };

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

/* ─── TRUST BANNER ────────────────────────────── */
function renderTrustBanner(data) {
  const t = data.trustBanner;
  if (!t) return;
  document.querySelector('#trust-title').textContent = t.title;
  const grid = document.querySelector('#trust-grid');
  grid.innerHTML = t.logos.map(logo => `
    <div class="col-auto px-4 text-center reveal">
      <i class="${logo.icon} trust-icon d-inline-block align-middle"></i>
      <span class="trust-name d-none d-md-inline-block align-middle">${logo.name}</span>
    </div>
  `).join('');
}

/* ─── TESTIMONIALS ────────────────────────────── */
function renderTestimonials(data) {
  const t = data.testimonials;
  if (!t) return;
  document.querySelector('#testimonials-title').textContent    = t.sectionTitle;
  document.querySelector('#testimonials-subtitle').textContent = t.sectionSubtitle;

  const grid = document.querySelector('#testimonials-grid');
  grid.innerHTML = t.reviews.map(review => `
    <div class="col-md-4 reveal">
      <div class="testimonial-card border-0">
        <i class="fa-solid fa-quote-left quote-icon"></i>
        <p class="testimonial-text mb-4">"${review.text}"</p>
        <div class="d-flex align-items-center justify-content-center">
          <div>
            <h5 class="mb-1">${review.name}</h5>
            <small class="text-muted">${review.date}</small>
            <div class="mt-2 text-warning">
              ${'<i class="fa-solid fa-star"></i>'.repeat(review.rating)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ─── FAQ ─────────────────────────────────────── */
function renderFaq(data) {
  const f = data.faq;
  if(!f) return;
  document.querySelector('#faq-title').textContent    = f.sectionTitle;
  document.querySelector('#faq-subtitle').textContent = f.sectionSubtitle;

  const accordion = document.querySelector('#faq-accordion');
  accordion.innerHTML = f.questions.map((item, index) => `
    <div class="accordion-item mb-3 border-0 shadow-sm rounded-3 overflow-hidden reveal">
      <h2 class="accordion-header" id="heading-${index}">
        <button class="accordion-button collapsed fw-bold text-dark" style="background:#fcfaf8;" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}" aria-expanded="false" aria-controls="collapse-${index}">
          ${item.q}
        </button>
      </h2>
      <div id="collapse-${index}" class="accordion-collapse collapse" aria-labelledby="heading-${index}" data-bs-parent="#faq-accordion">
        <div class="accordion-body text-muted bg-white">
          ${item.a}
        </div>
      </div>
    </div>
  `).join('');
}

/* ─── SCROLL REVEAL ───────────────────────────── */
function initScrollEffects() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  // Observe all .reveal elements added dynamically
  const revealDelayed = () => {
    document.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 0.1}s`;
      observer.observe(el);
    });
  };

  // Wait for DOM rendering of dynamic content
  setTimeout(revealDelayed, 100);
}

/* ─── SCROLL SPY (Active nav link) ───────────── */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });
}
