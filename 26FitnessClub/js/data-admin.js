/**
 * 26fitnessClub - Data Administrator Logic
 */

let originalData = null; // Store full JSON to preserve non-editable parts (like gallery)

document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const btnLoad = document.getElementById('btn-load');
    const btnDownload = document.getElementById('btn-download');

    // 1. Initial Load
    loadData();

    // 2. Event Listeners
    btnLoad.addEventListener('click', loadData);
    btnDownload.addEventListener('click', downloadData);

    // Live Logo Preview
    ['theme-brandTextWhite', 'theme-brandTextLight', 'theme-brandTextAccent'].forEach(id => {
        const input = document.getElementById(id);
        const previewPart = id.replace('theme-', 'preview-logo-').replace('brandText', '').toLowerCase();
        input.addEventListener('input', () => {
            document.getElementById(`preview-logo-${input.id.split('brandText')[1].toLowerCase()}`).textContent = input.value;
        });
    });
});

async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Failed to fetch data.json');
        const data = await response.ok ? await response.json() : null;
        if (data) {
            originalData = data;
            populateForm(data);
        }
    } catch (err) {
        console.error('Error loading data:', err);
        alert('Could not load data.json. Please ensure it exists in the root folder.');
    }
}

function populateForm(data) {
    // Theme
    setVal('theme-brandTextWhite', data.theme.brandTextWhite);
    setVal('theme-brandTextLight', data.theme.brandTextLight);
    setVal('theme-brandTextAccent', data.theme.brandTextAccent);
    
    // Manual trigger for logo preview
    document.getElementById('preview-logo-white').textContent = data.theme.brandTextWhite;
    document.getElementById('preview-logo-light').textContent = data.theme.brandTextLight;
    document.getElementById('preview-logo-accent').textContent = data.theme.brandTextAccent;

    // Contact
    setVal('contact-phone', data.contact.phone);
    setVal('contact-whatsappNumber', data.contact.whatsappNumber);
    setVal('contact-address', data.contact.address);
    setVal('contact-mapLink', data.contact.mapLink);

    // Social
    const social = data.social || {};
    setVal('social-instagram', social.instagram || '');
    setVal('social-facebook', social.facebook || '');
    setVal('social-twitter', social.twitter || social.x || '');
    setVal('social-youtube', social.youtube || '');

    // Hero
    setVal('hero-titlePrefix', data.hero.titlePrefix);
    setVal('hero-titleAccent', data.hero.titleAccent);
    setVal('hero-subtitle', data.hero.subtitle);

    // Offers
    setVal('offers-badgeText', data.offers.badgeText);
    setVal('offers-title', data.offers.title);
    setVal('offers-titleAccent', data.offers.titleAccent);
    setVal('offers-titleSuffix', data.offers.titleSuffix);
    setVal('offers-discount', data.offers.discount);
    setVal('offers-discountAccent', data.offers.discountAccent);
    setVal('offers-description', data.offers.description);
    setVal('offers-whatsappMessage', data.offers.whatsappMessage);

    // About
    setVal('about-titlePrefix', data.about.titlePrefix);
    setVal('about-titleAccent', data.about.titleAccent);
    setVal('about-description', data.about.description);
    setVal('about-features', data.about.features.join('\n'));

    // Footer
    setVal('footer-description', data.footer.description);
    setVal('footer-copyright', data.footer.copyright);

    // Dynamic Lists
    renderList('container-programs', 'tmpl-program', data.programs, populateProgram);
    renderList('container-pricing', 'tmpl-pricing', data.pricing, populatePricing);
    renderList('container-trainers', 'tmpl-trainer', data.trainers, populateTrainer);
    renderList('container-testimonials', 'tmpl-testimonial', data.testimonials, populateTestimonial);
}

// Helpers for population
function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
}

function renderList(containerId, templateId, items, populateFn) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (items && Array.isArray(items)) {
        items.forEach(item => {
            const node = cloneTemplate(templateId);
            container.appendChild(node);
            populateFn(container.lastElementChild, item);
        });
    }
}

function cloneTemplate(id) {
    const tmpl = document.getElementById(id);
    return tmpl.content.cloneNode(true);
}

function populateProgram(el, data) {
    el.querySelector('.p-icon').value = data.icon;
    el.querySelector('.p-title').value = data.title;
    el.querySelector('.p-desc').value = data.description;
}

function populatePricing(el, data) {
    el.querySelector('.pr-title').value = data.title;
    el.querySelector('.pr-price').value = data.price;
    el.querySelector('.pr-period').value = data.period;
    el.querySelector('.pr-popular').checked = data.isPopular;
    
    // Convert features array to comma separated string (text only)
    const features = data.features.filter(f => f.included).map(f => f.name).join(', ');
    el.querySelector('.pr-features').value = features;
}

function populateTrainer(el, data) {
    el.querySelector('.t-name').value = data.name;
    el.querySelector('.t-role').value = data.role;
}

