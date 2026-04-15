let shopContent = {};
let products = [];
let cart = [];
let cartModalInstance;
let activeCategory = 'all';

const defaultShopContent = {
    pageTitle: 'Gym Shop',
    branding: {
        brandTextWhite: '26',
        brandTextLight: 'fitness',
        brandTextAccent: 'Club',
        homeUrl: 'index.html',
        backUrl: 'index.html',
        backLabel: 'Back'
    },
    hero: {
        badge: 'Official Merchandise & More',
        titleWhite: 'Gym',
        titleAccent: 'Shop',
        subtitle: 'Apparel, shoes, supplements and accessories — all managed from shop.json.'
    },
    categories: [
        { value: 'all', label: 'All' }
    ],
    shop: {
        currencySymbol: 'Rs.',
        whatsappNumber: '',
        phone: '',
        address: '',
        mapLink: '',
        cartTitle: 'Your Cart',
        cartButtonLabel: 'Cart',
        placeOrderLabel: 'Place Order',
        namePlaceholder: 'Name',
        phonePlaceholder: 'Phone Number',
        emptyCartText: 'Your cart is empty.',
        emptyCategoryText: 'No products found in this category yet.',
        loadErrorText: 'Unable to load products. Open the site with a local server to use the shop.',
        orderIntro: 'Hi, I want to order these products:',
        requireCartMessage: 'Please add at least one product to your cart first.',
        requireCustomerMessage: 'Please enter your name and phone number in the cart.',
        whatsappMissingMessage: 'WhatsApp number is not configured.',
        totalLabel: 'Total',
        optionLabel: 'Option',
        sizeLabel: 'Size',
        priceLabel: 'Price',
        removeLabel: 'Remove',
        categoryLabel: 'Category',
        typeLabel: 'Type',
        brandLabel: 'Brand',
        materialLabel: 'Material',
        detailsLabel: 'Details',
        highlightsLabel: 'Highlights',
        addToCartLabel: 'Add to Cart',
        fallbackProductName: 'Gym Product'
    },
    footer: {
        copyright: '',
        poweredBy: ''
    },
    products: []
};

function mergeShopContent(data) {
    return {
        ...defaultShopContent,
        ...data,
        branding: {
            ...defaultShopContent.branding,
            ...(data.branding || {})
        },
        hero: {
            ...defaultShopContent.hero,
            ...(data.hero || {})
        },
        shop: {
            ...defaultShopContent.shop,
            ...(data.shop || {})
        },
        footer: {
            ...defaultShopContent.footer,
            ...(data.footer || {})
        }
    };
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeCategory(value) {
    return String(value || '').trim().toLowerCase();
}

function formatCategoryLabel(value) {
    return String(value || '')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatPrice(price) {
    const symbol = shopContent.shop?.currencySymbol || defaultShopContent.shop.currencySymbol;
    const numericPrice = Number(price || 0);
    return `${symbol} ${Number.isFinite(numericPrice) ? numericPrice : 0}`;
}

function toTextArray(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === 'string' || typeof item === 'number') {
                    return String(item).trim();
                }

                if (item && typeof item === 'object') {
                    return String(item.label || item.value || item.name || item.text || '').trim();
                }

                return '';
            })
            .filter(Boolean);
    }

    if (typeof value === 'string') {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [];
}

function normalizeSpecList(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (!item) return null;

                if (typeof item === 'string') {
                    return {
                        label: shopContent.shop?.detailsLabel || defaultShopContent.shop.detailsLabel,
                        value: item.trim()
                    };
                }

                if (typeof item === 'object') {
                    const label = String(item.label || item.key || item.name || '').trim();
                    const specValue = String(item.value || item.text || item.content || '').trim();

                    if (!label || !specValue) return null;

                    return {
                        label,
                        value: specValue
                    };
                }

                return null;
            })
            .filter(Boolean);
    }

    if (value && typeof value === 'object') {
        return Object.entries(value)
            .map(([label, specValue]) => ({
                label: String(label || '').trim(),
                value: String(specValue || '').trim()
            }))
            .filter((item) => item.label && item.value);
    }

    return [];
}

