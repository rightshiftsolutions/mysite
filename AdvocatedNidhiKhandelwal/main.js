/* ── Advocate SVG avatars ── */
const AVATAR_FULL = `
<svg viewBox="0 0 280 380" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="140" cy="340" rx="90" ry="30" fill="rgba(212,169,58,0.15)"/>
  <path d="M60 380 Q55 280 80 240 L140 260 L200 240 Q225 280 220 380Z" fill="#0f1c35"/>
  <path d="M140 260 L115 240 L100 380" fill="#1e3260"/>
  <path d="M140 260 L165 240 L180 380" fill="#1e3260"/>
  <rect x="127" y="228" width="12" height="26" rx="3" fill="white"/>
  <rect x="141" y="228" width="12" height="26" rx="3" fill="white"/>
  <rect x="126" y="205" width="28" height="28" rx="6" fill="#d4a574"/>
  <ellipse cx="140" cy="175" rx="44" ry="50" fill="#d4a574"/>
  <ellipse cx="140" cy="132" rx="44" ry="22" fill="#2c1508"/>
  <ellipse cx="98" cy="168" rx="12" ry="28" fill="#2c1508"/>
  <ellipse cx="182" cy="168" rx="12" ry="28" fill="#2c1508"/>
  <line x1="140" y1="128" x2="140" y2="148" stroke="#1a0d04" stroke-width="1.5"/>
  <ellipse cx="97" cy="178" rx="7" ry="9" fill="#c49060"/>
  <ellipse cx="183" cy="178" rx="7" ry="9" fill="#c49060"/>
  <path d="M118 160 Q127 156 136 160" stroke="#2c1508" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M144 160 Q153 156 162 160" stroke="#2c1508" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="127" cy="172" rx="8" ry="8" fill="white"/>
  <ellipse cx="153" cy="172" rx="8" ry="8" fill="white"/>
  <circle cx="128" cy="173" r="5" fill="#2c1508"/>
  <circle cx="154" cy="173" r="5" fill="#2c1508"/>
  <circle cx="130" cy="171" r="1.5" fill="white"/>
  <circle cx="156" cy="171" r="1.5" fill="white"/>
  <path d="M137 182 Q140 190 143 182" stroke="#b07840" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M128 198 Q140 206 152 198" stroke="#a06040" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M128 198 Q140 194 152 198" stroke="#a06040" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <circle cx="140" cy="152" r="4" fill="#b8922a"/>
  <circle cx="97" cy="185" r="4" fill="#b8922a"/>
  <circle cx="183" cy="185" r="4" fill="#b8922a"/>
  <path d="M80 260 Q50 290 55 340" stroke="#0f1c35" stroke-width="28" stroke-linecap="round" fill="none"/>
  <path d="M200 260 Q230 290 225 340" stroke="#0f1c35" stroke-width="28" stroke-linecap="round" fill="none"/>
  <ellipse cx="55" cy="344" rx="14" ry="10" fill="#d4a574"/>
  <ellipse cx="225" cy="344" rx="14" ry="10" fill="#d4a574"/>
  <rect x="38" y="330" width="34" height="22" rx="3" fill="#b8922a"/>
  <rect x="40" y="332" width="30" height="18" rx="2" fill="#d4a93a"/>
  <line x1="55" y1="332" x2="55" y2="350" stroke="#b8922a" stroke-width="1.5"/>
</svg>`;

