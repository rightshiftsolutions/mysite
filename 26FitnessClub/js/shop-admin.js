/**
 * 26fitnessClub - Simple Shop Admin
 * Generic product admin for any shop item type.
 * Sends only newly added product JSON to WhatsApp.
 * Product JSON stores only relative image paths, never embedded image data.
 */

let shopAdminData = null;
let existingProducts = [];
let pendingProducts = [];
let draftUploadedImages = [];

const FALLBACK_SHOP_DATA = {
    pageTitle: 'Gym Shop',
    categories: [
        { value: 'all', label: 'All' }
    ],
    shop: {
        currencySymbol: 'Rs.',
        whatsappNumber: '',
        fallbackProductName: 'Gym Product',
        optionLabel: 'Option',
        typeLabel: 'Type',
        brandLabel: 'Brand',
        materialLabel: 'Material'
    }
};

const LARGE_MESSAGE_WARNING_LENGTH = 12000;

const elements = {};

document.addEventListener('DOMContentLoaded', async () => {
    cacheElements();
    bindEvents();
    await loadShopAdminData();
    renderAll();
});

function cacheElements() {
    elements.form = document.getElementById('shopAdminForm');
    elements.productName = document.getElementById('productName');
    elements.productCategory = document.getElementById('productCategory');
    elements.productType = document.getElementById('productType');
    elements.productPrice = document.getElementById('productPrice');
    elements.optionLabel = document.getElementById('optionLabel');
    elements.productOptions = document.getElementById('productOptions');
    elements.productDescription = document.getElementById('productDescription');
    elements.productImageUrl = document.getElementById('productImageUrl');
    elements.productImages = document.getElementById('productImages');

    elements.productCode = document.getElementById('productCode');
    elements.productBrand = document.getElementById('productBrand');
    elements.productMaterial = document.getElementById('productMaterial');
    elements.productBadge = document.getElementById('productBadge');
    elements.productHighlights = document.getElementById('productHighlights');
    elements.productSpecs = document.getElementById('productSpecs');

    elements.categoryOptions = document.getElementById('categoryOptions');
    elements.typeOptions = document.getElementById('typeOptions');
    elements.imageThumbnailStrip = document.getElementById('imageThumbnailStrip');
    elements.pendingProductsContainer = document.getElementById('pendingProductsContainer');

    elements.addProductButton = document.getElementById('addProductButton');
    elements.resetDraftButton = document.getElementById('resetDraftButton');
    elements.submitWhatsappButton = document.getElementById('submitWhatsappButton');
    elements.downloadJsonButton = document.getElementById('downloadJsonButton');

    elements.existingProductCount = document.getElementById('existingProductCount');
    elements.pendingProductCount = document.getElementById('pendingProductCount');
    elements.whatsappTarget = document.getElementById('whatsappTarget');
    elements.loadState = document.getElementById('loadState');
    elements.messageCounter = document.getElementById('messageCounter');
    elements.messageWarning = document.getElementById('messageWarning');
}

function bindEvents() {
    if (elements.productImages) {
        elements.productImages.addEventListener('change', handleImageUploadChange);
    }

    if (elements.addProductButton) {
        elements.addProductButton.addEventListener('click', addDraftProduct);
    }

    if (elements.resetDraftButton) {
        elements.resetDraftButton.addEventListener('click', () => resetDraft(true));
    }

    if (elements.submitWhatsappButton) {
        elements.submitWhatsappButton.addEventListener('click', submitToWhatsApp);
    }

    if (elements.downloadJsonButton) {
        elements.downloadJsonButton.addEventListener('click', downloadRequestJson);
    }
}

async function loadShopAdminData() {
    try {
        const response = await fetch('shop.json');

        if (!response.ok) {
            throw new Error(`Unable to load shop.json (${response.status})`);
        }

        const data = await response.json();
        shopAdminData = mergeShopAdminData(data);
        existingProducts = Array.isArray(data?.products) ? data.products.slice() : [];

        if (elements.loadState) {
            elements.loadState.innerHTML = `
                <i class="fas fa-circle-check me-2"></i>
                Loaded <code>shop.json</code>. Existing products stay untouched. This admin sends only the newly added products.
            `;
        }
    } catch (error) {
        console.warn('Failed to load shop admin data:', error);
        shopAdminData = mergeShopAdminData({});
        existingProducts = [];

        if (elements.loadState) {
            elements.loadState.innerHTML = `
                <i class="fas fa-triangle-exclamation me-2"></i>
                Could not load <code>shop.json</code>. You can still prepare a new product request, but please open the site through a local server for live data.
            `;
        }
    }

    populateCategorySuggestions();
    populateTypeSuggestions();
    updateHeaderMetrics();
}

