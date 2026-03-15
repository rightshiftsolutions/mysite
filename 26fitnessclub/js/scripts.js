/*!
* Start Bootstrap - 26fitnessClub Scripts
*/
//
// Scripts
// 

function renderData(data) {
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    const setHtml = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const setSrc = (id, src) => { const el = document.getElementById(id); if (el) el.src = src; };
    const setHref = (id, href) => { const el = document.getElementById(id); if (el) el.href = href; };

    // Navbar
    setText('nav-brand-white', data.theme.brandTextWhite);
    setText('nav-brand-light', data.theme.brandTextLight);
    setText('nav-brand-accent', data.theme.brandTextAccent);
    
    // Hero
    setText('hero-title-prefix', data.hero.titlePrefix);
    setText('hero-title-accent', data.hero.titleAccent);
    setText('hero-subtitle', data.hero.subtitle);

    // Offers
    setText('offers-badge', data.offers.badgeText);
    setText('offers-title', data.offers.title);
    setText('offers-title-accent', data.offers.titleAccent);
    setText('offers-title-suffix', data.offers.titleSuffix);
    setText('offers-discount', data.offers.discount);
    setText('offers-discount-accent', data.offers.discountAccent);
    setText('offers-description', data.offers.description);
    setHref('offers-whatsapp-btn', `https://wa.me/${data.contact.whatsappNumber}?text=${encodeURIComponent(data.offers.whatsappMessage)}`);
    
    // About
    setSrc('about-image', data.about.image);
    setText('about-title-prefix', data.about.titlePrefix);
    setText('about-title-accent', data.about.titleAccent);
    setText('about-description', data.about.description);
    if(data.about.features) {
        setHtml('about-features', data.about.features.map(f => `<li class="mb-3"><i class="fas fa-check-circle text-accent me-3"></i> ${f}</li>`).join(''));
    }

    // Programs
    if(data.programs) {
        setHtml('programs-container', data.programs.map((p, i) => `
            <div class="col-md-4 col-sm-6" data-aos="fade-up" data-aos-delay="${(i+1)*100}">
                <div class="premium-card text-center">
                    <div class="icon-wrapper mb-4">
                        <i class="${p.icon} fa-3x text-accent"></i>
                    </div>
                    <h4>${p.title}</h4>
                    <p class="text-secondary">${p.description}</p>
                </div>
            </div>
        `).join(''));
    }

    // Trainers
    if(data.trainers) {
        setHtml('trainers-container', data.trainers.map((t, i) => `
            <div class="col-md-4" data-aos="fade-up" data-aos-delay="${(i+1)*100}">
                <div class="trainer-card text-center h-100">
                    <div class="trainer-img-wrapper hover-shine">
                        <img src="${t.image}" alt="${t.name}" class="trainer-img">
                        <div class="trainer-social">
                            <a href="${t.social.instagram}"><i class="fab fa-instagram"></i></a>
                            <a href="${t.social.twitter}"><i class="fab fa-twitter"></i></a>
                            <a href="${t.social.linkedin}"><i class="fab fa-linkedin"></i></a>
                        </div>
                    </div>
                    <div class="p-4">
                        <h4 class="mb-1">${t.name}</h4>
                        <p class="text-accent mb-0">${t.role}</p>
                    </div>
                </div>
            </div>
        `).join(''));
    }

    // Pricing
    if(data.pricing) {
        setHtml('pricing-container', data.pricing.map((p, i) => `
            <div class="col-lg-4" data-aos="fade-up" data-aos-delay="${(i+1)*100}">
                <div class="premium-card pricing-card text-center ${p.isPopular ? 'popular position-relative' : ''}">
                    ${p.isPopular ? '<div class="position-absolute top-0 end-0 bg-accent text-dark px-3 py-1 fw-bold rounded-start mt-3" style="background-color: var(--accent-color);">POPULAR</div>' : ''}
                    <h4 class="text-uppercase mb-4 ${p.isPopular ? 'mt-3' : ''}">${p.title}</h4>
                    <div class="mb-4">
                        <span class="price-tag">${p.price}</span><span class="price-period">${p.period}</span>
                    </div>
                    <ul class="list-unstyled feature-list text-start mb-5">
                        ${p.features.map(f => `<li><i class="fas ${f.included ? 'fa-check text-accent' : 'fa-times text-secondary'} me-2"></i> ${f.name}</li>`).join('')}
                    </ul>
                    <a href="#" class="btn ${p.isPopular ? 'btn-accent' : 'btn-outline-accent'} w-100">Select Plan</a>
                </div>
            </div>
        `).join(''));
    }

    // Gallery
    if(data.gallery) {
        setHtml('gallery-container', data.gallery.map((g, i) => `
            <div class="col-lg-4 col-sm-6" data-aos="fade-in" data-aos-delay="${g.delay || ((i+1)*100)}">
                <a href="${g.imageLarge}" data-lightbox="gym-gallery" data-title="${g.title}" class="gallery-item hover-shine">
                    <img src="${g.imageThumb}" alt="${g.title}">
                    <div class="gallery-overlay">
                        <i class="fas fa-search-plus"></i>
                    </div>
                </a>
            </div>
        `).join(''));
    }

    // Video Gallery
    if(data.videoGallery) {
        setHtml('video-gallery-container', data.videoGallery.map(v => `
            <div class="swiper-slide">
                <div class="premium-card p-0 overflow-hidden d-flex flex-column h-100" style="border-radius: 12px;">
                    <div class="ratio ratio-16x9">
                        <iframe src="${v.videoSrc}" title="${v.title}" allowfullscreen style="border: 0;"></iframe>
                    </div>
                    <div class="p-4 bg-surface flex-grow-1">
                        <h4 class="text-white mb-2">${v.title}</h4>
                        <p class="text-secondary mb-0">${v.description}</p>
                    </div>
                </div>
            </div>
        `).join(''));
    }

    // Testimonials
    if(data.testimonials) {
        setHtml('testimonials-container', data.testimonials.map(t => {
            const fullStars = Math.floor(t.stars);
            const halfStar = t.stars % 1 !== 0;
            let starsHtml = '';
            for(let j=0; j<fullStars; j++) starsHtml += '<li class="list-inline-item m-0"><i class="fas fa-star"></i></li>';
            if(halfStar) starsHtml += '<li class="list-inline-item m-0"><i class="fas fa-star-half-alt"></i></li>';
            
            return `
            <div class="swiper-slide">
                <div class="testimonial-card premium-card d-flex flex-column h-100">
                    <ul class="list-inline text-warning mb-3">${starsHtml}</ul>
                    <p class="fs-5 fst-italic mb-4 flex-grow-1">${t.text}</p>
                    <div class="d-flex align-items-center mt-auto">
                        <img src="${t.image}" alt="${t.name}" class="rounded-circle me-3" style="width: 60px; height: 60px; object-fit: cover; border: 2px solid var(--accent-color);">
                        <div>
                            <h5 class="mb-0">${t.name}</h5>
                            <span class="text-secondary small">${t.subtitle}</span>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join(''));
    }

    // Contact
    setText('contact-address', data.contact.address);
    setHref('contact-map-link', data.contact.mapLink);
    setText('contact-phone', data.contact.phone);
    setHref('contact-whatsapp-btn', `https://wa.me/${data.contact.whatsappNumber}`);
    
    // Footer
    setText('footer-brand-white', data.theme.brandTextWhite);
    setText('footer-brand-light', data.theme.brandTextLight);
    setText('footer-brand-accent', data.theme.brandTextAccent);
    setText('footer-description', data.footer.description);
    setHref('footer-social-twitter', data.social.twitter);
    setHref('footer-social-facebook', data.social.facebook);
    setHref('footer-social-instagram', data.social.instagram);
    
    if(data.footer.links) {
        setHtml('footer-links', data.footer.links.map(l => `<a class="link-secondary text-decoration-none me-3" href="${l.url}">${l.text}</a>`).join(''));
    }
    setText('footer-copyright', data.footer.copyright);
}

function initPlugins() {
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false,
            offset: 50
        });
    }

    // Initialize Lightbox
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
            'resizeDuration': 200,
            'wrapAround': true,
            'disableScrolling': true
        });
    }

    // Initialize Swiper for Testimonials
    if (typeof Swiper !== 'undefined') {
        new Swiper(".testimonialSwiper", {
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            grabCursor: true,
            spaceBetween: 30,
            breakpoints: {
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
        });

        // Initialize Swiper for Video Gallery
        new Swiper(".videoSwiper", {
            loop: true,
            pagination: {
                el: ".video-pagination",
                clickable: true,
            },
            grabCursor: true,
            spaceBetween: 30,
            breakpoints: {
                640: { slidesPerView: 1 },
                992: { slidesPerView: 2 },
            },
            navigation: {
                nextEl: ".video-next",
                prevEl: ".video-prev",
            },
        });
    }
}

window.addEventListener('DOMContentLoaded', async event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) return;
        if (window.scrollY === 0) navbarCollapsible.classList.remove('navbar-scrolled');
        else navbarCollapsible.classList.add('navbar-scrolled');
    };
    navbarShrink();
    document.addEventListener('scroll', navbarShrink);

    // ScrollSpy
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    }

    // Collapse responsive navbar
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Load Data
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        renderData(data);
    } catch (e) {
        console.warn('Error loading data.json:', e);
        // If data fetching fails (likely CORS from file://), we could show an alert or let it try to init plugins on whatever DOM exists
        alert('Notice: Cannot load data.json. Ensure you open this site from a web server (like VS Code Live Server) to see dynamic content.');
    } finally {
        // Init plugins regardless, in case some content was statically left behind
        initPlugins();
    }
});