const AVATAR_SMALL = `
<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
  <rect width="110" height="110" fill="#c9b99a"/>
  <ellipse cx="55" cy="100" rx="40" ry="28" fill="#0f1c35"/>
  <rect x="47" y="76" width="7" height="16" rx="2" fill="white"/>
  <rect x="56" y="76" width="7" height="16" rx="2" fill="white"/>
  <rect x="48" y="66" width="14" height="14" rx="4" fill="#d4a574"/>
  <ellipse cx="55" cy="50" rx="22" ry="26" fill="#d4a574"/>
  <ellipse cx="55" cy="30" rx="22" ry="13" fill="#2c1508"/>
  <ellipse cx="34" cy="46" rx="7" ry="16" fill="#2c1508"/>
  <ellipse cx="76" cy="46" rx="7" ry="16" fill="#2c1508"/>
  <ellipse cx="46" cy="50" rx="4" ry="4" fill="white"/>
  <ellipse cx="64" cy="50" rx="4" ry="4" fill="white"/>
  <circle cx="47" cy="51" r="2.5" fill="#2c1508"/>
  <circle cx="65" cy="51" r="2.5" fill="#2c1508"/>
  <path d="M48 62 Q55 67 62 62" stroke="#a06040" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <circle cx="55" cy="36" r="3" fill="#b8922a"/>
</svg>`;

/* ── Language state ── */
let currentLang = "en";
let DATA_EN = null; // populated after fetch

const LANG_DATA = () => (currentLang === "en" ? DATA_EN : DATA_HI);

function toggleLanguage() {
  currentLang = currentLang === "en" ? "hi" : "en";
  const d = LANG_DATA();
  renderRibbon(d);
  renderNav(d);
  renderHero(d);
  renderElection(d);
  renderProfileCard(d);
  renderInfoGrid(d);
  renderConsultation(d);
  renderContactGrid(d);
  renderFooter(d);
}

/* ── Render functions ── */

function renderRibbon(d) {
  document.getElementById("ribbon").innerHTML = d.ribbon.replace(
    /•/g,
    "<span>•</span>",
  );
}

function renderNav(d) {
  const { name, sub, enrollBadge } = d.nav;
  const btnLabel = currentLang === "en" ? "हिंदी" : "English";
  const links = [
    { href: "#hero-section", icon: "🏠", label: currentLang === "en" ? "Home" : "होम" },
    { href: "#election",     icon: "🗳️", label: currentLang === "en" ? "Campaign" : "अभियान" },
    { href: "#details",      icon: "📋", label: currentLang === "en" ? "Profile" : "प्रोफ़ाइल" },
    { href: "#consultation", icon: "⚖️", label: currentLang === "en" ? "Consult" : "परामर्श" },
    { href: "#contact-grid", icon: "📞", label: currentLang === "en" ? "Contact" : "संपर्क" },
  ];

  const navLinksHtml = links.map(l =>
    `<li><a href="${l.href}"><span class="nav-link-icon">${l.icon}</span>${l.label}</a></li>`
  ).join("");

  const drawerLinksHtml = links.map(l =>
    `<a href="${l.href}">${l.icon} ${l.label}</a>`
  ).join("");

  document.getElementById("nav").innerHTML = `
    <div class="nav-brand">
      <div class="nav-seal">⚖️</div>
      <div class="nav-brand-text">
        <div class="name">${name}</div>
        <div class="sub">${sub}</div>
      </div>
    </div>

    <ul class="nav-links">${navLinksHtml}</ul>

    <div class="nav-right">
      <div class="nav-enroll">${enrollBadge}</div>
      <button class="nav-lang-btn" id="lang-toggle" onclick="toggleLanguage()" aria-label="Toggle language">${btnLabel}</button>
      <a class="nav-consult-btn" href="#consultation">${currentLang === "en" ? "Free Consultation" : "निःशुल्क परामर्श"}</a>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile drawer (rendered outside nav flow via JS) -->`;

  // Inject mobile drawer after nav
  let drawer = document.getElementById("nav-mobile-drawer");
  if (!drawer) {
    drawer = document.createElement("div");
    drawer.id = "nav-mobile-drawer";
    drawer.className = "nav-mobile-drawer";
    document.getElementById("nav").after(drawer);
  }
  drawer.innerHTML = `
    ${drawerLinksHtml}
    <div class="drawer-divider"></div>
    <button onclick="toggleLanguage()" style="background:none;border:1.5px solid var(--border);border-radius:8px;padding:11px 14px;font-size:0.9rem;font-weight:600;cursor:pointer;color:var(--ink);display:flex;align-items:center;gap:10px;">🌐 ${btnLabel}</button>
    <a href="#consultation" class="drawer-cta">⚖️ ${currentLang === "en" ? "Free Consultation" : "निःशुल्क परामर्श"}</a>`;

  // Hamburger toggle
  const hamburger = document.getElementById("nav-hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const isOpen = drawer.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", isOpen);
    });
  }

  // Close drawer on link click
  drawer.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      drawer.classList.remove("open");
      hamburger?.classList.remove("open");
    });
  });
}

