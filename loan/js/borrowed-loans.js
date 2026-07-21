/* ==========================================================================
   borrowed-loans.js — Borrowed Loans List
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('loanListBody');
  if (!tbody) return;

  const { fmt } = LoanFlow;

  const searchInput = document.getElementById('loanSearch');
  const statusSelect = document.getElementById('loanStatusFilter');
  const paginationEl = document.getElementById('loanPagination');
  const countEl = document.getElementById('loanCount');

  let table;

  function rowHtml(l) {
    const canAccept = l.status === 'pending';
    return `
      <tr>
        <td><span class="code-id text-secondary">#${l.id}</span></td>
        <td>
          <div class="fw-semibold">${l.lender || '—'}</div>
          <div class="small text-secondary">${l.loan_reason || ''}</div>
        </td>
        <td class="mono amount">${fmt.money(l.loan_amount)}</td>
        <td>${fmt.date(l.loan_date)}</td>
        <td>${fmt.date(l.due_date)}</td>
        <td><span class="badge-status ${fmt.badgeClass(l.status)}">${l.status || '—'}</span></td>
        <td>
          <div class="action-btns">
            ${canAccept ? `<button class="btn btn-soft-success btn-icon-only" title="Accept loan" data-accept="${l.id}"><i class="bi bi-check-lg"></i></button>` : ''}
            <a class="btn btn-outline-soft btn-icon-only" title="View Details" href="loan-details.html?id=${l.id}"><i class="bi bi-eye"></i></a>
          </div>
        </td>
      </tr>`;
  }

  function render(rows) {
    tbody.innerHTML = rows.length ? rows.map(rowHtml).join('') :
      `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-bank"></i>No borrowed loans found.</div></td></tr>`;

    tbody.querySelectorAll('[data-accept]').forEach(btn => btn.addEventListener('click', () => acceptLoan(btn.dataset.accept)));
  }

  async function acceptLoan(id) {
    if (!confirm('Are you sure you want to accept this loan and its terms?')) return;
    try {
      await LoanFlow.api(`/loans/${id}/accept`, { method: 'PATCH' });
      LoanFlow.Toast.show('success', 'Loan accepted successfully.');
      loadLoans();
    } catch (err) {
      LoanFlow.Toast.show('danger', err.message || 'Could not accept loan.');
    }
  }

  async function loadLoans() {
    tbody.innerHTML = LoanFlow.skeletonRows(7, 5);
    try {
      const res = await LoanFlow.api('/loans/borrower');
      const rows = res.data || [];
      table = new LFTable({ data: rows, pageSize: 8, searchKeys: ['lender', 'loan_reason'], render, paginationEl, countEl });
      table.renderPage();
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-exclamation-circle"></i>${err.message || 'Could not load borrowed loans.'}</div></td></tr>`;
    }
  }

  searchInput?.addEventListener('input', () => table?.search(searchInput.value));
  statusSelect?.addEventListener('change', () => table?.filterStatus(statusSelect.value));

  loadLoans();
});
