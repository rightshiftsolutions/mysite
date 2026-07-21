/* ==========================================================================
   dashboard.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  LoanFlow.requireAuth();
  LoanFlow.initLayout('Dashboard');
  const { fmt } = LoanFlow;

  loadSummary();
  loadRecentLoans();
  loadUpcomingInstallments();
  loadOverdueLoans();

  async function loadSummary() {
    try {
      const res = await LoanFlow.api('/dashboard');
      const d = res.data || {};
      const cards = [
        { label: 'Total Loans', value: d.total_loans ?? 0, icon: 'bi-briefcase-fill', cls: 'bg-icon-accent', money: false },
        { label: 'Total Lent', value: fmt.money(d.total_lent), icon: 'bi-cash-stack', cls: 'bg-icon-accent', money: true },
        { label: 'Total Received', value: fmt.money(d.total_received), icon: 'bi-piggy-bank-fill', cls: 'bg-icon-success', money: true },
        { label: 'Outstanding', value: fmt.money(d.outstanding_amount), icon: 'bi-hourglass-split', cls: 'bg-icon-warning', money: true },
        { label: 'Active Loans', value: d.active_loans ?? 0, icon: 'bi-lightning-charge-fill', cls: 'bg-icon-accent', money: false },
        { label: 'Completed Loans', value: d.completed_loans ?? 0, icon: 'bi-check2-circle', cls: 'bg-icon-success', money: false },
        { label: 'Overdue Loans', value: d.overdue_loans ?? 0, icon: 'bi-exclamation-octagon-fill', cls: 'bg-icon-danger', money: false },
      ];
      const grid = document.getElementById('statGrid');
      grid.innerHTML = cards.map((c, i) => `
        <div class="card stat-card card-hover animate-slide-up stagger-${(i % 6) + 1}">
          <div class="d-flex align-items-start justify-content-between mb-3">
            <div class="stat-icon ${c.cls}"><i class="bi ${c.icon}"></i></div>
          </div>
          <div class="stat-label">${c.label}</div>
          <div class="stat-value mono">${c.value}</div>
        </div>
      `).join('');

      // Repayment health ring: received vs lent
      const pct = d.total_lent ? Math.min(100, Math.round((d.total_received / d.total_lent) * 100)) : 0;
      drawRing(pct);
    } catch (err) {
      LoanFlow.Toast.show('danger', err.message || 'Could not load dashboard summary.');
    }
  }

  function drawRing(pct) {
    const circle = document.getElementById('ringValue');
    const label = document.getElementById('ringPct');
    if (!circle) return;
    const r = 42, c = 2 * Math.PI * r;
    circle.style.strokeDasharray = c;
    circle.style.strokeDashoffset = c;
    requestAnimationFrame(() => {
      circle.style.strokeDashoffset = c - (pct / 100) * c;
    });
    label.textContent = pct + '%';
  }

  async function loadRecentLoans() {
    const tbody = document.getElementById('recentLoansBody');
    tbody.innerHTML = LoanFlow.skeletonRows(5, 4);
    try {
      const res = await LoanFlow.api('/dashboard/recent-loans');
      const rows = res.data || [];
      if (!rows.length) { tbody.innerHTML = emptyRow(5, 'No loans yet.'); return; }
      tbody.innerHTML = rows.map(l => `
        <tr onclick="window.location.href='loan-details.html?id=${l.id}'" style="cursor:pointer;">
          <td><span class="code-id text-secondary">#${l.id}</span></td>
          <td>${l.borrower || '—'}</td>
          <td class="mono amount">${fmt.money(l.loan_amount)}</td>
          <td>${fmt.date(l.loan_date)}</td>
          <td><span class="badge-status ${fmt.badgeClass(l.status)}">${l.status || '—'}</span></td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = emptyRow(5, 'Could not load recent loans.');
    }
  }

  async function loadUpcomingInstallments() {
    const list = document.getElementById('upcomingList');
    try {
      const res = await LoanFlow.api('/dashboard/upcoming-installments');
      const rows = res.data || [];
      if (!rows.length) { list.innerHTML = `<div class="empty-state py-4"><i class="bi bi-calendar2-check"></i>Nothing due soon.</div>`; return; }
      list.innerHTML = rows.map(i => `
        <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--border)!important;">
          <div class="d-flex align-items-center gap-2">
            <div class="row-avatar">${fmt.initials(i.borrower)}</div>
            <div>
              <div class="small fw-semibold">${i.borrower || 'Borrower'}</div>
              <div class="small text-secondary">Loan #${i.loan_id} · due ${fmt.date(i.due_date)}</div>
            </div>
          </div>
          <div class="mono fw-semibold">${fmt.money(i.amount)}</div>
        </div>
      `).join('');
    } catch (err) {
      list.innerHTML = `<div class="empty-state py-4"><i class="bi bi-exclamation-circle"></i>Could not load upcoming installments.</div>`;
    }
  }

  async function loadOverdueLoans() {
    const list = document.getElementById('overdueList');
    try {
      const res = await LoanFlow.api('/dashboard/overdue-loans');
      const rows = res.data || [];
      if (!rows.length) { list.innerHTML = `<div class="empty-state py-4"><i class="bi bi-emoji-smile"></i>No overdue loans. Nice work.</div>`; return; }
      list.innerHTML = rows.map(l => `
        <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--border)!important;">
          <div class="d-flex align-items-center gap-2">
            <div class="row-avatar" style="background:linear-gradient(135deg,#EF4444,#b91c1c);">${fmt.initials(l.borrower)}</div>
            <div>
              <div class="small fw-semibold">${l.borrower || 'Borrower'}</div>
              <div class="small text-secondary">Loan #${l.id}</div>
            </div>
          </div>
          <div class="mono fw-semibold">${fmt.money(l.loan_amount)}</div>
        </div>
      `).join('');
    } catch (err) {
      list.innerHTML = `<div class="empty-state py-4"><i class="bi bi-exclamation-circle"></i>Could not load overdue loans.</div>`;
    }
  }

  function emptyRow(cols, msg) {
    return `<tr><td colspan="${cols}"><div class="empty-state py-3"><i class="bi bi-inbox"></i>${msg}</div></td></tr>`;
  }
});