/* ── Hero auto-timer handle (module-level so language toggle can clear it) ── */
let _heroTimer = null;
let _heroParallaxBound = false;

/* Cinematic background images — 3 slides mapped to 3 BG layers */
const HERO_BGS = [
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000", // courtroom
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2000", // law books / desk
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=2000", // library / justice
];

function renderHero(d) {
  if (_heroTimer) { clearInterval(_heroTimer); _heroTimer = null; }

  const slides    = d.hero.slides;
  const bgStage   = document.getElementById("hero-bg-stage");
  const textEl    = document.getElementById("hero-text-stage");
  const dotsEl    = document.getElementById("hero-dots");
  const cardFooter = document.getElementById("hero-card-footer");
  const heroSection = document.getElementById("hero-section");

  let current     = 0;
  let isAnimating = false;
  let isScrolling = false;

  // ── Build background layers once ──
  bgStage.innerHTML = "";
  HERO_BGS.forEach((url, i) => {
    const layer = document.createElement("div");
    layer.className = "hero-bg-layer" + (i === 0 ? " active" : "");
    layer.style.backgroundImage = `url('${url}')`;
    bgStage.appendChild(layer);
  });

  // ── Build nav dots ──
  dotsEl.innerHTML = "";
  slides.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.className = "hnr-btn" + (i === 0 ? " active" : "");
    btn.setAttribute("aria-label", `Slide ${i + 1}`);
    btn.innerHTML = `
      <span class="hnr-label">0${i + 1}</span>
      <span class="hnr-track"><span class="hnr-fill"></span></span>
      <span class="hnr-title">${s.eyebrow.replace(/^[\S]+\s/, "")}</span>`;
    btn.addEventListener("click", () => { if (!isAnimating) { goTo(i); resetTimer(); } });
    dotsEl.appendChild(btn);
  });

  const statsLabels = {
    years:      currentLang === "hi" ? "वर्षों का अनुभव" : "Years Practice",
    enrollment: currentLang === "hi" ? "नामांकन"         : "Enrollment",
    since:      currentLang === "hi" ? "से प्रैक्टिस"    : "Since",
  };

  // ── Render slide text ──
  function renderSlide(index) {
    const s = slides[index];
    const pills = s.pills.map(p =>
      `<span class="pill"><span class="dot"></span>${p}</span>`
    ).join("");

    textEl.innerHTML = `
      <div class="hs-inner">
        <div class="reveal-box"><span class="reveal-item hero-eyebrow">${s.eyebrow}</span></div>
        <div class="reveal-box"><h1 class="reveal-item hero-h1">${s.firstName}<br><em>${s.lastName}</em></h1></div>
        <div class="reveal-box"><p class="reveal-item title-line">${s.titleLine}</p></div>
        <div class="hero-divider"></div>
        <div class="hero-enroll-row">${pills}</div>
        <div class="hero-actions">
          <a class="hero-cta" href="${s.ctaHref}">${s.ctaLabel}</a>
          <a class="hero-cta-outline" href="${s.ctaOutlineHref}">${s.ctaOutlineLabel}</a>
        </div>
        ${index === 0 ? `
        <div class="hero-stats">
          <div class="hero-stat"><div class="hero-stat-value">20+</div><div class="hero-stat-label">${statsLabels.years}</div></div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat"><div class="hero-stat-value">R/3505</div><div class="hero-stat-label">${statsLabels.enrollment}</div></div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat"><div class="hero-stat-value">2005</div><div class="hero-stat-label">${statsLabels.since}</div></div>
        </div>` : ""}
      </div>`;

    // Card footer
    if (cardFooter) {
      cardFooter.innerHTML = `
        <div class="hcf-inner active-card">
          <div class="hcf-title">${s.firstName} ${s.lastName}</div>
          <div class="hcf-desc">${s.titleLine}</div>
        </div>`;
    }
  }

  // ── Transition between slides ──
  function goTo(index) {
    if (index === current || isAnimating) return;
    isAnimating = true;

    const allBgs  = bgStage.querySelectorAll(".hero-bg-layer");
    const allBtns = dotsEl.querySelectorAll(".hnr-btn");
    const img     = document.getElementById("hero-main-photo");

    // Fade out text column
    textEl.classList.add("hs-leaving");

    // Fade out card image
    if (img) img.classList.add("img-fade");

    // Switch BG + nav dots
    allBgs.forEach((b, i)  => b.classList.toggle("active", i === index));
    allBtns.forEach((b, i) => b.classList.toggle("active", i === index));

    // Reset progress bar on newly active btn
    const activeBtn = allBtns[index];
    const fill = activeBtn?.querySelector(".hnr-fill");
    if (fill) { fill.style.transition = "none"; fill.style.width = "0"; }

    setTimeout(() => {
      // Swap image
      if (img) {
        img.src = slides[index].photo || "Nidhi_Khandelwal_img.webp";
        img.classList.remove("img-fade");
      }

      // Remove leaving class — CSS animation on .hs-inner will auto-play
      textEl.classList.remove("hs-leaving");
      current = index;
      renderSlide(index);

      // Re-trigger fill animation
      requestAnimationFrame(() => { if (fill) fill.style.transition = ""; });
      setTimeout(() => { isAnimating = false; }, 120);
    }, 320);
  }

  function resetTimer() {
    if (_heroTimer) clearInterval(_heroTimer);
    _heroTimer = setInterval(() => goTo((current + 1) % slides.length), 8000);
  }

  // ── Mouse parallax — BG + card 3D tilt ──
  if (!_heroParallaxBound) {
    _heroParallaxBound = true;
    document.addEventListener("mousemove", (e) => {
      if (window.innerWidth < 1024) return;
      const mx = (e.clientX / window.innerWidth  - 0.5) * 0.01 * window.innerWidth;
      const my = (e.clientY / window.innerHeight - 0.5) * 0.01 * window.innerHeight;
      const card = document.getElementById("hero-photo-card");
      const bg   = document.getElementById("hero-bg-stage");
      const img  = document.getElementById("hero-main-photo");
      if (card) card.style.transform = `rotateY(${mx * 0.01}deg) rotateX(${-my * 0.01}deg) translateZ(20px)`;
      if (bg)   bg.style.transform   = `translateX(${-mx * 2}px) translateY(${-my * 2}px)`;
      // Subtle image parallax (mousemove on image)
      if (img)  img.style.transform  = `scale(1.04) translateX(${mx * 0.008}px) translateY(${my * 0.008}px)`;
    });
  }

  // ── Scroll to change slide (wheel) — only when hero is fully in view ──
  heroSection.addEventListener("wheel", (e) => {
    // Only intercept if hero top is near viewport top (user is "on" the hero)
    const rect = heroSection.getBoundingClientRect();
    if (rect.top > 80 || rect.bottom < window.innerHeight * 0.5) return;
    if (isScrolling) return;
    if (Math.abs(e.deltaY) > 40) {
      isScrolling = true;
      goTo(e.deltaY > 0
        ? (current + 1) % slides.length
        : (current - 1 + slides.length) % slides.length);
      resetTimer();
      setTimeout(() => { isScrolling = false; }, 1000);
    }
  }, { passive: true });

  // ── Touch swipe ──
  let _touchStartX = 0, _touchStartY = 0;
  heroSection.addEventListener("touchstart", e => {
    _touchStartX = e.touches[0].clientX;
    _touchStartY = e.touches[0].clientY;
  }, { passive: true });
  heroSection.addEventListener("touchend", e => {
    if (isScrolling) return;
    const dx = e.changedTouches[0].clientX - _touchStartX;
    const dy = e.changedTouches[0].clientY - _touchStartY;
    // Horizontal swipe takes priority
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      isScrolling = true;
      goTo(dx < 0
        ? (current + 1) % slides.length
        : (current - 1 + slides.length) % slides.length);
      resetTimer();
      setTimeout(() => { isScrolling = false; }, 1000);
    }
  }, { passive: true });

  // ── Init ──
  renderSlide(0);
  resetTimer();
}