function mergeShopAdminData(data) {
    const incoming = data && typeof data === 'object' ? data : {};

    return {
        ...FALLBACK_SHOP_DATA,
        ...incoming,
        categories: Array.isArray(incoming.categories) && incoming.categories.length
            ? incoming.categories
            : FALLBACK_SHOP_DATA.categories,
        shop: {
            ...FALLBACK_SHOP_DATA.shop,
            ...(incoming.shop || {})
        }
    };
}

function populateCategorySuggestions() {
    if (!elements.categoryOptions) return;

    const categoryValues = new Set();

    (Array.isArray(shopAdminData?.categories) ? shopAdminData.categories : []).forEach((item) => {
        if (typeof item === 'string') {
            const normalized = normalizeCategory(item);
            if (normalized && normalized !== 'all') categoryValues.add(normalized);
            return;
        }

        const normalized = normalizeCategory(item?.value || item?.key || item?.label);
        if (normalized && normalized !== 'all') categoryValues.add(normalized);
    });

    [...existingProducts, ...pendingProducts].forEach((product) => {
        const normalized = normalizeCategory(product?.category);
        if (normalized && normalized !== 'all') categoryValues.add(normalized);
    });

    elements.categoryOptions.innerHTML = [...categoryValues]
        .sort((a, b) => a.localeCompare(b))
        .map((value) => `<option value="${escapeHtml(value)}"></option>`)
        .join('');
}

function populateTypeSuggestions() {
    if (!elements.typeOptions) return;

    const typeValues = new Set();

    [...existingProducts, ...pendingProducts].forEach((product) => {
        const typeValue = String(product?.type || '').trim();
        if (typeValue) typeValues.add(typeValue);
    });

    elements.typeOptions.innerHTML = [...typeValues]
        .sort((a, b) => a.localeCompare(b))
        .map((value) => `<option value="${escapeHtml(value)}"></option>`)
        .join('');
}

function updateHeaderMetrics() {
    if (elements.existingProductCount) {
        elements.existingProductCount.textContent = String(existingProducts.length);
    }

    if (elements.pendingProductCount) {
        elements.pendingProductCount.textContent = String(pendingProducts.length);
    }

    if (elements.whatsappTarget) {
        const number = shopAdminData?.shop?.whatsappNumber
            ? String(shopAdminData.shop.whatsappNumber)
            : 'Missing';
        elements.whatsappTarget.textContent = number;
    }
}

function handleImageUploadChange(event) {
    const files = Array.from(event.target.files || []);

    draftUploadedImages = files.map((file) => ({
        file,
        name: getFileNameOnly(file?.name || ''),
        type: file?.type || 'image/*',
        size: Number(file?.size || 0),
        relativePath: buildRelativeImagePathFromFile(file?.name || '')
    }));

    if (
        elements.productImageUrl
        && !String(elements.productImageUrl.value || '').trim()
        && draftUploadedImages[0]?.relativePath
    ) {
        elements.productImageUrl.value = draftUploadedImages[0].relativePath;
    }

    renderImageThumbnails();
    updateMessageMetrics();
}

function normalizeCategory(value) {
    return String(value || '').trim().toLowerCase();
}

function formatCategoryLabel(value) {
    return String(value || '')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());
}