function buildProductSpecs(product) {
    const shop = shopContent.shop || defaultShopContent.shop;
    const specs = [];
    const seenLabels = new Set();

    function pushSpec(label, value) {
        const safeLabel = String(label || '').trim();
        const safeValue = String(value || '').trim();

        if (!safeLabel || !safeValue) return;

        const key = safeLabel.toLowerCase();
        if (seenLabels.has(key)) return;

        seenLabels.add(key);
        specs.push({
            label: safeLabel,
            value: safeValue
        });
    }

    pushSpec(shop.brandLabel || defaultShopContent.shop.brandLabel, product?.brand);
    pushSpec(shop.materialLabel || defaultShopContent.shop.materialLabel, product?.material);

    normalizeSpecList(product?.specs).forEach((spec) => {
        pushSpec(spec.label, spec.value);
    });

    return specs;
}

function getProductHighlights(product) {
    return toTextArray(product?.highlights || product?.tags || product?.features).slice(0, 4);
}

function getProductOptionValues(product) {
    const possibleSources = [
        product?.options,
        product?.optionValues,
        product?.variants,
        product?.sizes
    ];

    for (const source of possibleSources) {
        const values = toTextArray(source);
        if (values.length) {
            return values;
        }
    }

    return [];
}

function getProductOptionLabel(product) {
    const shop = shopContent.shop || defaultShopContent.shop;

    if (product?.optionLabel) return String(product.optionLabel).trim();
    if (product?.variantLabel) return String(product.variantLabel).trim();

    if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
        return shop.sizeLabel || defaultShopContent.shop.sizeLabel;
    }

    return shop.optionLabel || defaultShopContent.shop.optionLabel;
}

function hasMeaningfulOptions(product) {
    return getProductOptionValues(product).length > 0;
}

function resolveProductImage(product) {
    if (product && typeof product.image === 'string' && product.image.trim()) {
        return product.image.trim();
    }

    if (product && Array.isArray(product.images) && product.images.length > 0) {
        const firstImage = product.images[0];

        if (typeof firstImage === 'string' && firstImage.trim()) {
            return firstImage.trim();
        }

        if (firstImage && typeof firstImage === 'object') {
            if (typeof firstImage.dataUrl === 'string' && firstImage.dataUrl.trim()) {
                return firstImage.dataUrl.trim();
            }

            if (typeof firstImage.url === 'string' && firstImage.url.trim()) {
                return firstImage.url.trim();
            }
        }
    }

    return 'images/dummy.svg';
}

function extractOfferBadgeText(offerData = {}) {
    const discountText = [offerData.discount, offerData.discountAccent]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

    const offerTitle = [offerData.badgeText, offerData.title, offerData.titleAccent, offerData.titleSuffix]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

    return String(discountText || offerData.badgeText || offerTitle || 'Live')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 18);
}

async function applyOfferNavigation() {
    const offerLink = document.getElementById('shopOfferLink');
    const offerBadge = document.getElementById('shopOfferBadge');

    if (!offerLink) return;

    try {
        const response = await fetch('offer.json');
        if (!response.ok) return;

        const offerData = await response.json();
        const badgeText = extractOfferBadgeText(offerData);
        const offerTitle = [offerData.badgeText, offerData.title, offerData.titleAccent, offerData.titleSuffix]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        const offerDescription = String(offerData.description || '').replace(/\s+/g, ' ').trim();

        if (offerBadge) {
            offerBadge.textContent = badgeText;
        }

        offerLink.setAttribute('title', [offerTitle || badgeText, offerDescription].filter(Boolean).join(' • '));
        offerLink.setAttribute('aria-label', ['View current offers', offerTitle || badgeText, offerDescription].filter(Boolean).join('. '));
    } catch (error) {
        console.warn('Unable to load offer.json for shop navigation:', error);
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function getProductById(productId) {
    return products.find((product) => Number(product.id) === Number(productId));
}

function generateOrderReference() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const random = Math.floor(100 + Math.random() * 900);
    return `ORD-${y}${m}${d}-${h}${min}-${random}`;
}

function getOrderDateTime() {
    const now = new Date();

    return {
        orderDate: now.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }),
        orderTime: now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    };
}