function renderElection(d) {
  const e = d.election;
  document.getElementById("election").innerHTML = `
    <div class="election-badge">${e.badge}</div>
    <h2>${e.heading}</h2>
    <p class="vote-line">${e.voteLine}</p>
    <div class="election-actions">
      <a class="btn-primary" href="${e.primaryBtn.href}">${e.primaryBtn.label}</a>
      <a class="btn-outline"  href="${e.outlineBtn.href}">${e.outlineBtn.label}</a>
    </div>`;
}

function renderProfileCard(d) {
  const p = d.profile;
  const rows = p.rows
    .map((r) => {
      const val = r.link
        ? `<a href="${r.link}" style="color:inherit;text-decoration:none;">${r.value}</a>`
        : r.value;
      return `
      <div class="profile-row">
        <div class="pr-icon">${r.icon}</div>
        <div>
          <div class="pr-label">${r.label}</div>
          <div class="pr-value">${val}</div>
        </div>
      </div>`;
    })
    .join("");

  document.getElementById("profile-card").innerHTML = `
    <div class="profile-card">
      <div class="profile-card-top">
        <div class="profile-avatar">
          <img src="Nidhi_Khandelwal_img.webp" alt="Advocate Nidhi Khandelwal" loading="lazy"/>
        </div>
        <div class="pname">${p.name}</div>
        <div class="ptitle">${p.title}</div>
      </div>
      <div class="profile-card-body">${rows}</div>
    </div>`;
}