function parseCommaList(value) {
    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function parseSpecs(value) {
    return String(value || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const parts = line.match(/^([^:=-]+)\s*[:=-]\s*(.+)$/);

            if (!parts) {
                return {
                    label: 'Detail',
                    value: line
                };
            }

            return {
                label: parts[1].trim(),
                value: parts[2].trim()
            };
        })
        .filter((item) => item.label && item.value);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getCurrencySymbol() {
    return shopAdminData?.shop?.currencySymbol || FALLBACK_SHOP_DATA.shop.currencySymbol;
}

function formatPrice(value) {
    const number = Number(value || 0);
    return `${getCurrencySymbol()} ${Number.isFinite(number) ? number : 0}`;
}

function buildCodeToken(value) {
    const token = normalizeCategory(value).replace(/[^a-z0-9]/g, '').slice(0, 3).toUpperCase();
    return token || 'GEN';
}

function suggestProductCode(category, type, nextId) {
    return `${buildCodeToken(type || 'prd')}-${buildCodeToken(category || 'shop')}-${String(nextId).padStart(3, '0')}`;
}

function nextProductId() {
    const existingIds = existingProducts
        .map((product) => Number(product?.id))
        .filter((value) => Number.isFinite(value));

    const pendingIds = pendingProducts
        .map((product) => Number(product?.id))
        .filter((value) => Number.isFinite(value));

    const maxExisting = existingIds.length ? Math.max(...existingIds) : 0;
    const maxPending = pendingIds.length ? Math.max(...pendingIds) : 0;
    return Math.max(maxExisting, maxPending) + 1;
}

function inferOptionLabel(type, category, options) {
    if (!options.length) return '';

    const source = `${type || ''} ${category || ''}`.toLowerCase();

    if (source.includes('shoe') || source.includes('footwear') || source.includes('sneaker')) {
        return 'Size';
    }

    if (source.includes('protein') || source.includes('supplement') || source.includes('powder') || source.includes('capsule')) {
        return 'Pack';
    }

    if (source.includes('shirt') || source.includes('hoodie') || source.includes('short') || source.includes('apparel') || source.includes('wear')) {
        return 'Size';
    }

    return shopAdminData?.shop?.optionLabel || FALLBACK_SHOP_DATA.shop.optionLabel;
}

function removeEmptyValues(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => removeEmptyValues(item))
            .filter((item) => {
                if (item === null || item === undefined || item === '') return false;
                if (Array.isArray(item) && item.length === 0) return false;
                if (typeof item === 'object' && !Array.isArray(item) && Object.keys(item).length === 0) return false;
                return true;
            });
    }

    if (value && typeof value === 'object') {
        return Object.entries(value).reduce((accumulator, [key, currentValue]) => {
            const cleanedValue = removeEmptyValues(currentValue);

            if (cleanedValue === null || cleanedValue === undefined || cleanedValue === '') {
                return accumulator;
            }

            if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
                return accumulator;
            }

            if (
                typeof cleanedValue === 'object'
                && !Array.isArray(cleanedValue)
                && Object.keys(cleanedValue).length === 0
            ) {
                return accumulator;
            }

            accumulator[key] = cleanedValue;
            return accumulator;
        }, {});
    }

    return value;
}

function getFileNameOnly(value) {
    return String(value || '')
        .replace(/\\/g, '/')
        .split('/')
        .pop()
        .trim();
}

function buildRelativeImagePathFromFile(fileName) {
    const safeName = getFileNameOnly(fileName) || `product-image-${Date.now()}.jpg`;
    return `images/${safeName}`;
}