function buildCategories() {
    const configured = Array.isArray(shopContent.categories) ? shopContent.categories : [];
    const normalizedConfigured = configured
        .map((item) => {
            if (typeof item === 'string') {
                return {
                    value: normalizeCategory(item),
                    label: formatCategoryLabel(item)
                };
            }

            const value = normalizeCategory(item?.value || item?.key || item?.label);
            return {
                value,
                label: item?.label || formatCategoryLabel(value)
            };
        })
        .filter((item) => item.value);

    const existingValues = new Set(normalizedConfigured.map((item) => item.value));
    const productCategories = [...new Set(products.map((product) => normalizeCategory(product.category)).filter(Boolean))];

    productCategories.forEach((category) => {
        if (!existingValues.has(category)) {
            normalizedConfigured.push({
                value: category,
                label: formatCategoryLabel(category)
            });
        }
    });

    const allCategory = normalizedConfigured.find((item) => item.value === 'all') || { value: 'all', label: 'All' };
    const otherCategories = normalizedConfigured.filter((item) => item.value !== 'all');

    return [allCategory, ...otherCategories];
}

function applyPageContent() {
    document.title = shopContent.pageTitle || defaultShopContent.pageTitle;

    const branding = shopContent.branding || {};
    const hero = shopContent.hero || {};
    const shop = shopContent.shop || {};
    const footer = shopContent.footer || {};

    const homeLink = document.getElementById('shopHomeLink');
    if (homeLink) {
        homeLink.setAttribute('href', branding.homeUrl || 'index.html');
    }

    const backButton = document.getElementById('shopBackButton');
    if (backButton) {
        backButton.setAttribute('href', branding.backUrl || branding.homeUrl || 'index.html');
    }

    const brandWhite = document.getElementById('shopBrandWhite');
    if (brandWhite) brandWhite.textContent = branding.brandTextWhite || defaultShopContent.branding.brandTextWhite;

    const brandLight = document.getElementById('shopBrandLight');
    if (brandLight) brandLight.textContent = branding.brandTextLight || defaultShopContent.branding.brandTextLight;

    const brandAccent = document.getElementById('shopBrandAccent');
    if (brandAccent) brandAccent.textContent = branding.brandTextAccent || defaultShopContent.branding.brandTextAccent;

    const backLabel = document.getElementById('shopBackLabel');
    if (backLabel) backLabel.textContent = branding.backLabel || defaultShopContent.branding.backLabel;

    const heroBadge = document.getElementById('shopHeroBadge');
    if (heroBadge) heroBadge.textContent = hero.badge || defaultShopContent.hero.badge;

    const heroTitleWhite = document.getElementById('shopHeroTitleWhite');
    if (heroTitleWhite) heroTitleWhite.textContent = hero.titleWhite || defaultShopContent.hero.titleWhite;

    const heroTitleAccent = document.getElementById('shopHeroTitleAccent');
    if (heroTitleAccent) heroTitleAccent.textContent = hero.titleAccent || defaultShopContent.hero.titleAccent;

    const heroSubtitle = document.getElementById('shopHeroSubtitle');
    if (heroSubtitle) heroSubtitle.textContent = hero.subtitle || defaultShopContent.hero.subtitle;

    const cartModalTitle = document.getElementById('cartModalTitle');
    if (cartModalTitle) cartModalTitle.textContent = shop.cartTitle || defaultShopContent.shop.cartTitle;

    const cartButtonLabel = document.getElementById('shopCartButtonLabel');
    if (cartButtonLabel) cartButtonLabel.textContent = shop.cartButtonLabel || defaultShopContent.shop.cartButtonLabel;

    const placeOrderButton = document.getElementById('placeOrderButton');
    if (placeOrderButton) placeOrderButton.textContent = shop.placeOrderLabel || defaultShopContent.shop.placeOrderLabel;

    const cartUsername = document.getElementById('cartUsername');
    if (cartUsername) cartUsername.setAttribute('placeholder', shop.namePlaceholder || defaultShopContent.shop.namePlaceholder);

    const cartPhone = document.getElementById('cartPhone');
    if (cartPhone) cartPhone.setAttribute('placeholder', shop.phonePlaceholder || defaultShopContent.shop.phonePlaceholder);

    const footerCopyright = document.getElementById('shopFooterCopyright');
    if (footerCopyright) footerCopyright.textContent = footer.copyright || '';

    const footerPoweredBy = document.getElementById('shopFooterPoweredBy');
    if (footerPoweredBy) footerPoweredBy.textContent = footer.poweredBy || '';

    const footerSeparator = document.getElementById('shopFooterSeparator');
    if (footerSeparator) {
        footerSeparator.style.display = footer.copyright && footer.poweredBy ? 'inline' : 'none';
    }
}