function renderInfoGrid(d) {
  const cards = d.infoCards
    .map((c) => {
      const val = c.link
        ? `<a href="${c.link}" style="color:inherit;text-decoration:none;">${c.value}</a>`
        : c.value;
      return `
      <div class="info-card">
        <div class="ic-icon">${c.icon}</div>
        <div class="ic-label">${c.label}</div>
        <div class="ic-value">${val}<small>${c.sub}</small></div>
      </div>`;
    })
    .join("");
  document.getElementById("info-grid").innerHTML = cards;

  // Update section heading labels
  const overline = document.getElementById("details-overline");
  const heading = document.getElementById("details-heading");
  if (overline)
    overline.textContent =
      currentLang === "hi" ? "व्यावसायिक प्रोफ़ाइल" : "Professional Profile";
  if (heading)
    heading.textContent =
      currentLang === "hi" ? "योग्यता और जानकारी" : "Credentials & Information";
}

function renderContactGrid(d) {
  const cards = d.contactCards
    .map((c) => {
      const val = c.link ? `<a href="${c.link}">${c.value}</a>` : c.value;
      return `
      <div class="contact-card">
        <div class="cc-icon">${c.icon}</div>
        <div>
          <div class="cc-label">${c.label}</div>
          <div class="cc-value">${val}</div>
        </div>
      </div>`;
    })
    .join("");
  document.getElementById("contact-grid").innerHTML = cards;

  // Update section heading labels
  const overline = document.getElementById("contact-overline");
  const heading = document.getElementById("contact-heading");
  if (overline)
    overline.textContent =
      currentLang === "hi" ? "संपर्क करें" : "Get in Touch";
  if (heading)
    heading.textContent =
      currentLang === "hi" ? "संपर्क जानकारी" : "Contact Information";
}

