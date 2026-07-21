/* ==========================================================================
   table.js — tiny client-side search/filter/paginate helper
   Works on an in-memory array; each consumer supplies a render(rows) fn.
   ========================================================================== */

class LFTable {
  constructor({ data = [], pageSize = 8, searchKeys = [], render, paginationEl, countEl }) {
    this.all = data;
    this.filtered = data;
    this.pageSize = pageSize;
    this.searchKeys = searchKeys;
    this.render = render;
    this.paginationEl = paginationEl;
    this.countEl = countEl;
    this.page = 1;
    this.statusFilter = '';
    this.query = '';
  }

  setData(data) { this.all = data; this.applyFilters(); }

  search(q) { this.query = (q || '').toLowerCase(); this.page = 1; this.applyFilters(); }

  filterStatus(status) { this.statusFilter = status || ''; this.page = 1; this.applyFilters(); }

  applyFilters() {
    this.filtered = this.all.filter(row => {
      const matchesQuery = !this.query || this.searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(this.query));
      const matchesStatus = !this.statusFilter || String(row.status ?? '').toLowerCase() === this.statusFilter.toLowerCase();
      return matchesQuery && matchesStatus;
    });
    this.renderPage();
  }

  goTo(p) { this.page = p; this.renderPage(); }

  renderPage() {
    const totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    if (this.page > totalPages) this.page = totalPages;
    const start = (this.page - 1) * this.pageSize;
    const rows = this.filtered.slice(start, start + this.pageSize);
    this.render(rows, this.filtered.length);
    if (this.countEl) {
      const shownTo = Math.min(start + this.pageSize, this.filtered.length);
      this.countEl.textContent = this.filtered.length
        ? `Showing ${start + 1}–${shownTo} of ${this.filtered.length}`
        : 'No results';
    }
    if (this.paginationEl) this.renderPagination(totalPages);
  }

  renderPagination(totalPages) {
    let html = '';
    const mk = (label, page, disabled, active) => `
      <li class="page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${page}">${label}</a>
      </li>`;
    html += mk('<i class="bi bi-chevron-left"></i>', this.page - 1, this.page === 1, false);
    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 7 && Math.abs(p - this.page) > 2 && p !== 1 && p !== totalPages) {
        if (p === 2 || p === totalPages - 1) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
        continue;
      }
      html += mk(p, p, false, p === this.page);
    }
    html += mk('<i class="bi bi-chevron-right"></i>', this.page + 1, this.page === totalPages, false);
    this.paginationEl.innerHTML = html;
    this.paginationEl.querySelectorAll('[data-page]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const p = parseInt(a.dataset.page, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) this.goTo(p);
      });
    });
  }
}