function renderCategoryButtons() {
    const categoryContainer = document.getElementById('shopCategoryFilter');
    if (!categoryContainer) return;

    const categories = buildCategories();
    if (!categories.some((item) => item.value === activeCategory)) {
        activeCategory = categories[0]?.value || 'all';
    }

    categoryContainer.innerHTML = categories.map((category) => `
        <button class="shop-filter-btn ${category.value === activeCategory ? 'active' : ''}" type="button" data-category="${escapeHtml(category.value)}">
            ${escapeHtml(category.label)}
        </button>
    `).join('');

    categoryContainer.querySelectorAll('.shop-filter-btn').forEach((button) => {
        button.addEventListener('click', () => {
            activeCategory = button.dataset.category || 'all';
            renderCategoryButtons();
            renderProducts();
        });
    });
}

function renderProductSpecs(specs) {
    if (!specs.length) return '';

    return `
        <div class="shop-spec-grid mb-3">
            ${specs.slice(0, 4).map((spec) => `
                <span class="shop-spec-pill">
                    <span class="shop-spec-label">${escapeHtml(spec.label)}</span>
                    <span class="shop-spec-value">${escapeHtml(spec.value)}</span>
                </span>
            `).join('')}
        </div>
    `;
}

function renderProductHighlights(highlights) {
    if (!highlights.length) return '';

    return `
        <div class="shop-highlight-row mb-3">
            ${highlights.map((highlight) => `
                <span class="shop-highlight-chip">${escapeHtml(highlight)}</span>
            `).join('')}
        </div>
    `;
}

