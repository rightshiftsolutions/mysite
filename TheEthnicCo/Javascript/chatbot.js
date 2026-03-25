/**
 * WhatsApp-Style Guided Chatbot — The Ethnic Co.
 * Brown #511d00 · Gold #c5a059 · Cream #f8ecd7
 * Features: guided flow, free typing, typing animation,
 *           localStorage history, "Continue on WhatsApp" CTA
 */
(function () {
  "use strict";

  const WA_NUMBER = "919205535096";
  const STORAGE_KEY = "ethnicco_chat_history";
  const BOT_DELAY = 900; // ms before bot replies

  /* ── Conversation Tree ─────────────────────────────────── */
  const FLOW = {
    start: {
      bot: "Hi 👋 Welcome to *The Ethnic Co.* How can we help you today?",
      options: [
        { label: "👘 View Sherwani",    next: "sherwani"    },
        { label: "👕 View Kurta",       next: "kurta"       },
        { label: "🕴️ Indo Western",     next: "indowestern" },
        { label: "📦 Track Order",      next: "track"       },
        { label: "💬 Talk to Support",  next: "support"     },
      ],
    },
    sherwani: {
      bot: "Here are our premium Sherwani collections 🎩✨ What are you looking for?",
      options: [
        { label: "💰 Budget under ₹10k",   next: "sherwani_budget"  },
        { label: "👑 Premium Collection",   next: "sherwani_premium" },
        { label: "💍 Wedding Special",      next: "sherwani_wedding" },
        { label: "⬅️ Back to Menu",         next: "start"            },
      ],
    },
    sherwani_budget: {
      bot: "Great choice! 🙌 Our budget-friendly Sherwanis start from ₹4,999. Beautifully crafted without breaking the bank. Tap below to explore!",
      link: { label: "🛍️ Shop Budget Sherwanis", url: "sherwani.html" },
      options: [
        { label: "🔙 Back to Sherwani",  next: "sherwani" },
        { label: "🏠 Main Menu",         next: "start"    },
      ],
    },
    sherwani_premium: {
      bot: "Our Premium Sherwanis are crafted with pure silk, zari work & hand embroidery — starting from ₹15,999. A true statement of elegance 👑",
      link: { label: "🛍️ Shop Premium Sherwanis", url: "sherwani.html" },
      options: [
        { label: "🔙 Back to Sherwani",  next: "sherwani" },
        { label: "🏠 Main Menu",         next: "start"    },
      ],
    },
    sherwani_wedding: {
      bot: "Our Wedding Special Sherwanis are designed for the big day 💍 Rich fabrics, intricate embroidery, and custom tailoring available. Starting ₹24,999.",
      link: { label: "💍 Explore Wedding Sherwanis", url: "sherwani.html" },
      options: [
        { label: "✂️ Custom Tailoring?",  next: "tailoring" },
        { label: "🔙 Back to Sherwani",   next: "sherwani"  },
        { label: "🏠 Main Menu",          next: "start"     },
      ],
    },
    kurta: {
      bot: "Explore our latest Kurta designs 👕 From casual to festive — we have it all!",
      options: [
        { label: "🎉 Festive Kurtas",    next: "kurta_festive"  },
        { label: "😎 Casual Kurtas",     next: "kurta_casual"   },
        { label: "🧥 Kurta with Jacket", next: "kurta_jacket"   },
        { label: "⬅️ Back to Menu",      next: "start"          },
      ],
    },
    kurta_festive: {
      bot: "Our Festive Kurtas feature rich fabrics like silk, chanderi & georgette with beautiful prints. Perfect for Diwali, Eid & weddings 🎊",
      link: { label: "🛍️ Shop Festive Kurtas", url: "kurta.html" },
      options: [
        { label: "🔙 Back to Kurta",  next: "kurta" },
        { label: "🏠 Main Menu",      next: "start" },
      ],
    },
    kurta_casual: {
      bot: "Comfortable, stylish & everyday-ready. Our Casual Kurtas in cotton & linen blends are perfect for any occasion 😊",
      link: { label: "🛍️ Shop Casual Kurtas", url: "kurta.html" },
      options: [
        { label: "🔙 Back to Kurta",  next: "kurta" },
        { label: "🏠 Main Menu",      next: "start" },
      ],
    },
    kurta_jacket: {
      bot: "The Kurta + Jacket combo is our bestseller! Layered elegance for weddings, receptions & festive events 🧥✨",
      link: { label: "🛍️ Shop Kurta Jackets", url: "kurta-jacket.html" },
      options: [
        { label: "🔙 Back to Kurta",  next: "kurta" },
        { label: "🏠 Main Menu",      next: "start" },
      ],
    },
    indowestern: {
      bot: "Indo Western — where tradition meets modernity 🕴️ Perfect for cocktail parties, receptions & destination weddings.",
      options: [
        { label: "🎩 Bandhgala Sets",    next: "indo_bandhgala" },
        { label: "🌟 Jodhpuri Sets",     next: "indo_jodhpuri"  },
        { label: "🔥 New Arrivals",      next: "indo_new"       },
        { label: "⬅️ Back to Menu",      next: "start"          },
      ],
    },
    indo_bandhgala: {
      bot: "Our Bandhgala sets are a timeless classic — structured, sharp & sophisticated. Available in 12+ colours 🎨",
      link: { label: "🛍️ Shop Bandhgala", url: "indo-western.html" },
      options: [
        { label: "🔙 Back",       next: "indowestern" },
        { label: "🏠 Main Menu", next: "start"        },
      ],
    },
    indo_jodhpuri: {
      bot: "Jodhpuri sets — the royal choice! Inspired by Rajputana heritage with a modern silhouette 👑",
      link: { label: "🛍️ Shop Jodhpuri Sets", url: "jodhpuri.html" },
      options: [
        { label: "🔙 Back",       next: "indowestern" },
        { label: "🏠 Main Menu", next: "start"        },
      ],
    },
    indo_new: {
      bot: "Fresh drops just in! Our latest Indo Western arrivals are flying off the shelves 🔥 Don't miss out.",
      link: { label: "🆕 View New Arrivals", url: "home.html" },
      options: [
        { label: "🔙 Back",       next: "indowestern" },
        { label: "🏠 Main Menu", next: "start"        },
      ],
    },
    track: {
      bot: "To track your order, please share your Order ID on WhatsApp and our team will update you within minutes 📦",
      options: [
        { label: "📲 Track on WhatsApp", next: "wa_redirect" },
        { label: "🏠 Main Menu",         next: "start"       },
      ],
    },
    support: {
      bot: "Our support team is available Mon–Sat, 10am–7pm IST 🙏 How can we help?",
      options: [
        { label: "📏 Size & Fit Help",      next: "support_size"    },
        { label: "🔄 Returns & Exchange",   next: "support_return"  },
        { label: "🚚 Delivery Query",       next: "support_delivery"},
        { label: "📲 Chat on WhatsApp",     next: "wa_redirect"     },
        { label: "🏠 Main Menu",            next: "start"           },
      ],
    },
    support_size: {
      bot: "We offer complimentary custom tailoring on all Sherwanis! For other items, refer to our size chart or chat with us on WhatsApp for a personalised fit guide 📏",
      options: [
        { label: "📲 Chat on WhatsApp",  next: "wa_redirect" },
        { label: "🔙 Back to Support",   next: "support"     },
      ],
    },
    support_return: {
      bot: "We accept returns within 7 days of delivery for unused items in original packaging. Exchange is available for size issues. Contact us on WhatsApp to initiate 🔄",
      options: [
        { label: "📲 Start Return on WhatsApp", next: "wa_redirect" },
        { label: "🔙 Back to Support",          next: "support"     },
      ],
    },
    support_delivery: {
      bot: "We deliver across India in 5–7 business days. Express delivery available in select cities. For live tracking, share your order ID on WhatsApp 🚚",
      options: [
        { label: "📲 Track on WhatsApp",  next: "wa_redirect" },
        { label: "🔙 Back to Support",    next: "support"     },
      ],
    },
    tailoring: {
      bot: "We offer complimentary custom tailoring on all Sherwanis 🎉 Just share your measurements on WhatsApp and our master tailors will handle the rest!",
      options: [
        { label: "📲 Share Measurements on WhatsApp", next: "wa_redirect" },
        { label: "🏠 Main Menu",                      next: "start"       },
      ],
    },
    wa_redirect: {
      bot: null, // handled in code — opens WhatsApp directly
    },
  };

  /* ── State ─────────────────────────────────────────────── */
  let isOpen = false;
  let lastUserQuery = "";
  let history = [];

  /* ── Init ──────────────────────────────────────────────── */
  function init() {
    injectHTML();
    loadHistory();
    bindEvents();
    // If no history, start fresh after a short delay
    if (history.length === 0) {
      setTimeout(() => triggerFlow("start"), 600);
    }
  }

  /* ── Inject HTML ───────────────────────────────────────── */
  function injectHTML() {
    if (document.getElementById("chatbot-fab")) return;

    const WA_ICON = `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

    const SEND_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;

    const html = `
    <!-- Floating Button -->
    <button id="chatbot-fab" aria-label="Open chat" title="Chat with us">
      ${WA_ICON}
      <span class="fab-dot"></span>
    </button>

    <!-- Chat Window -->
    <div id="chatbot-window" role="dialog" aria-label="Chat with The Ethnic Co." aria-modal="true">
      <!-- Header -->
      <div class="cb-header">
        <div class="cb-header-avatar">👘</div>
        <div class="cb-header-info">
          <div class="cb-header-name">THE ETHNIC CO.</div>
          <div class="cb-header-status">
            <span class="cb-status-dot"></span> Online · Typically replies instantly
          </div>
        </div>
        <div class="cb-header-actions">
          <button class="cb-header-btn" id="cb-clear-btn" title="Clear chat" aria-label="Clear chat">🗑️</button>
          <button class="cb-header-btn" id="cb-close-btn" title="Close chat" aria-label="Close chat">✕</button>
        </div>
      </div>

      <!-- Messages -->
      <div class="cb-messages" id="cb-messages">
        <div class="cb-date-divider" id="cb-date-label">Today</div>
      </div>

      <!-- Continue on WhatsApp -->
      <div class="cb-wa-banner" id="cb-wa-banner" role="button" tabindex="0" aria-label="Continue on WhatsApp">
        ${WA_ICON}
        <span class="cb-wa-banner-text">Continue on WhatsApp →</span>
      </div>

      <!-- Input Bar -->
      <div class="cb-input-bar">
        <input
          type="text"
          id="cb-input"
          class="cb-input"
          placeholder="Type a message…"
          autocomplete="off"
          maxlength="200"
          aria-label="Type your message"
        />
        <button class="cb-send-btn" id="cb-send-btn" aria-label="Send message">${SEND_ICON}</button>
      </div>
    </div>`;

    document.body.insertAdjacentHTML("beforeend", html);
  }

  /* ── Bind Events ───────────────────────────────────────── */
  function bindEvents() {
    document.getElementById("chatbot-fab").addEventListener("click", toggleChat);
    document.getElementById("cb-close-btn").addEventListener("click", closeChat);
    document.getElementById("cb-clear-btn").addEventListener("click", clearChat);
    document.getElementById("cb-send-btn").addEventListener("click", handleUserInput);
    document.getElementById("cb-wa-banner").addEventListener("click", openWhatsApp);
    document.getElementById("cb-wa-banner").addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openWhatsApp();
    });

    const input = document.getElementById("cb-input");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
      }
    });
  }

  /* ── Toggle / Open / Close ─────────────────────────────── */
  function toggleChat() {
    isOpen ? closeChat() : openChat();
  }
  function openChat() {
    isOpen = true;
    document.getElementById("chatbot-window").classList.add("open");
    // Remove notification dot once opened
    const dot = document.querySelector("#chatbot-fab .fab-dot");
    if (dot) dot.style.display = "none";
    scrollToBottom();
    setTimeout(() => document.getElementById("cb-input").focus(), 350);
  }
  function closeChat() {
    isOpen = false;
    document.getElementById("chatbot-window").classList.remove("open");
  }
  function clearChat() {
    history = [];
    saveHistory();
    const msgs = document.getElementById("cb-messages");
    msgs.innerHTML = '<div class="cb-date-divider" id="cb-date-label">Today</div>';
    setTimeout(() => triggerFlow("start"), 400);
  }

  /* ── Trigger a flow node ───────────────────────────────── */
  function triggerFlow(nodeKey) {
    if (nodeKey === "wa_redirect") {
      openWhatsApp();
      return;
    }
    const node = FLOW[nodeKey];
    if (!node) return;

    showTyping();
    setTimeout(() => {
      removeTyping();
      if (node.bot) addBotMessage(node.bot);
      if (node.link) addLinkMessage(node.link);
      if (node.options) addOptions(node.options);
      scrollToBottom();
    }, BOT_DELAY);
  }

  /* ── Handle User Free-Type Input ───────────────────────── */
  function handleUserInput() {
    const input = document.getElementById("cb-input");
    const text = input.value.trim();
    if (!text) return;

    addUserMessage(text);
    lastUserQuery = text;
    input.value = "";

    // Simple keyword matching
    const lower = text.toLowerCase();
    let matched = "start";

    if (/sherwani|sherwa/i.test(lower))          matched = "sherwani";
    else if (/kurta/i.test(lower))               matched = "kurta";
    else if (/indo|western|bandhgala|jodhpuri/i.test(lower)) matched = "indowestern";
    else if (/track|order|status/i.test(lower))  matched = "track";
    else if (/support|help|return|exchange|size|delivery/i.test(lower)) matched = "support";
    else if (/tailor|custom|measurement/i.test(lower)) matched = "tailoring";
    else if (/whatsapp|wa|chat/i.test(lower))    matched = "wa_redirect";
    else {
      // Fallback: friendly unknown response
      showTyping();
      setTimeout(() => {
        removeTyping();
        addBotMessage("I'm not sure about that 🤔 Let me show you our main options:");
        addOptions(FLOW.start.options);
        scrollToBottom();
      }, BOT_DELAY);
      return;
    }

    triggerFlow(matched);
  }

  /* ── Render Helpers ────────────────────────────────────── */
  function getTime() {
    return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  function parseBold(text) {
    return text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
  }

  function addBotMessage(text) {
    const msgs = document.getElementById("cb-messages");
    const wrap = document.createElement("div");
    wrap.className = "cb-bubble-wrap bot";
    wrap.innerHTML = `
      <div class="cb-bot-avatar">👘</div>
      <div>
        <div class="cb-bubble">${parseBold(text)}</div>
        <div class="cb-bubble-time">${getTime()}</div>
      </div>`;
    msgs.appendChild(wrap);
    saveToHistory({ role: "bot", text, time: getTime() });
  }

  function addLinkMessage(link) {
    const msgs = document.getElementById("cb-messages");
    const wrap = document.createElement("div");
    wrap.className = "cb-bubble-wrap bot";
    wrap.innerHTML = `
      <div class="cb-bot-avatar">👘</div>
      <div>
        <div class="cb-bubble">
          <a href="${link.url}" style="color:#511d00;font-weight:700;text-decoration:underline;">${link.label}</a>
        </div>
        <div class="cb-bubble-time">${getTime()}</div>
      </div>`;
    msgs.appendChild(wrap);
  }

  function addUserMessage(text) {
    const msgs = document.getElementById("cb-messages");
    const wrap = document.createElement("div");
    wrap.className = "cb-bubble-wrap user";
    wrap.innerHTML = `
      <div>
        <div class="cb-bubble">${parseBold(text)}</div>
        <div class="cb-bubble-time">${getTime()} <span class="cb-tick">✓✓</span></div>
      </div>`;
    msgs.appendChild(wrap);
    saveToHistory({ role: "user", text, time: getTime() });
    scrollToBottom();
  }

  function addOptions(options) {
    const msgs = document.getElementById("cb-messages");
    const wrap = document.createElement("div");
    wrap.className = "cb-options";
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "cb-option-btn";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        // Remove all option rows
        document.querySelectorAll(".cb-options").forEach((el) => el.remove());
        addUserMessage(opt.label);
        lastUserQuery = opt.label;
        triggerFlow(opt.next);
      });
      wrap.appendChild(btn);
    });
    msgs.appendChild(wrap);
  }

  function showTyping() {
    const msgs = document.getElementById("cb-messages");
    const el = document.createElement("div");
    el.className = "cb-typing";
    el.id = "cb-typing-indicator";
    el.innerHTML = `
      <div class="cb-bot-avatar">👘</div>
      <div class="cb-typing-bubble">
        <div class="cb-typing-dot"></div>
        <div class="cb-typing-dot"></div>
        <div class="cb-typing-dot"></div>
      </div>`;
    msgs.appendChild(el);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById("cb-typing-indicator");
    if (el) el.remove();
  }

  function scrollToBottom() {
    const msgs = document.getElementById("cb-messages");
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── WhatsApp Redirect ─────────────────────────────────── */
  function openWhatsApp() {
    const query = lastUserQuery || "Hello! I need help with The Ethnic Co.";
    const msg = `Hi The Ethnic Co. 👋\n\nI was browsing your website and need help with:\n"${query}"\n\nCould you please assist me? 🙏`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  /* ── localStorage History ──────────────────────────────── */
  function saveToHistory(entry) {
    history.push(entry);
    // Keep last 60 messages
    if (history.length > 60) history = history.slice(-60);
    saveHistory();
  }

  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (_) {}
  }

  function loadHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      history = JSON.parse(stored) || [];
      if (history.length === 0) return;

      const msgs = document.getElementById("cb-messages");
      history.forEach((entry) => {
        const wrap = document.createElement("div");
        wrap.className = `cb-bubble-wrap ${entry.role}`;
        if (entry.role === "bot") {
          wrap.innerHTML = `
            <div class="cb-bot-avatar">👘</div>
            <div>
              <div class="cb-bubble">${parseBold(entry.text)}</div>
              <div class="cb-bubble-time">${entry.time || ""}</div>
            </div>`;
        } else {
          wrap.innerHTML = `
            <div>
              <div class="cb-bubble">${parseBold(entry.text)}</div>
              <div class="cb-bubble-time">${entry.time || ""} <span class="cb-tick">✓✓</span></div>
            </div>`;
        }
        msgs.appendChild(wrap);
      });

      // Re-show main menu options at the end
      addOptions(FLOW.start.options);
      scrollToBottom();
    } catch (_) {
      history = [];
    }
  }

  /* ── Boot ──────────────────────────────────────────────── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