function renderFooter(d) {
  const f = d.footer;
  const links = f.quickLinks
    .map((l) => `<li><a href="${l.href}">${l.label}</a></li>`)
    .join("");

  document.getElementById("footer").innerHTML = `
    <div class="footer-top">
      <!-- About -->
      <div class="footer-col footer-col-about">
        <div class="footer-brand">
          <div class="footer-seal">⚖️</div>
          <div>
            <div class="footer-brand-name">${f.about.name}</div>
            <div class="footer-brand-role">${f.about.role}</div>
          </div>
        </div>
        <p class="footer-tagline">${f.about.tagline}</p>
      </div>

      <!-- Quick Links -->
      <div class="footer-col">
        <div class="footer-col-title">${currentLang === "hi" ? "त्वरित लिंक" : "Quick Links"}</div>
        <ul class="footer-links">${links}</ul>
      </div>

      <!-- Contact -->
      <div class="footer-col">
        <div class="footer-col-title">${currentLang === "hi" ? "संपर्क जानकारी" : "Contact Info"}</div>
        <div class="footer-contact-list">
          <div class="footer-contact-item">
            <div class="footer-contact-icon">📞</div>
            <div class="footer-contact-text">
              <a href="${f.contact.phone.href}">${f.contact.phone.display}</a>
            </div>
          </div>
          <div class="footer-contact-item">
            <div class="footer-contact-icon">📍</div>
            <div class="footer-contact-text">
              ${f.contact.address}
              <br>
              <a class="footer-directions-link" href="${f.contact.mapsUrl}" target="_blank" rel="noopener noreferrer">
                ↗ ${currentLang === "hi" ? "दिशा-निर्देश पाएं" : "Get Directions"}
              </a>
            </div>
          </div>
        </div>
        <div class="footer-actions">
          <a class="footer-btn footer-btn-call" href="${f.contact.phone.href}">
            📞 ${currentLang === "hi" ? "अभी कॉल करें" : "Call Now"}
          </a>
          <a class="footer-btn footer-btn-wa" href="${f.whatsapp}" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            ${currentLang === "hi" ? "WhatsApp करें" : "WhatsApp Now"}
          </a>
        </div>
      </div>
    </div>

    <hr class="footer-mid-divider">


    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <span class="footer-copyright">${f.copyright}</span>
        <span class="footer-campaign-note">${f.campaignNote}</span>
      </div>
    </div>`;
}

/* ── Consultation Form ── */

