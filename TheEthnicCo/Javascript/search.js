// ============================================================
//  THE ETHNIC CO. — Smart Search Engine v2
// ============================================================

(function () {
  "use strict";

  // ── Single source of truth: search-data.js populates this ───
  function getAllProducts() {
    // Primary: shared data file (works on ALL pages)
    if (window.SEARCH_ALL_PRODUCTS && window.SEARCH_ALL_PRODUCTS.length) {
      return window.SEARCH_ALL_PRODUCTS;
    }
    // Fallback: home.html Script.js globals
    const all = [];
    const seen = new Set();
    function add(arr) {
      if (!Array.isArray(arr)) return;
      arr.forEach((p) => {
        const key = String(p.id) + (p.name || "");
        if (p && p.id != null && !seen.has(key)) { seen.add(key); all.push(p); }
      });
    }
    if (typeof products !== "undefined") add(products);
    if (typeof mostLovedProducts !== "undefined") add(mostLovedProducts);
    if (typeof occasionProducts !== "undefined") Object.values(occasionProducts).forEach(add);
    if (typeof accessoriesProducts !== "undefined") Object.values(accessoriesProducts).forEach(add);
    return all;
  }

  // ── Trending ─────────────────────────────────────────────────
  const TRENDING = [
    "Sherwani", "Kurta", "Indo Western", "Jodhpuri",
    "Mojeri", "Safa", "Brooch", "Kamarbandh",
  ];

  // ── localStorage history ──────────────────────────────────────
  const HISTORY_KEY = "tec_search_history";

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch { return []; }
  }

  function saveHistory(q) {
    if (!q.trim()) return;
    let h = getHistory().filter((x) => x.toLowerCase() !== q.toLowerCase());
    h.unshift(q.trim());
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 6)));
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }

  // ── Debounce ──────────────────────────────────────────────────
  function debounce(fn, ms) {
    let t;
    return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); };
  }

  // ── Levenshtein fuzzy ─────────────────────────────────────────
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = [];
    for (let i = 0; i <= m; i++) {
      dp[i] = [];
      for (let j = 0; j <= n; j++) {
        dp[i][j] = i === 0 ? j : j === 0 ? i : 0;
      }
    }
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = a[i-1] === b[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[m][n];
  }

  function fuzzyMatch(word, target) {
    if (target.includes(word)) return true;
    if (word.length <= 2) return false;
    const maxDist = word.length <= 4 ? 1 : 2;
    // Check against each word in target
    return target.split(/\s+/).some((tw) => levenshtein(word, tw) <= maxDist);
  }

  // ── Score product relevance ───────────────────────────────────
  function score(product, words) {
    const name = (product.name || "").toLowerCase();
    const cat  = (product.category || "").toLowerCase();
    const tag  = (product.tag || "").toLowerCase();
    let s = 0;

    words.forEach((w) => {
      if (name === w)              s += 20;  // exact full name
      else if (name.startsWith(w)) s += 15;  // starts with
      else if (name.includes(w))   s += 10;  // substring in name
      else if (cat.includes(w))    s += 6;   // substring in category
      else if (tag.includes(w))    s += 3;   // tag match
      else if (fuzzyMatch(w, name)) s += 4;  // fuzzy name
      else if (fuzzyMatch(w, cat))  s += 2;  // fuzzy category
    });

    // Bonus if ALL words match
    if (words.every((w) => name.includes(w) || cat.includes(w))) s += 5;

    return s;
  }

  // ── Main search ───────────────────────────────────────────────
  function searchProducts(query) {
    const words = query.toLowerCase().trim().split(/\s+/).filter((w) => w.length > 0);
    if (!words.length) return [];

    const all = getAllProducts();
    const scored = all
      .map((p) => ({ p, s: score(p, words) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);

    return scored.map((x) => x.p);
  }

  // ── Highlight matched words ───────────────────────────────────
  function highlight(text, query) {
    if (!query || !text) return text;
    const words = query.trim().split(/\s+/).filter((w) => w.length > 0);
    let out = text;
    words.forEach((w) => {
      // Escape special regex chars manually
      const escaped = w.split("").map((c) => {
        return ".*+?^${}()|[]\\".indexOf(c) >= 0 ? "\\" + c : c;
      }).join("");
      try {
        const re = new RegExp("(" + escaped + ")", "gi");
        out = out.replace(re, "<mark>$1</mark>");
      } catch (e) { /* skip bad pattern */ }
    });
    return out;
  }

  // ── HTML builders ─────────────────────────────────────────────
  function chip(text, icon) {
    const safe = text.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    return `<div class="src-chip" onclick="triggerSearch('${safe}')">
      <span class="src-chip-icon">${icon}</span><span>${text}</span>
    </div>`;
  }

  function sectionTitle(html) {
    return `<div class="src-section-title">${html}</div>`;
  }

  function resultItem(product, query, index) {
    const hl = highlight(product.name, query);
    return `
      <div class="src-item" data-index="${index}"
           onclick="window.location.href='product-detail.html?id=${product.id}'">
        <img src="${product.img || ""}" alt="${product.name || ""}" class="src-img"
             onerror="this.style.background='#f0e8d8';this.style.display='block'">
        <div class="src-info">
          <div class="src-name">${hl}</div>
          <div class="src-cat">${product.category || ""}</div>
          <div class="src-price">${product.price || ""}</div>
        </div>
        <svg class="src-arrow" width="14" height="14" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>`;
  }

  // ── Render: default (empty input / focus) ─────────────────────
  function renderDefault(container) {
    const history = getHistory();
    let html = "";

    if (history.length) {
      html += sectionTitle(
        `Recent Searches <button class="src-clear-history" onclick="clearSearchHistory(event)">Clear</button>`
      );
      html += `<div class="src-chips">` + history.map((q) => chip(q, "🕐")).join("") + `</div>`;
    }

    html += sectionTitle("Trending Now");
    html += `<div class="src-chips">` + TRENDING.map((t) => chip(t, "🔥")).join("") + `</div>`;

    container.innerHTML = html;
    container.classList.add("active");
  }

  // ── Render: results ───────────────────────────────────────────
  function renderResults(container, results, query) {
    if (!results.length) {
      const cats = [...new Set(getAllProducts().map((p) => p.category).filter(Boolean))].slice(0, 5);
      container.innerHTML = `
        <div class="src-no-results">
          <div class="src-no-icon">🔍</div>
          <p>No results for "<strong>${query}</strong>"</p>
          <p class="src-no-sub">Try a category:</p>
          <div class="src-chips src-chips-sm">
            ${cats.map((c) => chip(c, "✦")).join("")}
          </div>
        </div>`;
      container.classList.add("active");
      return;
    }

    // Show ALL results (up to 12), not just 8
    const show = results.slice(0, 12);
    let html = sectionTitle(
      `${results.length} result${results.length !== 1 ? "s" : ""} found`
    );
    show.forEach((p, i) => { html += resultItem(p, query, i); });

    container.innerHTML = html;
    container.classList.add("active");
  }

  // ── State ─────────────────────────────────────────────────────
  let activeIndex = -1;
  let activeResults = [];

  function setActive(container, idx) {
    const items = container.querySelectorAll(".src-item");
    items.forEach((el, i) => el.classList.toggle("src-selected", i === idx));
    if (items[idx]) items[idx].scrollIntoView({ block: "nearest" });
    activeIndex = idx;
  }

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    const input = document.getElementById("search-input");
    const container = document.getElementById("search-results");
    if (!input || !container) return;

    // Inject clear (✕) button
    const clearBtn = document.createElement("button");
    clearBtn.id = "search-clear-btn";
    clearBtn.setAttribute("aria-label", "Clear search");
    clearBtn.innerHTML = "&#x2715;";
    clearBtn.style.display = "none";
    clearBtn.onclick = (e) => {
      e.stopPropagation();
      input.value = "";
      clearBtn.style.display = "none";
      activeResults = [];
      renderDefault(container);
      input.focus();
    };
    input.parentNode.insertBefore(clearBtn, input.nextSibling);

    // Debounced input handler
    const doSearch = debounce((val) => {
      activeIndex = -1;
      if (!val.trim()) {
        renderDefault(container);
        return;
      }
      activeResults = searchProducts(val);
      renderResults(container, activeResults, val);
    }, 250);

    input.addEventListener("input", (e) => {
      const val = e.target.value;
      clearBtn.style.display = val ? "flex" : "none";
      doSearch(val);
    });

    input.addEventListener("focus", () => {
      if (!input.value.trim()) renderDefault(container);
      else if (activeResults.length) container.classList.add("active");
    });

    // Keyboard nav
    input.addEventListener("keydown", (e) => {
      const items = container.querySelectorAll(".src-item");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(container, Math.min(activeIndex + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(container, Math.max(activeIndex - 1, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = activeResults[activeIndex] || activeResults[0];
        if (target) {
          saveHistory(input.value.trim());
          window.location.href = "product-detail.html?id=" + target.id;
        }
      } else if (e.key === "Escape") {
        container.classList.remove("active");
        input.classList.remove("active");
        clearBtn.style.display = "none";
      }
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-actions") && !e.target.closest("#search-results")) {
        container.classList.remove("active");
      }
    });

    // Save history on blur
    input.addEventListener("blur", () => {
      setTimeout(() => {
        if (input.value.trim() && activeResults.length) saveHistory(input.value.trim());
      }, 300);
    });
  }

  // ── Global helpers called from chips ─────────────────────────
  window.triggerSearch = function (query) {
    const input = document.getElementById("search-input");
    const container = document.getElementById("search-results");
    if (!input || !container) return;
    input.value = query;
    input.classList.add("active");
    const cb = document.getElementById("search-clear-btn");
    if (cb) cb.style.display = "flex";
    activeResults = searchProducts(query);
    renderResults(container, activeResults, query);
    input.focus();
  };

  window.clearSearchHistory = function (e) {
    e.stopPropagation();
    clearHistory();
    const input = document.getElementById("search-input");
    const container = document.getElementById("search-results");
    if (input && !input.value.trim()) renderDefault(container);
  };

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // Script.js loads before search.js, so products are already defined
    init();
  }
})();
