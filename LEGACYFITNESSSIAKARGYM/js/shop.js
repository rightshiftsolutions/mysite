let products = [];
let cart = [];
let contactDetails = {};
let cartModalInstance;
let activeCategory = 'all';

function formatPrice(price) {
    return `Rs. ${price}`;
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
    const orderDate = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    const orderTime = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return { orderDate, orderTime };
}

function getProductById(productId) {
    return products.find((product) => product.id === productId);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function renderProducts() {
    const productList = document.getElementById('productList');
    if (!productList) return;

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter((product) => (product.category || 'men') === activeCategory);

    if (filteredProducts.length === 0) {
        productList.innerHTML = '<p class="text-center text-secondary">No products found in this category yet.</p>';
        return;
    }

    productList.innerHTML = filteredProducts.map((product, index) => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 border-0 shadow-sm text-white shop-product-card" style="animation-delay: ${index * 0.08}s;">
                <img
                    src="${product.image || 'images/dummy.svg'}"
                    class="card-img-top shop-product-image"
                    alt="${product.name}"
                    onerror="this.onerror=null;this.src='images/dummy.svg';"
                >
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start flex-wrap mb-2 gap-2">
                        <h5 class="card-title mb-0 shop-product-title">${product.name}</h5>
                        <span class="shop-price-badge">${formatPrice(product.price)}</span>
                    </div>
                    <p class="shop-card-meta mb-2">Material: ${product.material}</p>
                    <p class="shop-card-meta mb-4">Sizes: ${product.sizes.join(', ')}</p>
                    <button class="btn btn-accent mt-auto" onclick="addToCart(${product.id}, this)">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

function setCategoryFilter(category, buttonElement) {
    activeCategory = category;
    document.querySelectorAll('.shop-filter-btn').forEach((button) => {
        button.classList.toggle('active', button === buttonElement);
    });
    renderProducts();
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="mb-0 shop-empty-cart">Your cart is empty.</p>';
        return;
    }

    cartItems.innerHTML = cart.map((item) => `
        <div class="shop-cart-item p-3 mb-3">
            <div class="shop-cart-item-top d-flex justify-content-between align-items-start gap-3">
                <div class="shop-cart-info d-flex align-items-start gap-3">
                    <img
                        src="${item.image || 'images/dummy.svg'}"
                        alt="${item.name}"
                        class="shop-cart-thumb"
                        onerror="this.onerror=null;this.src='images/dummy.svg';"
                    >
                    <div>
                        <h6 class="mb-1">${item.name}</h6>
                        <div class="shop-cart-size-wrap mt-2">
                            <label class="shop-cart-meta small d-block mb-1" for="cart-size-${item.id}-${item.size}">Size</label>
                            <select
                                class="form-select form-select-sm shop-cart-size-select"
                                id="cart-size-${item.id}-${item.size}"
                                onchange="updateCartSize(${item.id}, '${item.size}', this.value)"
                            >
                                ${getProductById(item.id).sizes.map((sizeOption) => `
                                    <option value="${escapeHtml(sizeOption)}" ${sizeOption === item.size ? 'selected' : ''}>${escapeHtml(sizeOption)}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="shop-cart-meta small">Price: ${formatPrice(item.price)}</div>
                    </div>
                </div>
                <button class="btn btn-sm shop-cart-remove" onclick="removeFromCart(${item.id}, '${item.size}')">Remove</button>
            </div>
            <div class="d-flex align-items-center gap-2 mt-3">
                <button class="btn btn-sm shop-cart-qty" onclick="changeQuantity(${item.id}, '${item.size}', -1)">-</button>
                <span class="fw-bold shop-cart-qty-count">${item.quantity}</span>
                <button class="btn btn-sm shop-cart-qty" onclick="changeQuantity(${item.id}, '${item.size}', 1)">+</button>
            </div>
        </div>
    `).join('') + `
        <div class="d-flex justify-content-between fw-bold pt-3 border-top shop-cart-total">
            <span>Total</span>
            <span>${formatPrice(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
        </div>
    `;
}

function addToCart(productId, buttonElement) {
    const product = getProductById(productId);
    if (!product) return;

    const selectedSize = product.sizes[0];
    const existingItem = cart.find((item) => item.id === productId && item.size === selectedSize);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            productCode: product.productCode || `TS-${product.id}`,
            price: product.price,
            image: product.image,
            size: selectedSize,
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

function changeQuantity(productId, size, delta) {
    const item = cart.find((cartItem) => cartItem.id === productId && cartItem.size === size);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        cart = cart.filter((cartItem) => !(cartItem.id === productId && cartItem.size === size));
    }

    updateCartCount();
    renderCart();
}

function updateCartSize(productId, oldSize, newSize) {
    const item = cart.find((cartItem) => cartItem.id === productId && cartItem.size === oldSize);
    if (!item || oldSize === newSize) return;

    const existingItem = cart.find((cartItem) => cartItem.id === productId && cartItem.size === newSize);

    if (existingItem) {
        existingItem.quantity += item.quantity;
        cart = cart.filter((cartItem) => !(cartItem.id === productId && cartItem.size === oldSize));
    } else {
        item.size = newSize;
    }

    updateCartCount();
    renderCart();
}

function removeFromCart(productId, size) {
    cart = cart.filter((item) => !(item.id === productId && item.size === size));
    updateCartCount();
    renderCart();
}

function openCart() {
    renderCart();
    if (!cartModalInstance) {
        cartModalInstance = new bootstrap.Modal(document.getElementById('cartModal'));
    }
    cartModalInstance.show();
}

function sendWhatsApp() {
    if (cart.length === 0) {
        alert('Please add at least one t-shirt to your cart first.');
        return;
    }

    const username = document.getElementById('cartUsername')?.value.trim();
    const phone = document.getElementById('cartPhone')?.value.trim();

    if (!username || !phone) {
        alert('Please enter your name and phone number in the cart.');
        return;
    }

    const orderReference = generateOrderReference();
    const { orderDate, orderTime } = getOrderDateTime();
    const orderLines = cart.map((item) => `${item.name} [${item.productCode}] (${item.size}) x ${item.quantity}`).join('%0A');
    const total = formatPrice(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    const gymPhone = contactDetails.phone || 'Not available';
    const gymAddress = contactDetails.address || 'Not available';
    const gymMapLink = contactDetails.mapLink || 'Not available';
    const message = `Hi, I want to order these gym t-shirts:%0AOrder Ref: ${encodeURIComponent(orderReference)}%0AOrder Date: ${encodeURIComponent(orderDate)}%0AOrder Time: ${encodeURIComponent(orderTime)}%0A${orderLines}%0A%0AName: ${encodeURIComponent(username)}%0APhone: ${encodeURIComponent(phone)}%0ATotal: ${encodeURIComponent(total)}%0AGym Mobile: ${encodeURIComponent(gymPhone)}%0AGym Address: ${encodeURIComponent(gymAddress)}%0AGoogle Maps: ${encodeURIComponent(gymMapLink)}`;
    const whatsappNumber = contactDetails.whatsappNumber || contactDetails.phone || '';

    if (!whatsappNumber) {
        alert('WhatsApp number is not configured.');
        return;
    }

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
}

async function loadShopData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to fetch data.json');
        }

        const data = await response.json();
        products = Array.isArray(data.products) ? data.products : [];
        contactDetails = {
            ...(data.contact || {}),
            ...((data.shop && typeof data.shop === 'object') ? data.shop : {})
        };
        renderProducts();
        updateCartCount();
    } catch (error) {
        console.warn('Error loading shop data:', error);
        const productList = document.getElementById('productList');
        if (productList) {
            productList.innerHTML = '<p class="text-center text-danger">Unable to load products. Open the site with a local server to use the shop.</p>';
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadShopData();
});