function renderConsultation(d) {
  const c = d.consultation;
  const f = c.fields;

  // Header
  document.getElementById("consult-header").innerHTML = `
    <div class="consult-badge">🔒 ${c.badge}</div>
    <h2 class="consult-heading">${c.heading}</h2>
    <p class="consult-sub">${c.subtext}</p>`;

  // Form body
  document.getElementById("consult-body").innerHTML = `
    <form id="consult-form" class="consult-form" novalidate>
      <div class="cf-field">
        <label class="cf-label" for="cf-name">${f.fullName.label}</label>
        <div class="cf-input-wrap">
          <span class="cf-icon">👤</span>
          <input id="cf-name" type="text" class="cf-input" placeholder="${f.fullName.placeholder}" autocomplete="name"/>
        </div>
        <span class="cf-error" id="err-name"></span>
      </div>

      <div class="cf-row">
        <div class="cf-field">
          <label class="cf-label" for="cf-phone">${f.phone.label}</label>
          <div class="cf-input-wrap">
            <span class="cf-icon">📞</span>
            <input id="cf-phone" type="tel" class="cf-input cf-mono" value="${f.phone.prefix}" autocomplete="tel"/>
          </div>
          <span class="cf-error" id="err-phone"></span>
        </div>
        <div class="cf-field">
          <label class="cf-label" for="cf-email">${f.email.label}</label>
          <div class="cf-input-wrap">
            <span class="cf-icon">✉️</span>
            <input id="cf-email" type="email" class="cf-input" placeholder="${f.email.placeholder}" autocomplete="email"/>
          </div>
          <span class="cf-error" id="err-email"></span>
        </div>
      </div>

      <div class="cf-field">
        <label class="cf-label" for="cf-message">${f.message.label}</label>
        <div class="cf-input-wrap cf-textarea-wrap">
          <span class="cf-icon cf-icon-top">💬</span>
          <textarea id="cf-message" class="cf-input cf-textarea" rows="3" placeholder="${f.message.placeholder}"></textarea>
        </div>
        <span class="cf-error" id="err-message"></span>
      </div>

      <div class="cf-consent" id="cf-consent-wrap">
        <label class="cf-consent-label">
          <input type="checkbox" id="cf-consent" class="cf-checkbox"/>
          <span class="cf-consent-text">${c.consentText}</span>
        </label>
        <span class="cf-error" id="err-consent"></span>
      </div>

      <div class="cf-actions">
        <button type="submit" class="cf-submit" id="cf-submit">
          <span id="cf-submit-text">${c.submitLabel} &nbsp;➤</span>
          <span id="cf-spinner" class="cf-spinner hidden"></span>
        </button>
        <p class="cf-privacy">🔒 ${c.confidentialNote}</p>
      </div>

      <p class="cf-footer-note">🛡️ ${c.footerNote}</p>
    </form>

    <div id="consult-success" class="consult-success hidden">
      <div class="cs-icon">✅</div>
      <h3>${c.successHeading}</h3>
      <p>${c.successText}</p>
      <div class="cs-bar"><div class="cs-progress"></div></div>
    </div>`;

  initConsultForm(c);
}

function initConsultForm(c) {
  const form = document.getElementById("consult-form");
  const phoneInput = document.getElementById("cf-phone");
  const PREFIX = c.fields.phone.prefix;

  // Keep +91 prefix intact
  phoneInput.addEventListener("input", () => {
    if (!phoneInput.value.startsWith(PREFIX)) {
      phoneInput.value = PREFIX + phoneInput.value.replace(/^\+91\s*/, "");
    }
    if (phoneInput.value.length > 15) {
      phoneInput.value = phoneInput.value.slice(0, 15);
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitBtn = document.getElementById("cf-submit");
    const submitText = document.getElementById("cf-submit-text");
    const spinner = document.getElementById("cf-spinner");

    submitBtn.disabled = true;
    submitText.textContent = "Submitting...";
    spinner.classList.remove("hidden");

    const name = document.getElementById("cf-name").value.trim();
    const phone = phoneInput.value.trim();
    const email = document.getElementById("cf-email").value.trim();
    const message = document.getElementById("cf-message").value.trim();

    const waMsg = encodeURIComponent(
      `⚖️ *LEGAL CONSULTATION REQUEST*\n\n` +
        `👤 *Name:* ${name}\n` +
        `📞 *Phone:* ${phone}\n` +
        `📧 *Email:* ${email}\n\n` +
        `📝 *Case Details:*\n${message}\n\n` +
        `📍 *Source:* Website Inquiry\n` +
        `⏰ *Time:* ${new Date().toLocaleString()}`,
    );
    const waUrl = `https://wa.me/${c.whatsappNumber}?text=${waMsg}`;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitText.textContent = c.submitLabel + " ➤";
      spinner.classList.add("hidden");

      form.classList.add("hidden");
      const success = document.getElementById("consult-success");
      success.classList.remove("hidden");

      setTimeout(() => {
        window.open(waUrl, "_blank");
        setTimeout(() => {
          success.classList.add("hidden");
          form.classList.remove("hidden");
          form.reset();
          phoneInput.value = PREFIX;
        }, 2000);
      }, 1200);
    }, 900);
  });
}