function renderProducts() {
    const productList = document.getElementById('productList');
    if (!productList) return;

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter((product) => normalizeCategory(product.category) === activeCategory);

    if (filteredProducts.length === 0) {
        productList.innerHTML = `<p class="text-center text-secondary">${escapeHtml(shopContent.shop?.emptyCategoryText || defaultShopContent.shop.emptyCategoryText)}</p>`;
        return;
    }

    productList.innerHTML = filteredProducts.map((product, index) => {
        const fallbackProductName = shopContent.shop?.fallbackProductName || defaultShopContent.shop.fallbackProductName;
        const categoryLabel = shopContent.shop?.categoryLabel || defaultShopContent.shop.categoryLabel;
        const typeLabel = shopContent.shop?.typeLabel || defaultShopContent.shop.typeLabel;
        const addToCartLabel = shopContent.shop?.addToCartLabel || defaultShopContent.shop.addToCartLabel;
        const optionLabel = getProductOptionLabel(product);
        const optionValues = getProductOptionValues(product);
        const specs = buildProductSpecs(product);
        const highlights = getProductHighlights(product);
        const badgeHtml = product.badge ? `<span class="shop-card-badge">${escapeHtml(product.badge)}</span>` : '';
        const typeHtml = product.type ? `<span class="shop-card-soft-pill">${escapeHtml(typeLabel)}: ${escapeHtml(product.type)}</span>` : '';
        const productCodeHtml = product.productCode ? `<div class="shop-product-code mb-2">${escapeHtml(product.productCode)}</div>` : '';
        const descriptionHtml = product.description ? `<p class="shop-card-meta mb-3">${escapeHtml(product.description)}</p>` : '';
        const optionHtml = optionValues.length
            ? `<p class="shop-card-meta mb-4">${escapeHtml(optionLabel)}: ${escapeHtml(optionValues.join(', '))}</p>`
            : '<div class="mb-4"></div>';

        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 border-0 shadow-sm text-white shop-product-card" style="animation-delay: ${index * 0.08}s;">
                    <img
                        src="${escapeHtml(resolveProductImage(product))}"
                        class="card-img-top shop-product-image"
                        alt="${escapeHtml(product.name || fallbackProductName)}"
                        onerror="this.onerror=null;this.src='images/dummy.svg';"
                    >
                    <div class="card-body d-flex flex-column">
                        <div class="shop-card-badge-row mb-3">
                            ${badgeHtml}
                            ${typeHtml}
                        </div>
                        <div class="d-flex justify-content-between align-items-start flex-wrap mb-2 gap-2">
                            <h5 class="card-title mb-0 shop-product-title">${escapeHtml(product.name || fallbackProductName)}</h5>
                            <span class="shop-price-badge">${escapeHtml(formatPrice(product.price ?? 0))}</span>
                        </div>
                        ${productCodeHtml}
                        <p class="shop-card-meta mb-3">${escapeHtml(categoryLabel)}: ${escapeHtml(formatCategoryLabel(product.category || 'General'))}</p>
                        ${descriptionHtml}
                        ${renderProductSpecs(specs)}
                        ${renderProductHighlights(highlights)}
                        ${optionHtml}
                        <button class="btn btn-accent mt-auto shop-add-to-cart-button" type="button" data-product-id="${escapeHtml(product.id)}">${escapeHtml(addToCartLabel)}</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    productList.querySelectorAll('.shop-add-to-cart-button').forEach((button) => {
        button.addEventListener('click', () => {
            addToCart(button.dataset.productId, button);
        });
    });
}

function addToCart(productId, buttonElement) {
    const product = getProductById(productId);
    if (!product) return;

    const optionValues = getProductOptionValues(product);
    const selectedOption = optionValues[0] || '';
    const optionLabel = getProductOptionLabel(product);
    const existingItem = cart.find((item) => Number(item.id) === Number(product.id) && item.option === selectedOption);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            productCode: product.productCode || `PRD-${product.id}`,
            price: Number(product.price || 0),
            image: resolveProductImage(product),
            option: selectedOption,
            optionLabel,
            availableOptions: optionValues,
            hasOptions: optionValues.length > 0,
            quantity: 1
        });
    }

    updateCartCount();
    renderCart();

    if (buttonElement) {
        buttonElement.classList.remove('shop-add-cart-animate');
        void buttonElement.offsetWidth;
        buttonElement.classList.add('shop-add-cart-animate');

        window.setTimeout(() => {
            buttonElement.classList.remove('shop-add-cart-animate');
        }, 700);
    }
}

function changeQuantity(productId, option, delta) {
    const item = cart.find((cartItem) => Number(cartItem.id) === Number(productId) && cartItem.option === option);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        cart = cart.filter((cartItem) => !(Number(cartItem.id) === Number(productId) && cartItem.option === option));
    }

    updateCartCount();
    renderCart();
}

function updateCartOption(productId, oldOption, newOption) {
    const item = cart.find((cartItem) => Number(cartItem.id) === Number(productId) && cartItem.option === oldOption);
    if (!item || oldOption === newOption) return;

    const existingItem = cart.find((cartItem) => Number(cartItem.id) === Number(productId) && cartItem.option === newOption);

    if (existingItem) {
        existingItem.quantity += item.quantity;
        cart = cart.filter((cartItem) => !(Number(cartItem.id) === Number(productId) && cartItem.option === oldOption));
    } else {
        item.option = newOption;
    }

    updateCartCount();
    renderCart();
}

