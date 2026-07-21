/* ==========================================================================
   borrowers.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('borrowersBody');
  if (!tbody) return;
  const { fmt } = LoanFlow;

  LoanFlow.requireAuth();
  LoanFlow.initLayout('Borrowers');

  const searchInput = document.getElementById('borrowerSearch');
  const statusSelect = document.getElementById('borrowerStatusFilter');
  const paginationEl = document.getElementById('borrowerPagination');
  const countEl = document.getElementById('borrowerCount');
  let table;

  function rowHtml(b) {
    return `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="row-avatar">${fmt.initials(b.full_name)}</div>
            <span class="fw-semibold">${b.full_name || '—'}</span>
          </div>
        </td>
        <td>${b.email || '—'}</td>
        <td class="mono">${b.mobile || '—'}</td>
        <td><span class="badge-status ${fmt.badgeClass(b.status)}">${b.status || '—'}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-outline-soft btn-icon-only" title="View Details" data-view="${b.borrower_id}"><i class="bi bi-eye"></i></button>
            <button class="btn btn-soft-danger btn-icon-only" title="Remove" data-remove="${b.id}"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>`;
  }

  function render(rows) {
    tbody.innerHTML = rows.length ? rows.map(rowHtml).join('') :
      `<tr><td colspan="5"><div class="empty-state"><i class="bi bi-people"></i>No borrowers match your search.<br><a href="invitation.html" class="btn btn-gradient btn-sm mt-2">Invite a borrower</a></div></td></tr>`;
    tbody.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => removeBorrower(btn.dataset.remove)));
    tbody.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => openBorrowerDetails(btn.dataset.view)));
  }

  async function openBorrowerDetails(borrowerId) {
    const b = (table ? table.all : []).find(x => String(x.borrower_id) === String(borrowerId));
    if (!b) return;

    document.getElementById('detBorrowerAvatar').textContent = fmt.initials(b.full_name);
    document.getElementById('detBorrowerName').textContent = b.full_name || '—';
    document.getElementById('detBorrowerStatusBadge').innerHTML = `<span class="badge-status ${fmt.badgeClass(b.status)}">${b.status || '—'}</span>`;
    document.getElementById('detBorrowerEmail').textContent = b.email || '—';
    document.getElementById('detBorrowerMobile').textContent = b.mobile || '—';

    // Reset stats
    document.getElementById('detTotalLoans').textContent = '...';
    document.getElementById('detActiveLoans').textContent = '...';
    document.getElementById('detCompletedLoans').textContent = '...';
    document.getElementById('detOutstandingBalance').textContent = '...';

    document.getElementById('detViewLoansBtn').href = `loan-list.html?borrower=${borrowerId}`;

    const modal = new bootstrap.Modal(document.getElementById('borrowerDetailsModal'));
    modal.show();

    try {
      const res = await LoanFlow.api('/loans/lender');
      const allLoans = res.data || [];
      const bLoans = allLoans.filter(l => String(l.borrower_id) === String(borrowerId));

      const total = bLoans.length;
      const active = bLoans.filter(l => l.status === 'active').length;
      const completed = bLoans.filter(l => l.status === 'completed').length;
      const outstanding = bLoans.reduce((sum, l) => sum + (Number(l.outstanding_amount) || 0), 0);

      document.getElementById('detTotalLoans').textContent = total;
      document.getElementById('detActiveLoans').textContent = active;
      document.getElementById('detCompletedLoans').textContent = completed;
      document.getElementById('detOutstandingBalance').textContent = fmt.money(outstanding);
    } catch (err) {
      LoanFlow.Toast.show('danger', err.message || 'Could not load borrower loan stats.');
    }
  }

  async function removeBorrower(id) {
    if (!confirm('Remove this borrower from your list?')) return;
    try {
      await LoanFlow.api(`/lender-borrowers/${id}`, { method: 'DELETE' });
      LoanFlow.Toast.show('success', 'Borrower removed.');
      load();
    } catch (err) { LoanFlow.Toast.show('danger', err.message || 'Could not remove borrower.'); }
  }

  async function load() {
    tbody.innerHTML = LoanFlow.skeletonRows(5, 5);
    try {
      const res = await LoanFlow.api('/lender-borrowers/');
      table = new LFTable({ data: res.data || [], pageSize: 8, searchKeys: ['full_name', 'email', 'mobile'], render, paginationEl, countEl });
      table.renderPage();
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="bi bi-exclamation-circle"></i>${err.message || 'Could not load borrowers.'}</div></td></tr>`;
    }
  }

  searchInput?.addEventListener('input', () => table?.search(searchInput.value));
  statusSelect?.addEventListener('change', () => table?.filterStatus(statusSelect.value));

  load();
});
