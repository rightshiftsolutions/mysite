/**
 * WhatsApp Checkout — The Ethnic Co.
 * ─────────────────────────────────────────────────────────────
 * Improvements over v1:
 *  • Separated CSS into Css/whatsapp-checkout.css
 *  • Modal HTML injected dynamically — works on every page
 *    without copy-pasting HTML into each file
 *  • Live order preview refreshes every time modal opens
 *  • Input: name auto-capitalises, mobile strips non-digits
 *  • Keyboard: Enter submits, Escape closes
 *  • Success state shown inside modal before closing
 *  • Toast for empty-cart guard
 *  • Promo-code discount respected in total
 */

(function () {
  "use strict";

  const WA_NUMBER = "919205535096"; // +91 9205535096

  /* ── 1. Inject modal HTML once on DOMContentLoaded ─────── */
  function injectModal() {
    if (document.getElementById("wa-checkout-modal")) return; // already injected

    const WA_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>`;

    const html = `
    <div id="wa-checkout-modal" class="wa-modal" role="dialog" aria-modal="true" aria-labelledby="wa-modal-title">
      <div id="wa-modal-overlay" class="wa-modal-overlay"></div>
      <div class="wa-modal-card">

        <!-- Header -->
        <div class="wa-modal-header">
          <div class="wa-modal-brand">
            <span class="wa-brand-dot"></span>
            THE ETHNIC CO.
          </div>
          <button class="wa-close-btn" id="wa-close-btn" aria-label="Close checkout modal">&#x2715;</button>
        </div>

        <!-- Body -->
        <div class="wa-modal-body">

          <!-- Form state -->
          <div id="wa-form-state">
            <div class="wa-icon-wrap">${WA_SVG}</div>
            <h2 id="wa-modal-title" class="wa-modal-title">Complete Your Order</h2>
            <p class="wa-modal-subtitle">We'll send your order to WhatsApp for quick confirmation.</p>

            <!-- Live order preview -->
            <div class="wa-order-preview" id="wa-order-preview" aria-label="Order summary"></div>

            <!-- Name -->
            <div class="wa-form-group">
              <label class="wa-label" for="wa-customer-name">Full Name</label>
              <div class="wa-input-wrap" id="wa-name-wrap">
                <span class="wa-input-icon" aria-hidden="true">👤</span>
                <input
                  type="text"
                  id="wa-customer-name"
                  class="wa-input"
                  placeholder="e.g. Arjun Sharma"
                  autocomplete="name"
                  maxlength="60"
                  aria-required="true"
                />
              </div>
              <span class="wa-field-error" id="wa-name-error" role="alert"></span>
            </div>

            <!-- Mobile -->
            <div class="wa-form-group">
              <label class="wa-label" for="wa-customer-mobile">Mobile Number</label>
              <div class="wa-input-wrap" id="wa-mobile-wrap">
                <span class="wa-input-icon wa-prefix" aria-hidden="true">+91</span>
                <input
                  type="tel"
                  id="wa-customer-mobile"
                  class="wa-input wa-input-mobile"
                  placeholder="98765 43210"
                  maxlength="10"
                  inputmode="numeric"
                  autocomplete="tel"
                  aria-required="true"
                />
              </div>
              <span class="wa-field-error" id="wa-mobile-error" role="alert"></span>
            </div>

            <!-- Send button -->
            <button id="wa-send-btn" class="wa-send-btn" type="button">
              ${WA_SVG}
              Send via WhatsApp
            </button>

            <p class="wa-privacy-note">🔒 Your details are only shared with our store team.</p>
          </div>

          <!-- Success state (shown after redirect) -->
          <div id="wa-success-state" class="wa-success-state">
            <div class="wa-success-icon">✅</div>
            <h3 class="wa-success-title">WhatsApp Opened!</h3>
            <p class="wa-success-text">Your order has been sent. Our team will confirm it shortly.</p>
          </div>

        </div>
      </div>
    </div>

    <!-- Toast -->
    <div id="cart-toast" class="cart-toast" role="status" aria-live="polite"></div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
    bindModalEvents();
  }

  /* ── 2. Bind all modal events ───────────────────────────── */
  function bindModalEvents() {
    // Close button
    document
      .getElementById("wa-close-btn")
      .addEventListener("click", closeWAModal);

    // Overlay click
    document
      .getElementById("wa-modal-overlay")
      .addEventListener("click", closeWAModal);

    // Send button
    document
      .getElementById("wa-send-btn")
      .addEventListener("click", sendToWhatsApp);

    // Mobile: digits only
    const mobileInput = document.getElementById("wa-customer-mobile");
    mobileInput.addEventListener("input", () => {
      mobileInput.value = mobileInput.value.replace(/\D/g, "").slice(0, 10);
    });

    // Name: auto-capitalise first letter of each word
    const nameInput = document.getElementById("wa-customer-name");
    nameInput.addEventListener("blur", () => {
      nameInput.value = nameInput.value
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    });

    // Keyboard: Enter = submit, Escape = close
    document.addEventListener("keydown", (e) => {
      const modal = document.getElementById("wa-checkout-modal");
      if (!modal || !modal.classList.contains("active")) return;
      if (e.key === "Escape") closeWAModal();
      if (e.key === "Enter") sendToWhatsApp();
    });
  }

  /* ── 3. Open modal ──────────────────────────────────────── */
  window.checkout = function () {
    // Guard: need items in cart
    if (!window.shoppingBag || window.shoppingBag.length === 0) {
      showToast("Your bag is empty. Add items before checking out. 🛍️");
      return;
    }

    const modal = document.getElementById("wa-checkout-modal");
    if (!modal) return;

    // Reset to form state
    document.getElementById("wa-form-state").style.display = "block";
    document.getElementById("wa-success-state").classList.remove("active");

    // Clear previous inputs & errors
    document.getElementById("wa-customer-name").value = "";
    document.getElementById("wa-customer-mobile").value = "";
    clearErrors();

    // Populate live order preview
    fillOrderPreview();

    modal.classList.add("active");
    // Lock background scroll
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.dataset.scrollY = scrollY;

    // Focus first input
    setTimeout(() => {
      document.getElementById("wa-customer-name").focus();
    }, 350);
  };

  /* ── 4. Close modal ─────────────────────────────────────── */
  function closeWAModal() {
    const modal = document.getElementById("wa-checkout-modal");
    if (modal) modal.classList.remove("active");
    // Restore background scroll
    const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollY);
  }
  window.closeWAModal = closeWAModal;

  /* ── 5. Fill order preview ──────────────────────────────── */
  function fillOrderPreview() {
    const preview = document.getElementById("wa-order-preview");
    if (!preview || !window.shoppingBag) return;

    let subtotal = 0;
    let html = "";

    window.shoppingBag.forEach((item) => {
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      html += `<div class="wa-preview-row">
        <span class="wa-preview-name" title="${item.name}">${item.name}</span>
        <span class="wa-preview-qty">×${item.quantity}</span>
        <span class="wa-preview-price">₹${lineTotal.toLocaleString("en-IN")}</span>
      </div>`;
    });

    // Respect promo discount
    let discount = 5000;
    if (window.promoCode && window.promoCode.discount) {
      discount = Math.round((subtotal * window.promoCode.discount) / 100);
    }
    const total = Math.max(0, subtotal - discount);

    html += `<div class="wa-preview-total">
      <span>Total Payable</span>
      <span>₹${total.toLocaleString("en-IN")}</span>
    </div>`;

    preview.innerHTML = html;
  }

  /* ── 6. Validate ────────────────────────────────────────── */
  function clearErrors() {
    ["wa-name-error", "wa-mobile-error"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    });
    ["wa-name-wrap", "wa-mobile-wrap"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("has-error");
    });
  }

  function validate(name, mobile) {
    clearErrors();
    let ok = true;

    if (!name || name.length < 2) {
      document.getElementById("wa-name-error").textContent =
        "Please enter your full name.";
      document.getElementById("wa-name-wrap").classList.add("has-error");
      ok = false;
    }

    const digits = mobile.replace(/\D/g, "");
    if (digits.length !== 10) {
      document.getElementById("wa-mobile-error").textContent =
        "Enter a valid 10-digit mobile number.";
      document.getElementById("wa-mobile-wrap").classList.add("has-error");
      ok = false;
    }

    return ok;
  }

  /* ── 7. Build WhatsApp message & redirect ───────────────── */
  function sendToWhatsApp() {
    const name = (
      document.getElementById("wa-customer-name").value || ""
    ).trim();
    const mobile = (
      document.getElementById("wa-customer-mobile").value || ""
    ).trim();

    if (!validate(name, mobile)) return;

    // Calculate totals
    let subtotal = 0;
    window.shoppingBag.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    let discount = 5000;
    if (window.promoCode && window.promoCode.discount) {
      discount = Math.round((subtotal * window.promoCode.discount) / 100);
    }
    const total = Math.max(0, subtotal - discount);

    // Build message
    const divider = "━━━━━━━━━━━━━━━━━━━━━━";
    let itemLines = "";
    window.shoppingBag.forEach((item) => {
      itemLines += `\n🔸 *${item.name}*`;
      itemLines += `\n   Qty: ${item.quantity}  |  ₹${item.price.toLocaleString("en-IN")} each`;
      itemLines += `\n   Line Total: ₹${(item.price * item.quantity).toLocaleString("en-IN")}\n`;
    });

    const promoLine =
      window.promoCode && discount > 0
        ? `\n   Promo (${window.promoCode.code}): -₹${discount.toLocaleString("en-IN")}`
        : "";

    const message = `🛍️ *New Order — The Ethnic Co.*
${divider}
👤 *Customer Details*
   Name   : ${name}
   Mobile : +91 ${mobile}
${divider}
📦 *Order Items*
${itemLines}
${divider}
💰 *Price Summary*
   Subtotal : ₹${subtotal.toLocaleString("en-IN")}${promoLine}
   Delivery : FREE ✅
${divider}
✅ *Total Payable : ₹${total.toLocaleString("en-IN")}*
${divider}
_Please confirm this order. Our team will reach out shortly._
🙏 Thank you for choosing *The Ethnic Co.*!`;

    const waURL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

    // Animate button
    const btn = document.getElementById("wa-send-btn");
    btn.disabled = true;
    btn.innerHTML = '<span class="wa-btn-spinner"></span> Opening WhatsApp…';

    setTimeout(() => {
      window.open(waURL, "_blank");

      // Show success state inside modal
      document.getElementById("wa-form-state").style.display = "none";
      document.getElementById("wa-success-state").classList.add("active");

      // Auto-close after 2.5s
      setTimeout(closeWAModal, 2500);

      // Reset button for next use
      btn.disabled = false;
      btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Send via WhatsApp`;
    }, 900);
  }

  /* ── 8. Toast helper ────────────────────────────────────── */
  function showToast(msg) {
    let toast = document.getElementById("cart-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "cart-toast";
      toast.className = "cart-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  /* ── 9. Init on DOM ready ───────────────────────────────── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectModal);
  } else {
    injectModal();
  }
})();
