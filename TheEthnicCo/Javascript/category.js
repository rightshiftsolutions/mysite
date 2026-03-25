// Shared functions across all pages
const products = [
    { id: 1, name: 'White Silk Sherwani', price: '₹45,000', category: 'Sherwanis', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/baby_blue_silk_sherwani_set_in_zar/elegant_pristine_white_silk_sherwani_set_with_intricate_embroidery_work_-sg217040_4.jpg' },
    { id: 2, name: 'Navy Blue Sherwani', price: '₹48,500', category: 'Sherwanis', tag: 'Trending', rating: 0, img: 'assests/img/project_image\'s/baby_blue_silk_sherwani_set_in_zar/navy_blue_embroidered_sherwani_kurta_set-sg264151_5.jpg' },
    { id: 3, name: 'Beige Silk Sherwani', price: '₹42,000', category: 'Sherwanis', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/baby_blue_silk_sherwani_set_in_zar/black_hand_work_sherwani_suit_with_dupatta-sg252352_5.jpg' },
    { id: 4, name: 'Black Velvet Sherwani', price: '₹52,000', category: 'Sherwanis', tag: 'Sale', rating: 0, img: 'assests/img/project_image\'s/baby_blue_silk_sherwani_set_in_zar/black_velvet_sherwani_and_kurta_set_with_kashmiri_work-sg264199_2.jpg' },
    { id: 5, name: 'Green Embroidered Kurta', price: '₹6,400', category: 'Kurtas', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/embroidered_jacket_kurta_set/green_embroidered_jacket_kurta_set_in_linen_satin-sg278256_3 - Copy.jpg' },
    { id: 6, name: 'Navy Blue Kurta Jacket', price: '₹7,800', category: 'Kurtas', tag: 'Trending', rating: 0, img: 'assests/img/project_image\'s/embroidered_jacket_kurta_set/navy_blue_linen_zardosi_embroidered_jacket_kurta_set-sg272976_2 - Copy.jpg' },
    { id: 7, name: 'Pink Embroidered Kurta', price: '₹6,200', category: 'Kurtas', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/embroidered_jacket_kurta_set/pink_hand_embroidered_jacket_and_kurta_set_in_linen-sg273040_2.jpg' },
    { id: 8, name: 'Off White Kurta Jacket', price: '₹7,200', category: 'Kurtas', tag: 'Sale', rating: 0, img: 'assests/img/project_image\'s/embroidered_jacket_kurta_set/off_white_floral_hand_embroidered_kurta_jacket_set-sg273072_8.jpg' },
    { id: 9, name: 'Peach Silk Indo Western', price: '₹18,500', category: 'Indo Western', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/indori_western/peach_silk_indowestern_set_with_hand_work_for_men-sg252327_2_7aad6fcb-676a-4760-8cf0-3c40bacaf825.jpg' },
    { id: 10, name: 'Navy Blue Indo Western', price: '₹20,000', category: 'Indo Western', tag: 'Trending', rating: 0, img: 'assests/img/project_image\'s/indori_western/navy_blue_indowestern-sg171432_1.jpg' },
    { id: 11, name: 'Elegant Blue Indo Western', price: '₹22,000', category: 'Indo Western', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/indori_western/elegant_blue_groom_s_indowestern-sg204282_3.jpg' },
    { id: 12, name: 'Purple Indo Western', price: '₹19,500', category: 'Indo Western', tag: 'Sale', rating: 0, img: 'assests/img/project_image\'s/indori_western/stylish_purple_indowestern_for_men-sg195788_2.jpg' },
    { id: 13, name: 'Off White Jodhpuri', price: '₹24,000', category: 'Jodhpuri', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/jodhpuri_set/off_white_silk_blend_jodhpuri_set_with_textured_detail-sg258810_1.jpg' },
    { id: 14, name: 'Embroidered Jodhpuri', price: '₹26,000', category: 'Jodhpuri', tag: 'Trending', rating: 0, img: 'assests/img/project_image\'s/jodhpuri_set/off-white-embroidered-jodhpuri-and-pant-set-sg369524-2_7f4954b9-8ee7-414a-ad3d-0f927e3ec38a.jpg' },
    { id: 15, name: 'Pink Jodhpuri Set', price: '₹25,500', category: 'Jodhpuri', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/jodhpuri_set/pink-button-front-jodhpuri-and-pant-set-sg369532-1_ee584e81-6ebe-4446-94f2-b73c42b4bd43.jpg' },
    { id: 16, name: 'Green Kurta Jacket Set', price: '₹8,200', category: 'Kurta Jacket', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/kurta-jacket/green_embroidered_jacket_kurta_set_in_linen_satin-sg278256_1.jpg' },
    { id: 17, name: 'Purple Resham Kurta Jacket', price: '₹9,500', category: 'Kurta Jacket', tag: 'Trending', rating: 0, img: 'assests/img/project_image\'s/kurta-jacket/purple_resham_work_kurta_jacket_set-sg278264_1 (1).jpg' },
    { id: 18, name: 'Navy Blue Sherwani Set', price: '₹28,000', category: 'Kurta Jacket', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/kurta-jacket/navy_blue_sherwani_set_in_silk-sg258794_2.jpg' },
];


let shoppingBag = [];
let promoCode = null;

// Expose to window so whatsapp-checkout.js can read them
Object.defineProperty(window, 'shoppingBag', {
    get() { return shoppingBag; },
    set(v) { shoppingBag = v; },
    configurable: true
});
Object.defineProperty(window, 'promoCode', {
    get() { return promoCode; },
    set(v) { promoCode = v; },
    configurable: true
});
const DELIVERY_THRESHOLD = 2000;
const DELIVERY_CHARGE = 0;

// Load bag from localStorage on page load
function loadBagFromStorage() {
    const saved = localStorage.getItem('shoppingBag');
    if (saved) {
        shoppingBag = JSON.parse(saved);
        updateBagCount();
    }
}


// Save bag to localStorage
function saveBagToStorage() {
    localStorage.setItem('shoppingBag', JSON.stringify(shoppingBag));
}

// Calculate delivery date (5-7 business days)
function getDeliveryDate() {
    const today = new Date();
    const deliveryDays = 7;
    const deliveryDate = new Date(today.setDate(today.getDate() + deliveryDays));
    return deliveryDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Apply promo code
function applyPromo() {
    const promoInput = document.getElementById('promo-code');
    const code = promoInput.value.trim().toUpperCase();
    
    const promoCodes = {
        'ETHNIC10': 10,
        'WELCOME15': 15,
        'FESTIVE20': 20
    };
    
    if (promoCodes[code]) {
        promoCode = { code, discount: promoCodes[code] };
        promoInput.style.borderColor = '#27ae60';
        updateCartDisplay();
        setTimeout(() => {
            promoInput.value = '';
            promoInput.style.borderColor = '';
        }, 1000);
    } else {
        promoInput.style.borderColor = '#e74c3c';
        setTimeout(() => {
            promoInput.style.borderColor = '';
        }, 1000);
    }
}

// Add to Shopping Bag
function addToCart(e, productId) {
    e.stopPropagation();
    
    const product = products.find(p => p.id === productId) || 
                   mostLovedProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = shoppingBag.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        shoppingBag.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price.replace(/[^0-9]/g, '')),
            category: product.category,
            img: product.img,
            quantity: 1
        });
    }
    
    saveBagToStorage();
    updateBagCount();
    updateCartDisplay();
    
    // Visual feedback
    const btn = e.target.closest('.quick-add');
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        btn.style.background = '#C5A059';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1000);
    }
}

// Update bag count
function updateBagCount() {
    const count = shoppingBag.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
    const headerCount = document.getElementById('cart-count-header');
    if (headerCount) headerCount.textContent = count;
}

// Increase quantity
function increaseQuantity(productId) {
    const item = shoppingBag.find(i => i.id === productId);
    if (item) {
        item.quantity++;
        saveBagToStorage();
        updateBagCount();
        updateCartDisplay();
    }
}

// Decrease quantity
function decreaseQuantity(productId) {
    const item = shoppingBag.find(i => i.id === productId);
    if (item && item.quantity > 1) {
        item.quantity--;
        saveBagToStorage();
        updateBagCount();
        updateCartDisplay();
    }
}

// Remove from bag
function removeFromBag(productId) {
    shoppingBag = shoppingBag.filter(item => item.id !== productId);
    saveBagToStorage();
    updateBagCount();
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const bagContainer = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');
    
    if (shoppingBag.length === 0) {
        bagContainer.innerHTML = `
            <div class="empty-bag">
                <div class="empty-bag-icon">🛍️</div>
                <p>Your shopping bag is empty</p>
                <button class="continue-shopping-btn" onclick="toggleCart()">Continue Shopping</button>
            </div>
        `;
        cartFooter.style.display = 'none';
        return;
    }
    
    cartFooter.style.display = 'block';
    bagContainer.innerHTML = '';
    
    let subtotal = 0;
    
    shoppingBag.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const bagItem = document.createElement('div');
        bagItem.className = 'bag-item';
        bagItem.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="bag-item-img">
            <div class="bag-item-details">
                <div class="bag-item-name">${item.name}</div>
                <div class="bag-item-category">${item.category}</div>
                <div class="bag-item-price">₹${item.price.toLocaleString()}</div>
                <div class="bag-item-actions">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="decreaseQuantity(${item.id})" ${item.quantity === 1 ? 'disabled' : ''}>-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="increaseQuantity(${item.id})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromBag(${item.id})" title="Remove">🗑️</button>
                </div>
            </div>
        `;
        bagContainer.appendChild(bagItem);
    });
    
    // Calculate discount
    let discount = 5000;
    if (promoCode) {
        discount = (subtotal * promoCode.discount) / 100;
    }
    
    // Calculate delivery
    const delivery = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    
    // Calculate total
    const total = subtotal - discount + delivery;
    
    // Update all price displays
    document.getElementById('cart-subtotal').textContent = `₹${Math.round(subtotal).toLocaleString()}`;
    
    const discountRow = document.getElementById('discount-row');
    if (discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('cart-discount').textContent = `-₹${Math.round(discount).toLocaleString()}`;
    } else {
        discountRow.style.display = 'none';
    }
    
    document.getElementById('cart-delivery').textContent = delivery === 0 ? 'FREE' : `₹${delivery}`;
    document.getElementById('cart-total').textContent = `₹${Math.round(total).toLocaleString()}`;
    document.getElementById('delivery-date').textContent = getDeliveryDate();
}

// Render shopping bag (legacy support)
function renderBag() {
    updateCartDisplay();
}

// Toggle Shopping Bag
// ── Scroll lock helpers ──────────────────────────────────────
function lockScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  document.body.dataset.scrollY = scrollY;
}

function unlockScroll() {
  const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, scrollY);
}
// ─────────────────────────────────────────────────────────────

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');

    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');

    if (sidebar.classList.contains('active')) {
        lockScroll();
        updateCartDisplay();
    } else {
        unlockScroll();
    }
}

function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('nav-overlay');

    navMenu.classList.toggle('active');
    hamburger.classList.toggle('open');
    document.body.classList.toggle('menu-open');
    if (overlay) overlay.classList.toggle('active');

    if (document.body.classList.contains('menu-open')) {
        lockScroll();
    } else {
        unlockScroll();
    }
}

function initDropdowns() {
    const dropdownParents = document.querySelectorAll('.dropdown-parent');
    
    dropdownParents.forEach(parent => {
        const trigger = parent.querySelector('.dropdown-trigger');
        const menu = parent.querySelector('.dropdown-menu');
        
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                if (window.innerWidth < 1024) {
                    e.preventDefault();
                    e.stopPropagation();
                    parent.classList.toggle('active');
                    
                    dropdownParents.forEach(other => {
                        if (other !== parent) {
                            other.classList.remove('active');
                        }
                    });
                }
            });
        }
        
        if (menu) {
            menu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    });
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 1024 && !e.target.closest('.dropdown-parent')) {
            dropdownParents.forEach(parent => {
                parent.classList.remove('active');
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', initDropdowns);

function toggleSearch() {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  if (!searchInput) return;

  searchInput.classList.toggle("active");

  if (searchInput.classList.contains("active")) {
    setTimeout(() => searchInput.focus(), 100);
  } else {
    searchInput.value = "";
    if (searchResults) searchResults.classList.remove("active");
  }
}

// Search is handled by Javascript/search.js
function generateStarRating(rating, reviewCount) {
    const clamped = Math.min(5, Math.max(0, parseFloat(rating) || 0));
    const fullStars = Math.floor(clamped);
    const hasHalf = (clamped - fullStars) >= 0.25 && (clamped - fullStars) < 0.75;
    const roundedUp = (clamped - fullStars) >= 0.75;
    const totalFull = fullStars + (roundedUp ? 1 : 0);
    const emptyStars = 5 - totalFull - (hasHalf ? 1 : 0);

    let html = '<div class="product-rating-wrapper">';
    html += '<div class="product-stars">';
    for (let i = 0; i < totalFull; i++)  html += '<span class="star filled">★</span>';
    if (hasHalf)                          html += '<span class="star half">★</span>';
    for (let i = 0; i < emptyStars; i++) html += '<span class="star">★</span>';
    html += '</div>';
    html += `<span class="product-rating-count">(${reviewCount || 0})</span>`;
    html += '</div>';
    return html;
}

function rateProduct(productId, rating) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.rating = rating;
        updateStarDisplay(productId, rating);
    }
}

function updateStarDisplay(productId, rating) {
    const ratingContainer = document.querySelector(`[data-product-id="${productId}"]`);
    if (!ratingContainer) return;
    const stars = ratingContainer.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList.remove('active');
        if (index < rating) {
            star.classList.add('active');
        }
    });
}

function getCategoryFromURL() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1).replace('.html', '').toLowerCase();
    
    const categoryMap = {
        'sherwani': 'Sherwanis',
        'kurta': 'Kurtas',
        'indo-western': 'Indo Western',
        'jodhpuri': 'Jodhpuri',
        'kurta-jacket': 'Kurta Jacket'
    };
    
    return categoryMap[page] || null;
}

function getPageType() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1).replace('.html', '').toLowerCase();
    
    if (page === 'sale') return 'Sale';
    if (page === 'new_arrival') return 'New';
    if (page === 'occasion') return 'Occasion';
    if (page === 'accessories') return 'Accessories';
    
    return null;
}

function renderCategoryProducts() {
    const category = getCategoryFromURL();
    const pageType = getPageType();
    let filtered = [];
    
    if (category) {
        filtered = products.filter(p => p.category === category);
    } else if (pageType === 'Sale') {
        filtered = products.filter(p => p.tag === 'Sale');
    } else if (pageType === 'New') {
        filtered = products.filter(p => p.tag === 'New');
    } 
    else {
        return;
    }
    
    currentProducts = filtered;
    const list = document.getElementById('product-list');
    const countEl = document.getElementById('product-count');
    
    if (countEl) countEl.textContent = `${filtered.length} Products`;
    
    if (!list) return;
    
    if (filtered.length === 0) {
        list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 5rem; color: #888;">No products found.</div>';
        return;
    }
    
    list.innerHTML = '';

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';
        
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'product-img-wrapper';
        
        const img = document.createElement('img');
        img.src = product.img;
        img.alt = product.name;
        img.className = 'product-img';
        imgWrapper.appendChild(img);
        
        if (product.tag) {
            const tag = document.createElement('span');
            tag.className = 'product-tag';
            tag.textContent = product.tag;
            imgWrapper.appendChild(tag);
        }
        
        const quickAdd = document.createElement('div');
        quickAdd.className = 'quick-add';
        quickAdd.textContent = 'Add to Bag';
        quickAdd.onclick = function(e) {
            e.stopPropagation();
            addToCart(e, product.id);
        };
        imgWrapper.appendChild(quickAdd);
        
        const rating = product.rating || (3.2 + ((product.id * 37 + 11) % 18) / 10);
        const reviewCount = product.reviewCount || Math.floor(40 + ((product.id * 53 + 7) % 460));

        const productInfo = document.createElement('div');
        productInfo.className = 'product-info';
        productInfo.innerHTML = `
            <div class="product-details">
                <h4 class="product-name">${product.name}</h4>
                <p class="product-cat">${product.category}</p>
                ${generateStarRating(rating, reviewCount)}
                <p class="product-price">${product.price}</p>
            </div>
        `;
        
        card.appendChild(imgWrapper);
        card.appendChild(productInfo);
        
        card.onclick = function(e) {
            if (!e.target.classList.contains('quick-add')) {
                window.location.href = 'product-detail.html?id=' + product.id;
            }
        };
        
        list.appendChild(card);
    });
}

let currentFilter = 'all';
let currentProducts = [];

function filterByTag(tag) {
    currentFilter = tag;
    const category = getCategoryFromURL();
    if (!category) return;
    
    let filtered = products.filter(p => p.category === category);
    
    if (tag !== 'all') {
        filtered = filtered.filter(p => p.tag === tag);
    }
    
    currentProducts = filtered;
    renderFilteredProducts(filtered);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function sortProducts(sortBy) {
    let sorted = [...currentProducts];
    
    if (sortBy === 'price-low') {
        sorted.sort((a, b) => parseFloat(a.price.replace(/[^0-9]/g, '')) - parseFloat(b.price.replace(/[^0-9]/g, '')));
    } else if (sortBy === 'price-high') {
        sorted.sort((a, b) => parseFloat(b.price.replace(/[^0-9]/g, '')) - parseFloat(a.price.replace(/[^0-9]/g, '')));
    } else if (sortBy === 'name') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    renderFilteredProducts(sorted);
}

function renderFilteredProducts(filtered) {
    const list = document.getElementById('product-list');
    const countEl = document.getElementById('product-count');
    
    if (countEl) countEl.textContent = `${filtered.length} Products`;
    
    list.innerHTML = '';
    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';
        
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'product-img-wrapper';
        
        const img = document.createElement('img');
        img.src = product.img;
        img.alt = product.name;
        img.className = 'product-img';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.objectFit = 'cover';
        imgWrapper.appendChild(img);
        
        if (product.tag) {
            const tag = document.createElement('span');
            tag.className = 'product-tag';
            tag.textContent = product.tag;
            imgWrapper.appendChild(tag);
        }
        
        const quickAdd = document.createElement('div');
        quickAdd.className = 'quick-add';
        quickAdd.textContent = 'Add to Bag';
        quickAdd.onclick = function(e) {
            e.stopPropagation();
            addToCart(e, product.id);
        };
        imgWrapper.appendChild(quickAdd);
        
        const rating = product.rating || (3.2 + ((product.id * 37 + 11) % 18) / 10);
        const reviewCount = product.reviewCount || Math.floor(40 + ((product.id * 53 + 7) % 460));

        const productInfo = document.createElement('div');
        productInfo.className = 'product-info';
        productInfo.innerHTML = `
            <div class="product-details">
                <h4 class="product-name">${product.name}</h4>
                <p class="product-cat">${product.category}</p>
                ${generateStarRating(rating, reviewCount)}
                <p class="product-price">${product.price}</p>
            </div>
        `;
        
        card.appendChild(imgWrapper);
        card.appendChild(productInfo);
        
        card.onclick = function(e) {
            if (!e.target.classList.contains('quick-add')) {
                window.location.href = 'product-detail.html?id=' + product.id;
            }
        };
        
        list.appendChild(card);
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    loadBagFromStorage();
    renderCategoryProducts();
});

 const dot = document.getElementById('cursor-dot');
        const outline = document.getElementById('cursor-outline');
        const interactiveElements = document.querySelectorAll('.interactive');

        let mouseX = 0;
        let mouseY = 0;
        let outlineX = 0;
        let outlineY = 0;

        // Speed of following (0.1 to 0.2 is usually best for "professional" feel)
        const lerpFactor = 0.15;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Small dot follows mouse exactly
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
            
            // Initial positioning to prevent jump
            if (outlineX === 0) {
                outlineX = mouseX;
                outlineY = mouseY;
            }
        });

        function animateCursor() {
            // Smoothly interpolate the outline position
            // Distance = Target - Current
            // Move Current by a percentage of Distance
            outlineX += (mouseX - outlineX) * lerpFactor;
            outlineY += (mouseY - outlineY) * lerpFactor;

            // Offset by half width/height to center it (outline is 40x40)
            outline.style.left = `${outlineX - 20}px`;
            outline.style.top = `${outlineY - 20}px`;

            requestAnimationFrame(animateCursor);
        }

        // Start animation loop
        animateCursor();

        // Handle Hover States
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });

        // Change cursor color on dark backgrounds
        let currentColor = '#511D00';
        
        document.addEventListener('mousemove', (e) => {
            const element = e.target;
            const header = document.querySelector('header');
            const isHeaderScrolled = header && header.classList.contains('scrolled');
            
            let newColor = '#511D00';
            
            // Check if cursor is over specific elements that need gold color
            if (element.closest('footer') || 
                (element.closest('header') && !isHeaderScrolled) || 
                element.closest('.product-tag')) {
                newColor = '#C5A059';
            }
            
            // Only update if color changed
            if (newColor !== currentColor) {
                currentColor = newColor;
                dot.style.backgroundColor = newColor;
                outline.style.borderColor = newColor;
            }
        });

        // Change cursor color for icon buttons specifically
        const iconButtons = document.querySelectorAll('.icon-btn');
        iconButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                dot.style.backgroundColor = '#511D00';
                outline.style.borderColor = '#511D00';
                currentColor = '#511D00';
            });
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            dot.style.opacity = '0';
            outline.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            dot.style.opacity = '1';
            outline.style.opacity = '1';
        });

        // Handle click effect
        window.addEventListener('mousedown', () => {
            outline.style.transform = 'scale(0.8)';
        });
        window.addEventListener('mouseup', () => {
            outline.style.transform = 'scale(1)';
        });

        // header animation scroll start
window.addEventListener("scroll", function () {
    const header = document.querySelector("header");

    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});


 // Use products from category.js if available, otherwise use local data
        const productsData = typeof products !== 'undefined' ? products : [
            { id: 1, name: 'White Silk Sherwani', price: '₹45,000', category: 'Sherwanis', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/baby_blue_silk_sherwani_set_in_zar/elegant_pristine_white_silk_sherwani_set_with_intricate_embroidery_work_-sg217040_4.jpg' },
            { id: 2, name: 'Navy Blue Sherwani', price: '₹48,500', category: 'Sherwanis', tag: 'Trending', rating: 0, img: 'assests/img/project_image\'s/navy_blue_embroidered_sherwani_kurta_set-sg264151_5.jpg' },
            { id: 3, name: 'Beige Silk Sherwani', price: '₹42,000', category: 'Sherwanis', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/baby_blue_silk_sherwani_set_in_zar/black_hand_work_sherwani_suit_with_dupatta-sg252352_5.jpg' },
            { id: 4, name: 'Black Velvet Sherwani', price: '₹52,000', category: 'Sherwanis', tag: 'Sale', rating: 0, img: 'assests/img/project_image\'s/baby_blue_silk_sherwani_set_in_zar/black_velvet_sherwani_and_kurta_set_with_kashmiri_work-sg264199_2.jpg' },
            { id: 5, name: 'Green Embroidered Kurta', price: '₹6,400', category: 'Kurtas', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/embroidered_jacket_kurta_set/green_embroidered_jacket_kurta_set_in_linen_satin-sg278256_3 - Copy.jpg' },
            { id: 6, name: 'Navy Blue Kurta Jacket', price: '₹7,800', category: 'Kurtas', tag: 'Trending', rating: 0, img: 'assests/img/project_image\'s/embroidered_jacket_kurta_set/navy_blue_linen_zardosi_embroidered_jacket_kurta_set-sg272976_2 - Copy.jpg' },
            { id: 7, name: 'Pink Embroidered Kurta', price: '₹6,200', category: 'Kurtas', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/embroidered_jacket_kurta_set/pink_hand_embroidered_jacket_and_kurta_set_in_linen-sg273040_2.jpg' },
            { id: 8, name: 'Off White Kurta Jacket', price: '₹7,200', category: 'Kurtas', tag: 'Sale', rating: 0, img: 'assests/img/project_image\'s/embroidered_jacket_kurta_set/off_white_floral_hand_embroidered_kurta_jacket_set-sg273072_8.jpg' },
            { id: 9, name: 'Peach Silk Indo Western', price: '₹18,500', category: 'Indo Western', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/indori_western/peach_silk_indowestern_set_with_hand_work_for_men-sg252327_2_7aad6fcb-676a-4760-8cf0-3c40bacaf825.jpg' },
            { id: 10, name: 'Navy Blue Indo Western', price: '₹20,000', category: 'Indo Western', tag: 'Trending', rating: 0, img: 'assests/img/project_image\'s/indori_western/navy_blue_indowestern-sg171432_1.jpg' },
            { id: 11, name: 'Elegant Blue Indo Western', price: '₹22,000', category: 'Indo Western', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/indori_western/elegant_blue_groom_s_indowestern-sg204282_3.jpg' },
            { id: 12, name: 'Purple Indo Western', price: '₹19,500', category: 'Indo Western', tag: 'Sale', rating: 0, img: 'assests/img/project_image\'s/indori_western/stylish_purple_indowestern_for_men-sg195788_2.jpg' },
            { id: 13, name: 'Off White Jodhpuri', price: '₹24,000', category: 'Jodhpuri', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/jodhpuri_set/off_white_silk_blend_jodhpuri_set_with_textured_detail-sg258810_1.jpg' },
            { id: 14, name: 'Embroidered Jodhpuri', price: '₹26,000', category: 'Jodhpuri', tag: 'Trending', rating: 0, img: 'assests/img/project_image\'s/jodhpuri_set/off-white-embroidered-jodhpuri-and-pant-set-sg369524-2_7f4954b9-8ee7-414a-ad3d-0f927e3ec38a.jpg' },
            { id: 15, name: 'Pink Jodhpuri Set', price: '₹25,500', category: 'Jodhpuri', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/jodhpuri_set/pink-button-front-jodhpuri-and-pant-set-sg369532-1_ee584e81-6ebe-4446-94f2-b73c42b4bd43.jpg' },
            { id: 16, name: 'Green Kurta Jacket Set', price: '₹8,200', category: 'Kurta Jacket', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/kurta-jacket/green_embroidered_jacket_kurta_set_in_linen_satin-sg278256_1.jpg' },
            { id: 17, name: 'Purple Resham Kurta Jacket', price: '₹9,500', category: 'Kurta Jacket', tag: 'Trending', rating: 0, img: 'assests/img/project_image\'s/kurta-jacket/purple_resham_work_kurta_jacket_set-sg278264_1 (1).jpg' },
            { id: 18, name: 'Navy Blue Sherwani Set', price: '₹28,000', category: 'Kurta Jacket', tag: 'New', rating: 0, img: 'assests/img/project_image\'s/kurta-jacket/navy_blue_sherwani_set_in_silk-sg258794_2.jpg' }
        ];

        let currentFiltser = 'all';
        let displayProducts = [];

        function filterByCategory(category) {
            currentFilter = category;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            renderCategorySections();
        }

        function sortProducts(sortBy) {
            if (sortBy === 'default') {
                renderCategorySections();
                return;
            }
            
            let sorted = [...displayProducts];
            if (sortBy === 'price-low') {
                sorted.sort((a, b) => parseFloat(a.price.replace(/[^0-9]/g, '')) - parseFloat(b.price.replace(/[^0-9]/g, '')));
            } else if (sortBy === 'price-high') {
                sorted.sort((a, b) => parseFloat(b.price.replace(/[^0-9]/g, '')) - parseFloat(a.price.replace(/[^0-9]/g, '')));
            } else if (sortBy === 'name') {
                sorted.sort((a, b) => a.name.localeCompare(b.name));
            }
            
            const container = document.getElementById('category-sections');
            container.innerHTML = '<div class="product-grid" id="sorted-grid"></div>';
            const grid = document.getElementById('sorted-grid');
            sorted.forEach(product => grid.appendChild(createProductCard(product)));
            document.getElementById('product-count').textContent = `${sorted.length} Products`;
        }

        function renderCategorySections() {
            const container = document.getElementById('category-sections');
            container.innerHTML = '';
            
            let filtered = currentFilter === 'all' ? productsData : productsData.filter(p => p.category === currentFilter);
            displayProducts = filtered;
            document.getElementById('product-count').textContent = `${filtered.length} Products`;
            
            if (currentFilter === 'all') {
                ['Sherwanis', 'Kurtas', 'Indo Western', 'Jodhpuri', 'Kurta Jacket'].forEach(cat => {
                    const catProducts = productsData.filter(p => p.category === cat);
                    if (catProducts.length > 0) {
                        const section = document.createElement('div');
                        section.style.marginBottom = '3rem';
                        section.innerHTML = `
                            <div style="padding: 2rem 0 1rem 0; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h2 class="section-title">${cat}</h2>
                                    <p class="section-subtitle">${catProducts.length} Products</p>
                                </div>
                                <a href="${cat.toLowerCase().replace(/\s+/g, '-')}.html" style="color: #C5A059; text-decoration: none; font-weight: 600;">View All →</a>
                            </div>
                            <div class="product-grid" id="${cat.replace(/\s+/g, '-')}-grid"></div>
                        `;
                        container.appendChild(section);
                        const grid = document.getElementById(`${cat.replace(/\s+/g, '-')}-grid`);
                        catProducts.slice(0, 4).forEach(product => grid.appendChild(createProductCard(product)));
                    }
                });
            } else {
                const section = document.createElement('div');
                section.innerHTML = '<div class="product-grid" id="filtered-grid"></div>';
                container.appendChild(section);
                const grid = document.getElementById('filtered-grid');
                filtered.forEach(product => grid.appendChild(createProductCard(product)));
            }
        }

        function createProductCard(product) {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cursor = 'pointer';

            // Seed a stable rating per product so each card shows a different value
            if (!product.rating)
                product.rating = (3.2 + ((product.id * 37 + 11) % 18) / 10).toFixed(1);
            if (!product.reviewCount)
                product.reviewCount = 40 + ((product.id * 53 + 7) % 460);

            card.innerHTML = `
                <div class="product-img-wrapper">
                    <img src="${product.img}" alt="${product.name}" class="product-img" style="width: 100%; height: auto; object-fit: cover;">
                    ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
                    <div class="quick-add">Add to Bag</div>
                </div>
                <div class="product-info">
                    <div class="product-details">
                        <h4 class="product-name">${product.name}</h4>
                        <p class="product-cat">${product.category}</p>
                        ${generateStarRating(product.rating, product.reviewCount)}
                        <p class="product-price">${product.price}</p>
                    </div>
                </div>
            `;

            card.onclick = function(e) {
                if (!e.target.classList.contains('quick-add')) {
                    window.location.href = 'product-detail.html?id=' + product.id;
                }
            };

            const quickAddBtn = card.querySelector('.quick-add');
            if (quickAddBtn) {
                quickAddBtn.onclick = function(e) {
                    e.stopPropagation();
                    if (typeof addToCart === 'function') addToCart(e, product.id);
                };
            }

            return card;
        }

        window.onload = () => {
            if (typeof loadBagFromStorage === 'function') loadBagFromStorage();
            renderCategorySections();
        };

// Occasion page data with images
const occasionProducts = {
            haldi: [
                { id: 1001, name: 'Yellow Embroidered Kurta', price: '₹6,400', category: 'Kurtas', occasion: 'haldi', img: "assests/occasion/haldi/1124484-19546301.jpg" },
                { id: 1002, name: 'Cream Floral Kurta', price: '₹6,200', category: 'Kurtas', occasion: 'haldi', img: "assests/occasion/haldi/1124486-19546315.jpg" },
                { id: 1003, name: 'Pastel Green Kurta', price: '₹7,200', category: 'Kurtas', occasion: 'haldi', img: "assests/occasion/haldi/1124488-19546328.jpg" },
                { id: 1004, name: 'Lemon Yellow Kurta Set', price: '₹8,200', category: 'Kurta Jacket', occasion: 'haldi', img: "assests/occasion/haldi/1124504-19546431.jpg" }
            ],
            sangeet: [
                { id: 1005, name: 'Royal Blue Indo Western', price: '₹18,500', category: 'Indo Western', occasion: 'sangeet', img: "assests/occasion/sangeet/1154935-21806110.jpg" },
                { id: 1006, name: 'Maroon Velvet Indo Western', price: '₹20,000', category: 'Indo Western', occasion: 'sangeet', img: "assests/occasion/sangeet/1154965-21806274.jpg" },
                { id: 1007, name: 'Navy Blue Indo Western', price: '₹22,000', category: 'Indo Western', occasion: 'sangeet', img: "assests/occasion/sangeet/1154978-21806342.jpg" },
                { id: 1008, name: 'Burgundy Indo Western', price: '₹19,500', category: 'Indo Western', occasion: 'sangeet', img: "assests/occasion/sangeet/1076628-16659246.jpg" }
            ],
            wedding: [
                { id: 1009, name: 'Ivory Silk Sherwani', price: '₹45,000', category: 'Sherwanis', occasion: 'wedding', img: "assests/occasion/wedding/1078522-16670745.jpg" },
                { id: 1010, name: 'Golden Embroidered Sherwani', price: '₹48,500', category: 'Sherwanis', occasion: 'wedding', img: "assests/occasion/wedding/1078525-16670763.jpg" },
                { id: 1011, name: 'Cream Wedding Sherwani', price: '₹42,000', category: 'Sherwanis', occasion: 'wedding', img: "assests/occasion/wedding/1078534-16670811.jpg" },
                { id: 1012, name: 'Royal Red Sherwani', price: '₹52,000', category: 'Sherwanis', occasion: 'wedding', img: "assests/occasion/wedding/1078589-16671109.jpg" }
            ],
            mehendi: [
                { id: 1013, name: 'Mint Green Jodhpuri', price: '₹24,000', category: 'Jodhpuri', occasion: 'mehendi', img: "assests/occasion/mehendi/1108529-19125867.jpg" },
                { id: 1014, name: 'Peach Embroidered Jodhpuri', price: '₹26,000', category: 'Jodhpuri', occasion: 'mehendi', img: "assests/occasion/mehendi/1108532-19125884.jpg" },
                { id: 1015, name: 'Pastel Pink Jodhpuri', price: '₹25,500', category: 'Jodhpuri', occasion: 'mehendi', img: "assests/occasion/mehendi/1108990-19133202.jpg" },
                { id: 1016, name: 'Sage Green Kurta Jacket', price: '₹9,500', category: 'Kurta Jacket', occasion: 'mehendi', img: "assests/occasion/mehendi/1109008-19133330.jpg" }
            ]

        };

        let currentOccasionFilter = 'all';
        let allOccasionProducts = Object.values(occasionProducts).flat();

        // --- IMPROVED RENDER LOGIC ---
        function createOccasionCard(product) {
            const rating = product.rating || (3.2 + ((product.id * 37 + 11) % 18) / 10);
            const reviewCount = product.reviewCount || Math.floor(50 + ((product.id * 23) % 150));
            return `
                <div class="occ-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
                    <div class="occ-img-box">
                        <img src="${product.img}" alt="${product.name}" onerror="this.src='assests/img/placeholder.jpg'">
                    </div>
                    <div class="occ-info">
                        <h4>${product.name}</h4>
                        <p>${product.price}</p>
                        <div class="product-rating-wrapper">
                            ${generateStarRating(rating, reviewCount)}
                        </div>
                    </div>
                </div>
            `;
        }

        function filterOccasion(occasion, btn) {
            currentOccasionFilter = occasion;
            
            // UI Updates
            document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            
            renderOccasionGrid();
        }

        function renderOccasionGrid() {
            const gridContainer = document.getElementById('all-grid');
            if (!gridContainer) return;

            gridContainer.innerHTML = ''; // Clear existing
            
            const productsToShow = currentOccasionFilter === 'all' 
                ? allOccasionProducts 
                : allOccasionProducts.filter(p => p.occasion === currentOccasionFilter);
            
            // Build the grid
            gridContainer.innerHTML = productsToShow.map(p => createOccasionCard(p)).join('');
        }

        // Initialize on Load
        window.addEventListener('DOMContentLoaded', renderOccasionGrid);

        // --- ACCESSORIES FILTER LOGIC ---
        const accessoriesProducts = {
            safa: [
                { id: 101, name: 'Royal Red Safa', price: '₹2,400', category: 'safa', img: "assests/accessories/safa/1078685-16671584.jpg" },
                { id: 102, name: 'Golden Embroidered Safa', price: '₹3,200', category: 'safa', img: "assests/accessories/safa/1078690-16671611.jpg" },
                { id: 103, name: 'Maroon Silk Safa', price: '₹2,800', category: 'safa', img: "assests/accessories/safa/1078691-16671617.jpg" },
                { id: 104, name: 'Cream Wedding Safa', price: '₹3,500', category: 'safa', img: "assests/accessories/safa/1078692-16671626.jpg" }
            ],
            brooch: [
                { id: 201, name: 'Diamond Brooch', price: '₹1,800', category: 'brooch', img: "assests/accessories/brooch/1071189-16556419.jpg" },
                { id: 202, name: 'Pearl Brooch', price: '₹1,500', category: 'brooch', img: "assests/accessories/brooch/1076783-16660257.jpg" },
                { id: 203, name: 'Emerald Brooch', price: '₹2,200', category: 'brooch', img: "assests/accessories/brooch/1153454-21326212.jpg" },
                { id: 204, name: 'Ruby Brooch', price: '₹2,000', category: 'brooch', img: "assests/accessories/brooch/1154888-21805656.jpg" }
            ],
            mojeri: [
                { id: 301, name: 'Golden Mojeri', price: '₹4,500', category: 'mojeri', img: "assests/accessories/mojeri/1071251-16556776.jpg" },
                { id: 302, name: 'Embroidered Mojeri', price: '₹5,200', category: 'mojeri', img: "assests/accessories/mojeri/1078379-16670144.jpg" },
                { id: 303, name: 'Royal Blue Mojeri', price: '₹4,800', category: 'mojeri', img: "assests/accessories/mojeri/1078380-16670149.jpg" },
                { id: 304, name: 'Maroon Velvet Mojeri', price: '₹5,500', category: 'mojeri', img: "assests/accessories/mojeri/1078384-16670163.jpg" }
            ],
            kamarbandh: [
                { id: 401, name: 'Silver Kamarbandh', price: '₹3,200', category: 'kamarbandh', img: "assests/accessories/Kamarbandh/1077364-16665092.jpg" },
                { id: 402, name: 'Gold Plated Kamarbandh', price: '₹3,800', category: 'kamarbandh', img: "assests/accessories/Kamarbandh/1077368-16665100.jpg" },
                { id: 403, name: 'Kundan Kamarbandh', price: '₹4,200', category: 'kamarbandh', img: "assests/accessories/Kamarbandh/1077369-16665105.jpg" },
                { id: 404, name: 'Traditional Kamarbandh', price: '₹3,500', category: 'kamarbandh', img: "assests/accessories/Kamarbandh/1077370-16665111.jpg" }
            ]
        };

        let currentAccessoryFilter = 'all';
        let allAccessoriesProducts = Object.values(accessoriesProducts).flat();

        function createAccessoryCard(product) {
            const rating = product.rating || (3.2 + ((product.id * 37 + 11) % 18) / 10);
            const reviewCount = product.reviewCount || Math.floor(50 + ((product.id * 23) % 150));
            return `
                <div class="occ-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
                    <div class="occ-img-box">
                        <img src="${product.img}" alt="${product.name}" onerror="this.src='assests/img/placeholder.jpg'">
                    </div>
                    <div class="occ-info">
                        <h4>${product.name}</h4>
                        <p>${product.price}</p>
                        <div class="product-rating-wrapper">
                            ${generateStarRating(rating, reviewCount)}
                        </div>
                    </div>
                </div>
            `;
        }

        function filterAccessories(category, btn) {
            currentAccessoryFilter = category;
            
            document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            
            renderAccessoriesGrid();
        }

        function renderAccessoriesGrid() {
            const gridContainer = document.getElementById('accessories-grid');
            if (!gridContainer) return;

            gridContainer.innerHTML = '';
            
            const productsToShow = currentAccessoryFilter === 'all' 
                ? allAccessoriesProducts 
                : allAccessoriesProducts.filter(p => p.category === currentAccessoryFilter);
            
            gridContainer.innerHTML = productsToShow.map(p => createAccessoryCard(p)).join('');
        }

        // Initialize accessories on load
        window.addEventListener('DOMContentLoaded', renderAccessoriesGrid);