function validate() {
  let ok = true;

  const name = document.getElementById("cf-name").value.trim();
  const phone = document.getElementById("cf-phone").value;
  const email = document.getElementById("cf-email").value.trim();
  const message = document.getElementById("cf-message").value.trim();
  const consent = document.getElementById("cf-consent").checked;

  setError("err-name", !name ? "Full name is required" : "");
  if (!name) ok = false;

  const digits = phone.replace(/\D/g, "");
  setError(
    "err-phone",
    digits.length < 12 ? "Enter a valid 10-digit mobile number" : "",
  );
  if (digits.length < 12) ok = false;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  setError("err-email", !emailOk ? "Enter a valid email address" : "");
  if (!emailOk) ok = false;

  setError(
    "err-message",
    message.length < 5 ? "Please describe your requirement" : "",
  );
  if (message.length < 5) ok = false;

  const consentWrap = document.getElementById("cf-consent-wrap");
  setError("err-consent", !consent ? "Please accept to continue" : "");
  consentWrap.classList.toggle("cf-consent--error", !consent);
  if (!consent) ok = false;

  return ok;
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  const field = el.closest(".cf-field") || el.closest(".cf-consent");
  if (field) field.classList.toggle("cf-field--error", !!msg);
}

/* ── Scroll & interaction effects ── */

function initEffects() {
  // Nav shadow on scroll + active link highlight
  const nav = document.querySelector("nav");
  const sections = ["hero-section", "election", "details", "consultation", "contact-grid"];

  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY > 10;
    nav.classList.toggle("nav-scrolled", scrolled);

    // Active nav link
    let current = "";
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    document.querySelectorAll(".nav-links a, .nav-mobile-drawer a").forEach(a => {
      const href = a.getAttribute("href")?.replace("#", "");
      a.classList.toggle("active", href === current);
    });
  }, { passive: true });

  // Scroll-reveal for cards
  const revealEls = document.querySelectorAll(
    ".info-card, .contact-card, .profile-card, .consult-card, .election, .section-label",
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    revealEls.forEach((el) => {
      el.classList.add("reveal-on-scroll");
      observer.observe(el);
    });
  } else {
    // Fallback: just show everything
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Scroll-to-top button
  const scrollTopBtn = document.getElementById("scroll-top");
  if (scrollTopBtn) {
    window.addEventListener(
      "scroll",
      () => {
        scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
      },
      { passive: true },
    );
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

/* ── Bootstrap: fetch data.json ── */
document.addEventListener("DOMContentLoaded", () => {
  fetch("data.json")
    .then((r) => r.json())
    .then((data) => {
      DATA_EN = data;
      const d = LANG_DATA();
      renderRibbon(d);
      renderNav(d);
      renderHero(d);
      renderElection(d);
      renderProfileCard(d);
      renderInfoGrid(d);
      renderConsultation(d);
      renderContactGrid(d);
      renderFooter(d);
      initEffects();
    })
    .catch((err) => {
      console.error("Failed to load data.json:", err);
      // Fallback: try loading data.js if available (file:// protocol)
      const s = document.createElement("script");
      s.src = "data.js";
      s.onload = () => {
        if (typeof DATA !== "undefined") {
          DATA_EN = DATA;
          const d = LANG_DATA();
          renderRibbon(d);
          renderNav(d);
          renderHero(d);
          renderElection(d);
          renderProfileCard(d);
          renderInfoGrid(d);
          renderConsultation(d);
          renderContactGrid(d);
          renderFooter(d);
          initEffects();
        }
      };
      document.body.appendChild(s);
    });
});