function normalizeRelativeImagePath(value) {
    let path = String(value || '').trim();

    if (!path) return '';
    if (/^(https?:)?\/\//i.test(path)) return '';

    path = path.replace(/\\/g, '/');
    path = path.replace(/^\.?\//, '');

    const segments = path
        .split('/')
        .map((segment) => segment.trim())
        .filter((segment) => segment && segment !== '.' && segment !== '..');

    if (!segments.length) return '';

    const fileName = getFileNameOnly(segments.pop());
    if (!fileName) return '';

    if (!segments.length) {
        return `images/${fileName}`;
    }

    return `${segments.join('/')}/${fileName}`;
}

function getDraftImagePaths() {
    const paths = [];
    const manualPath = normalizeRelativeImagePath(elements.productImageUrl?.value);

    if (manualPath) {
        paths.push(manualPath);
    }

    draftUploadedImages.forEach((image) => {
        if (image?.relativePath) {
            paths.push(image.relativePath);
        }
    });

    return [...new Set(paths)];
}

function getDraftPrimaryImage() {
    const imagePaths = getDraftImagePaths();
    return imagePaths[0] || '';
}

function getDraftImageCollection() {
    return getDraftImagePaths();
}

function getCurrentDraft() {
    const name = elements.productName?.value.trim() || '';
    const category = normalizeCategory(elements.productCategory?.value.trim()) || '';
    const type = elements.productType?.value.trim();
    const priceValue = Number(elements.productPrice?.value || 0);
    const options = parseCommaList(elements.productOptions?.value);
    const optionLabelInput = elements.optionLabel?.value.trim();
    const optionLabel = optionLabelInput || inferOptionLabel(type, category, options);
    const productId = nextProductId();
    const imagePaths = getDraftImageCollection();
    const imageFiles = draftUploadedImages.map((item) => ({
        file: item.file,
        name: item.name,
        type: item.type,
        size: item.size,
        relativePath: item.relativePath
    }));

    const product = {
        id: productId,
        name,
        category,
        type,
        price: Number.isFinite(priceValue) ? priceValue : 0,
        productCode: elements.productCode?.value.trim() || suggestProductCode(category, type || name, productId),
        brand: elements.productBrand?.value.trim(),
        material: elements.productMaterial?.value.trim(),
        badge: elements.productBadge?.value.trim(),
        optionLabel,
        options,
        description: elements.productDescription?.value.trim(),
        highlights: parseCommaList(elements.productHighlights?.value),
        specs: parseSpecs(elements.productSpecs?.value),
        image: getDraftPrimaryImage(),
        images: imagePaths.length > 1 ? imagePaths : []
    };

    if (options.length && String(optionLabel).trim().toLowerCase() === 'size') {
        product.sizes = [...options];
    }

    const cleanedProduct = removeEmptyValues(product);

    if (imageFiles.length) {
        cleanedProduct.__imageFiles = imageFiles;
    }

    return cleanedProduct;
}

function validateDraft(product) {
    if (!product.name) {
        alert('Please enter a product name.');
        return false;
    }

    if (!product.category) {
        alert('Please enter a category.');
        return false;
    }

    if (!Number.isFinite(Number(product.price)) || Number(product.price) < 0) {
        alert('Please enter a valid price.');
        return false;
    }

    const rawImagePath = String(elements.productImageUrl?.value || '').trim();
    if (rawImagePath && !normalizeRelativeImagePath(rawImagePath)) {
        alert('Please use a relative image path like images/product-name.jpg.');
        return false;
    }

    const imagePaths = getDraftImageCollection();
    if (!imagePaths.length) {
        alert('Please enter an image relative path or choose image files for WhatsApp.');
        return false;
    }

    const usedCodes = new Set(
        [...existingProducts, ...pendingProducts]
            .map((item) => String(item?.productCode || '').trim().toLowerCase())
            .filter(Boolean)
    );

    if (product.productCode && usedCodes.has(String(product.productCode).trim().toLowerCase())) {
        alert('This product code already exists. Please use a unique code or leave it blank to auto-generate one.');
        return false;
    }

    return true;
}

function addDraftProduct() {
    const draftProduct = getCurrentDraft();
    if (!validateDraft(draftProduct)) return;

    pendingProducts.push({
        ...draftProduct,
        requestedAt: new Date().toISOString()
    });

    populateCategorySuggestions();
    populateTypeSuggestions();
    resetDraft(false);
    renderAll();
}

function resetDraft(shouldRender = true) {
    if (elements.form) {
        elements.form.reset();
    }

    draftUploadedImages = [];

    if (elements.productImages) {
        elements.productImages.value = '';
    }

    if (elements.imageThumbnailStrip) {
        elements.imageThumbnailStrip.innerHTML = '';
    }

    if (shouldRender) {
        renderAll();
    } else {
        renderImageThumbnails();
    }
}

function removePendingProduct(index) {
    pendingProducts = pendingProducts.filter((_, itemIndex) => itemIndex !== index);
    populateCategorySuggestions();
    populateTypeSuggestions();
    renderAll();
}

function getProductOptionValues(product) {
    const possibleSources = [
        product?.options,
        product?.optionValues,
        product?.variants,
        product?.sizes
    ];

    for (const source of possibleSources) {
        if (Array.isArray(source) && source.length) {
            return source
                .map((item) => String(item || '').trim())
                .filter(Boolean);
        }
    }

    return [];
}

function getProductOptionLabel(product) {
    if (product?.optionLabel) return String(product.optionLabel).trim();
    if (Array.isArray(product?.sizes) && product.sizes.length) return 'Size';
    return shopAdminData?.shop?.optionLabel || FALLBACK_SHOP_DATA.shop.optionLabel;
}

function getAllProductImagePaths(product) {
    const paths = [];

    if (product && typeof product.image === 'string' && product.image.trim()) {
        paths.push(product.image.trim());
    }

    if (product && Array.isArray(product.images)) {
        product.images.forEach((path) => {
            if (typeof path === 'string' && path.trim()) {
                paths.push(path.trim());
            }
        });
    }

    return [...new Set(paths)];
}

function renderImageThumbnails() {
    if (!elements.imageThumbnailStrip) return;

    if (!draftUploadedImages.length) {
        elements.imageThumbnailStrip.innerHTML = '';
        return;
    }

    elements.imageThumbnailStrip.innerHTML = `
        <div class="option-row">
            ${draftUploadedImages.map((image) => `
                <span class="option-chip">
                    <i class="fas fa-paperclip"></i>
                    ${escapeHtml(image.name)} → ${escapeHtml(image.relativePath)}
                </span>
            `).join('')}
        </div>
    `;
}

function renderPendingProducts() {
    if (!elements.pendingProductsContainer) return;

    if (!pendingProducts.length) {
        elements.pendingProductsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open mb-2 d-block fs-4"></i>
                No products added yet. Fill the simple form and click <strong>Add Product</strong>.
            </div>
        `;
        return;
    }

    elements.pendingProductsContainer.innerHTML = pendingProducts.map((product, index) => {
        const optionValues = getProductOptionValues(product);
        const optionLabel = getProductOptionLabel(product);
        const description = product.description
            ? `<p class="pending-description">${escapeHtml(product.description)}</p>`
            : '';
        const imagePaths = getAllProductImagePaths(product);
        const pendingFiles = Array.isArray(product.__imageFiles) ? product.__imageFiles : [];

        return `
            <div class="pending-card">
                <button class="remove-pending" type="button" data-remove-index="${index}" aria-label="Remove product">
                    <i class="fas fa-trash"></i>
                </button>

                <div class="pending-image d-flex align-items-center justify-content-center text-accent" style="display:flex;align-items:center;justify-content:center;font-size:1.7rem;">
                    <i class="fas fa-box"></i>
                </div>

                <div>
                    <div class="pending-title">${escapeHtml(product.name || 'New Product')}</div>

                    <div class="pending-meta">
                        <span class="meta-pill"><i class="fas fa-tag"></i>${escapeHtml(formatPrice(product.price || 0))}</span>
                        <span class="meta-pill"><i class="fas fa-layer-group"></i>${escapeHtml(formatCategoryLabel(product.category))}</span>
                        ${product.type ? `<span class="meta-pill"><i class="fas fa-cube"></i>${escapeHtml(product.type)}</span>` : ''}
                        ${product.productCode ? `<span class="meta-pill"><i class="fas fa-hashtag"></i>${escapeHtml(product.productCode)}</span>` : ''}
                    </div>

                    ${description}

                    ${optionValues.length ? `
                        <div class="option-row">
                            <span class="option-chip"><strong>${escapeHtml(optionLabel)}:</strong></span>
                            ${optionValues.map((option) => `<span class="option-chip">${escapeHtml(option)}</span>`).join('')}
                        </div>
                    ` : ''}

                    ${imagePaths.length ? `
                        <div class="option-row">
                            ${imagePaths.map((path) => `
                                <span class="option-chip"><i class="fas fa-image"></i>${escapeHtml(path)}</span>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${pendingFiles.length ? `
                        <div class="option-row">
                            <span class="option-chip"><i class="fab fa-whatsapp"></i>${pendingFiles.length} image file${pendingFiles.length > 1 ? 's' : ''} ready for WhatsApp</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    elements.pendingProductsContainer.querySelectorAll('[data-remove-index]').forEach((button) => {
        button.addEventListener('click', () => {
            const index = Number(button.getAttribute('data-remove-index'));
            if (Number.isFinite(index)) {
                removePendingProduct(index);
            }
        });
    });
}

function serializeProductForRequest(product) {
    const { __imageFiles, requestedAt, ...serializableProduct } = product || {};
    return removeEmptyValues(JSON.parse(JSON.stringify(serializableProduct)));
}

function buildRequestPayload() {
    return {
        requestType: 'add_products',
        targetFile: 'shop.json',
        generatedAt: new Date().toISOString(),
        totalNewProducts: pendingProducts.length,
        newProducts: pendingProducts.map((product) => serializeProductForRequest(product))
    };
}

function buildWhatsappMessage() {
    const payload = buildRequestPayload();
    return JSON.stringify(payload, null, 2);
}

function updateMessageMetrics() {
    const message = buildWhatsappMessage();
    const length = message.length;

    if (elements.messageCounter) {
        elements.messageCounter.innerHTML = `JSON size: <strong>${length.toLocaleString()}</strong> characters`;
    }

    if (elements.messageWarning) {
        elements.messageWarning.classList.toggle('d-none', length < LARGE_MESSAGE_WARNING_LENGTH);
    }
}

function renderAll() {
    updateHeaderMetrics();
    renderImageThumbnails();
    renderPendingProducts();
    updateMessageMetrics();
}

function collectPendingImageEntries() {
    const imageMap = new Map();

    pendingProducts.forEach((product) => {
        (Array.isArray(product?.__imageFiles) ? product.__imageFiles : []).forEach((entry) => {
            if (!entry?.file) return;
            const key = `${entry.relativePath || ''}::${entry.name || ''}`;
            if (!imageMap.has(key)) {
                imageMap.set(key, entry);
            }
        });
    });

    return [...imageMap.values()];
}

async function copyTextToClipboard(value) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) return false;

    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch (error) {
        console.warn('Clipboard write failed:', error);
        return false;
    }
}

function downloadRequestJson() {
    if (!pendingProducts.length) {
        alert('Please add at least one new product before downloading the request.');
        return;
    }

    const payload = buildRequestPayload();
    const jsonText = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonText], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = downloadUrl;
    anchor.download = 'new-shop-products-request.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(downloadUrl), 2500);
}

async function submitToWhatsApp() {
    const whatsappNumber = shopAdminData?.shop?.whatsappNumber
        ? String(shopAdminData.shop.whatsappNumber).replace(/\D/g, '')
        : '';

    if (!whatsappNumber) {
        alert('WhatsApp number is missing in shop.json.');
        return;
    }

    if (!pendingProducts.length) {
        alert('Please add at least one new product before submitting the request.');
        return;
    }

    const message = buildWhatsappMessage();
    const imageEntries = collectPendingImageEntries();
    const shareableFiles = imageEntries
        .map((entry) => entry.file)
        .filter((file) => file instanceof File);

    const canShareWithFiles = Boolean(
        shareableFiles.length
        && navigator.share
        && navigator.canShare
        && navigator.canShare({ files: shareableFiles })
    );

    if (canShareWithFiles) {
        try {
            await navigator.share({
                title: 'New Shop Products Request',
                text: message,
                files: shareableFiles
            });
            return;
        } catch (error) {
            if (error?.name === 'AbortError') {
                return;
            }

            console.warn('File share failed, falling back to WhatsApp link:', error);
        }
    }

    const copied = message.length >= LARGE_MESSAGE_WARNING_LENGTH
        ? await copyTextToClipboard(message)
        : false;

    const encodedMessage = encodeURIComponent(
        copied
            ? 'New shop products JSON was copied to clipboard. Please paste it into this chat.'
            : message
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');

    if (imageEntries.length) {
        const attachmentList = imageEntries
            .map((entry) => `- ${entry.name} -> ${entry.relativePath}`)
            .join('\n');

        alert(
            `WhatsApp has been opened.\n\n` +
            `${copied ? 'The JSON was copied to your clipboard because it is too long for a WhatsApp link.\n\n' : ''}` +
            `Attach these image files separately in WhatsApp if they were not shared automatically:\n${attachmentList}`
        );
    } else if (copied) {
        alert('WhatsApp has been opened and the JSON was copied to your clipboard. Paste it into the chat.');
    }
}