function removeFromCart(productId, option) {
    cart = cart.filter((item) => !(Number(item.id) === Number(productId) && item.option === option));
    updateCartCount();
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    const shop = shopContent.shop || defaultShopContent.shop;
    const fallbackProductName = shop.fallbackProductName || defaultShopContent.shop.fallbackProductName;

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="mb-0 shop-empty-cart">${escapeHtml(shop.emptyCartText || defaultShopContent.shop.emptyCartText)}</p>`;
        return;
    }

    cartItems.innerHTML = cart.map((item) => {
        const product = getProductById(item.id) || {};
        const optionValues = getProductOptionValues(product).length ? getProductOptionValues(product) : (item.availableOptions || []);
        const showOptionSelector = item.hasOptions && optionValues.length > 0;
        const optionSection = showOptionSelector
            ? `
                <div class="shop-cart-size-wrap mt-2">
                    <label class="shop-cart-meta small d-block mb-1" for="cart-option-${escapeHtml(item.id)}-${encodeURIComponent(item.option || 'default')}">${escapeHtml(item.optionLabel || shop.optionLabel || defaultShopContent.shop.optionLabel)}</label>
                    <select
                        class="form-select form-select-sm shop-cart-option-select"
                        id="cart-option-${escapeHtml(item.id)}-${encodeURIComponent(item.option || 'default')}"
                        data-product-id="${escapeHtml(item.id)}"
                        data-old-option="${encodeURIComponent(item.option || '')}"
                    >
                        ${optionValues.map((optionValue) => `
                            <option value="${escapeHtml(optionValue)}" ${optionValue === item.option ? 'selected' : ''}>${escapeHtml(optionValue)}</option>
                        `).join('')}
                    </select>
                </div>
            `
            : '';

        return `
            <div class="shop-cart-item p-3 mb-3">
                <div class="shop-cart-item-top d-flex justify-content-between align-items-start gap-3">
                    <div class="shop-cart-info d-flex align-items-start gap-3">
                        <img
                            src="${escapeHtml(item.image || 'images/dummy.svg')}"
                            alt="${escapeHtml(item.name || fallbackProductName)}"
                            class="shop-cart-thumb"
                            onerror="this.onerror=null;this.src='images/dummy.svg';"
                        >
                        <div>
                            <h6 class="mb-1">${escapeHtml(item.name || fallbackProductName)}</h6>
                            ${optionSection}
                            <div class="shop-cart-meta small mt-2">${escapeHtml(shop.priceLabel || defaultShopContent.shop.priceLabel)}: ${escapeHtml(formatPrice(item.price))}</div>
                        </div>
                    </div>
                    <button class="btn btn-sm shop-cart-remove" type="button" data-product-id="${escapeHtml(item.id)}" data-option="${encodeURIComponent(item.option || '')}">
                        ${escapeHtml(shop.removeLabel || defaultShopContent.shop.removeLabel)}
                    </button>
                </div>
                <div class="d-flex align-items-center gap-2 mt-3">
                    <button class="btn btn-sm shop-cart-qty" type="button" data-product-id="${escapeHtml(item.id)}" data-option="${encodeURIComponent(item.option || '')}" data-delta="-1">-</button>
                    <span class="fw-bold shop-cart-qty-count">${escapeHtml(item.quantity)}</span>
                    <button class="btn btn-sm shop-cart-qty" type="button" data-product-id="${escapeHtml(item.id)}" data-option="${encodeURIComponent(item.option || '')}" data-delta="1">+</button>
                </div>
            </div>
        `;
    }).join('') + `
        <div class="d-flex justify-content-between fw-bold pt-3 border-top shop-cart-total">
            <span>${escapeHtml(shop.totalLabel || defaultShopContent.shop.totalLabel)}</span>
            <span>${escapeHtml(formatPrice(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)))}</span>
        </div>
    `;

    cartItems.querySelectorAll('.shop-cart-remove').forEach((button) => {
        button.addEventListener('click', () => {
            removeFromCart(button.dataset.productId, decodeURIComponent(button.dataset.option || ''));
        });
    });

    cartItems.querySelectorAll('.shop-cart-qty').forEach((button) => {
        button.addEventListener('click', () => {
            changeQuantity(button.dataset.productId, decodeURIComponent(button.dataset.option || ''), Number(button.dataset.delta || 0));
        });
    });

    cartItems.querySelectorAll('.shop-cart-option-select').forEach((select) => {
        select.addEventListener('change', () => {
            updateCartOption(select.dataset.productId, decodeURIComponent(select.dataset.oldOption || ''), select.value);
        });
    });
}

function openCart() {
    renderCart();

    if (!cartModalInstance) {
        cartModalInstance = new bootstrap.Modal(document.getElementById('cartModal'));
    }

    cartModalInstance.show();
}

function sendWhatsApp() {
    const shop = shopContent.shop || defaultShopContent.shop;

    if (cart.length === 0) {
        alert(shop.requireCartMessage || defaultShopContent.shop.requireCartMessage);
        return;
    }

    const username = document.getElementById('cartUsername')?.value.trim();
    const phone = document.getElementById('cartPhone')?.value.trim();

    if (!username || !phone) {
        alert(shop.requireCustomerMessage || defaultShopContent.shop.requireCustomerMessage);
        return;
    }

    const orderReference = generateOrderReference();
    const { orderDate, orderTime } = getOrderDateTime();
    const orderLines = cart
        .map((item) => {
            const optionText = item.hasOptions && item.option
                ? ` (${item.optionLabel || shop.optionLabel || defaultShopContent.shop.optionLabel}: ${item.option})`
                : '';
            return `${item.name} [${item.productCode}]${optionText} x ${item.quantity}`;
        })
        .join('\n');
    const total = formatPrice(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    const gymPhone = shop.phone || 'Not available';
    const gymAddress = shop.address || 'Not available';
    const gymMapLink = shop.mapLink || 'Not available';
    const messageText = [
        shop.orderIntro || defaultShopContent.shop.orderIntro,
        `Order Ref: ${orderReference}`,
        `Order Date: ${orderDate}`,
        `Order Time: ${orderTime}`,
        orderLines,
        '',
        `Name: ${username}`,
        `Phone: ${phone}`,
        `Total: ${total}`,
        `Gym Mobile: ${gymPhone}`,
        `Gym Address: ${gymAddress}`,
        `Google Maps: ${gymMapLink}`
    ].join('\n');
    const message = encodeURIComponent(messageText);
    const whatsappNumber = shop.whatsappNumber || '';

    if (!whatsappNumber) {
        alert(shop.whatsappMissingMessage || defaultShopContent.shop.whatsappMissingMessage);
        return;
    }

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
}

function bindStaticEvents() {
    const cartButton = document.getElementById('shopCartButton');
    if (cartButton) {
        cartButton.addEventListener('click', openCart);
    }

    const placeOrderButton = document.getElementById('placeOrderButton');
    if (placeOrderButton) {
        placeOrderButton.addEventListener('click', sendWhatsApp);
    }
}

async function loadShopData() {
    try {
        const response = await fetch('shop.json');
        if (!response.ok) {
            throw new Error('Failed to fetch shop.json');
        }

        const data = await response.json();
        shopContent = mergeShopContent(data);
        products = Array.isArray(shopContent.products) ? shopContent.products : [];

        applyPageContent();
        renderCategoryButtons();
        renderProducts();
        renderCart();
        updateCartCount();
    } catch (error) {
        console.warn('Error loading shop data:', error);
        const productList = document.getElementById('productList');
        if (productList) {
            productList.innerHTML = `<p class="text-center text-danger">${escapeHtml(defaultShopContent.shop.loadErrorText)}</p>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    bindStaticEvents();
    loadShopData();
    applyOfferNavigation();
});