function populateTestimonial(el, data) {
    el.querySelector('.test-name').value = data.name;
    el.querySelector('.test-subtitle').value = data.subtitle;
    el.querySelector('.test-stars').value = data.stars;
    el.querySelector('.test-text').value = data.text;
}

// Handlers for adding items
function addProgram() { document.getElementById('container-programs').appendChild(cloneTemplate('tmpl-program')); }
function addPricing() { document.getElementById('container-pricing').appendChild(cloneTemplate('tmpl-pricing')); }
function addTrainer() { document.getElementById('container-trainers').appendChild(cloneTemplate('tmpl-trainer')); }
function addTestimonial() { document.getElementById('container-testimonials').appendChild(cloneTemplate('tmpl-testimonial')); }

function removeThis(btn) {
    btn.closest('.dynamic-item').remove();
}

/**
 * Data Collection & Download
 */
function downloadData() {
    if (!originalData) {
        alert('Please load the current data first.');
        return;
    }

    // Merge form values into a copy of original data
    const newData = JSON.parse(JSON.stringify(originalData));

    // Theme
    newData.theme.brandTextWhite = getVal('theme-brandTextWhite');
    newData.theme.brandTextLight = getVal('theme-brandTextLight');
    newData.theme.brandTextAccent = getVal('theme-brandTextAccent');

    // Contact
    newData.contact.phone = getVal('contact-phone');
    newData.contact.whatsappNumber = getVal('contact-whatsappNumber');
    newData.contact.address = getVal('contact-address');
    newData.contact.mapLink = getVal('contact-mapLink');

    // Social
    newData.social = newData.social || {};
    newData.social.instagram = getVal('social-instagram');
    newData.social.facebook = getVal('social-facebook');
    newData.social.twitter = getVal('social-twitter');
    newData.social.youtube = getVal('social-youtube');

    // Hero
    newData.hero.titlePrefix = getVal('hero-titlePrefix');
    newData.hero.titleAccent = getVal('hero-titleAccent');
    newData.hero.subtitle = getVal('hero-subtitle');

    // Offers
    newData.offers.badgeText = getVal('offers-badgeText');
    newData.offers.title = getVal('offers-title');
    newData.offers.titleAccent = getVal('offers-titleAccent');
    newData.offers.titleSuffix = getVal('offers-titleSuffix');
    newData.offers.discount = getVal('offers-discount');
    newData.offers.discountAccent = getVal('offers-discountAccent');
    newData.offers.description = getVal('offers-description');
    newData.offers.whatsappMessage = getVal('offers-whatsappMessage');

    // About
    newData.about.titlePrefix = getVal('about-titlePrefix');
    newData.about.titleAccent = getVal('about-titleAccent');
    newData.about.description = getVal('about-description');
    newData.about.features = getVal('about-features').split('\n').map(f => f.trim()).filter(f => f);

    // Programs
    newData.programs = Array.from(document.querySelectorAll('.program-item')).map(el => ({
        icon: el.querySelector('.p-icon').value,
        title: el.querySelector('.p-title').value,
        description: el.querySelector('.p-desc').value
    }));

    // Pricing
    newData.pricing = Array.from(document.querySelectorAll('.pricing-item')).map(el => {
        const featureNames = el.querySelector('.pr-features').value.split(',').map(f => f.trim()).filter(f => f);
        return {
            title: el.querySelector('.pr-title').value,
            price: el.querySelector('.pr-price').value,
            period: el.querySelector('.pr-period').value,
            isPopular: el.querySelector('.pr-popular').checked,
            features: featureNames.map(name => ({ name, included: true })) // Simpler UI assumption: all listed features are included
        };
    });

    // Trainers (Preserve images)
    newData.trainers = Array.from(document.querySelectorAll('.trainer-item')).map((el, i) => {
        const existing = originalData.trainers[i] || { image: 'images/trainer_1.jpeg', social: { instagram: '#', twitter: '#', linkedin: '#' } };
        return {
            ...existing,
            name: el.querySelector('.t-name').value,
            role: el.querySelector('.t-role').value
        };
    });

    // Testimonials (Preserve images)
    newData.testimonials = Array.from(document.querySelectorAll('.testimonial-item')).map((el, i) => {
        const existing = originalData.testimonials[i] || { image: 'images/testimonial_1.svg' };
        return {
            ...existing,
            stars: parseFloat(el.querySelector('.test-stars').value),
            text: el.querySelector('.test-text').value,
            name: el.querySelector('.test-name').value,
            subtitle: el.querySelector('.test-subtitle').value
        };
    });

    // Footer
    newData.footer.description = getVal('footer-description');
    newData.footer.copyright = getVal('footer-copyright');

    // 4. Generate Download
    const jsonString = JSON.stringify(newData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('Success! Your new data.json has been generated. Please replace the existing file in your root folder.');
}

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}
