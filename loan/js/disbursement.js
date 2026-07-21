/* ==========================================================================
   disbursement.js — Create Disbursement form + Disbursement list
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const { fmt } = LoanFlow;

  /* ---------------- Create Disbursement ---------------- */
  const form = document.getElementById('createDisbursementForm');
  if (form) {
    populateLoanDropdown();
    const paymentMethod = document.getElementById('dPaymentMethod');
    const cashField = document.getElementById('cashLocationGroup');
    paymentMethod?.addEventListener('change', () => {
      cashField.classList.toggle('d-none', paymentMethod.value !== 'cash');
    });

    const dropzone = document.getElementById('screenshotDropzone');
    const fileInput = document.getElementById('screenshotInput');
    const preview = document.getElementById('screenshotPreview');
    dropzone?.addEventListener('click', () => fileInput.click());
    dropzone?.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone?.addEventListener('drop', e => {
      e.preventDefault(); dropzone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) { fileInput.files = e.dataTransfer.files; showPreview(e.dataTransfer.files[0]); }
    });
    fileInput?.addEventListener('change', () => { if (fileInput.files[0]) showPreview(fileInput.files[0]); });
    function showPreview(file) {
      const reader = new FileReader();
      reader.onload = e => { preview.src = e.target.result; preview.classList.remove('d-none'); };
      reader.readAsDataURL(file);
    }

    async function populateLoanDropdown() {
      const select = document.getElementById('dLoanId');
      const amountInput = document.getElementById('dAmount');
      let loansMap = {};

      try {
        const res = await LoanFlow.api('/loans/lender');
        const rows = res.data || [];
        rows.forEach(l => { loansMap[l.id] = l; });

        select.innerHTML = '<option value="" selected disabled>Choose a loan…</option>' +
          rows.map(l => `<option value="${l.id}">#${l.id} — ${l.borrower || l.loan_reason || 'Loan'} (${fmt.money(l.loan_amount)})</option>`).join('');

        const params = new URLSearchParams(location.search);
        const preselect = params.get('loanId');
        if (preselect) {
          select.value = preselect;
          if (loansMap[preselect] && loansMap[preselect].loan_amount) {
            amountInput.value = loansMap[preselect].loan_amount;
          }
        }

        select.addEventListener('change', () => {
          const chosenId = select.value;
          if (loansMap[chosenId] && loansMap[chosenId].loan_amount) {
            amountInput.value = loansMap[chosenId].loan_amount;
          }
        });

      } catch (err) {
        select.innerHTML = '<option value="">Could not load loans</option>';
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      form.classList.add('was-validated');
      if (!form.checkValidity()) return;

      const btn = document.getElementById('submitDisbursementBtn');
      btn.classList.add('is-loading'); btn.disabled = true;

      const fd = new FormData();
      fd.append('loan_id', document.getElementById('dLoanId').value);
      fd.append('amount', document.getElementById('dAmount').value);
      fd.append('payment_method', paymentMethod.value);
      fd.append('transaction_date', document.getElementById('dTransactionDate').value);
      if (paymentMethod.value === 'cash') fd.append('cash_location', document.getElementById('dCashLocation').value || '');
      fd.append('witness_name', document.getElementById('dWitnessName').value || '');
      fd.append('witness_mobile', document.getElementById('dWitnessMobile').value || '');
      fd.append('witness_status', 'confirmed');
      fd.append('remarks', document.getElementById('dRemarks').value || '');
      if (fileInput.files[0]) fd.append('payment_proof', fileInput.files[0]);

      try {
        await LoanFlow.api('/disbursements', { method: 'POST', body: fd, isForm: true });
        LoanFlow.Toast.show('success', 'Disbursement recorded successfully.');
        setTimeout(() => window.location.href = 'disbursement-list.html', 700);
      } catch (err) {
        LoanFlow.Toast.show('danger', err.message || 'Could not create disbursement.');
      } finally {
        btn.classList.remove('is-loading'); btn.disabled = false;
      }
    });
  }

  /* ---------------- Disbursement List ---------------- */
  const tbody = document.getElementById('disbursementBody');
  if (tbody) {
    const searchInput = document.getElementById('disbSearch');
    const paginationEl = document.getElementById('disbPagination');
    const countEl = document.getElementById('disbCount');
    let table;
    const currentUser = LoanFlow.Auth.getUser() || {};

    function rowHtml(d) {
      const isBorrower = (currentUser.id == d.borrower_id);
      const isPending = (d.status === 'pending' || !d.status);

      let statusCol = '';
      if (isBorrower && isPending) {
        statusCol = `<button class="btn btn-success btn-sm py-1 px-2" data-confirm-disb="${d.id}"><i class="bi bi-check-lg me-1"></i>Confirm Receipt</button>`;
      } else {
        statusCol = `<span class="small text-secondary">${isPending ? 'Pending Confirmation' : 'Confirmed'}</span>`;
      }

      const proofCol = d.screenshot_url 
        ? `<button class="btn btn-outline-info btn-sm py-1 px-2" style="font-size:0.75rem;" data-view="${d.id}"><i class="bi bi-image me-1"></i>View Proof</button>` 
        : `<button class="btn btn-outline-soft btn-sm py-1 px-2" style="font-size:0.75rem;" data-view="${d.id}"><i class="bi bi-eye me-1"></i>View Details</button>`;

      return `
        <tr>
          <td><span class="code-id text-secondary">#${d.id}</span></td>
          <td>Loan #${d.loan_id}</td>
          <td>${d.borrower_name || '—'}</td>
          <td class="mono amount">${fmt.money(d.amount)}</td>
          <td>${(d.payment_method || '—').replace('_', ' ')}</td>
          <td>${fmt.date(d.transaction_date)}</td>
          <td>${statusCol}</td>
          <td class="text-end">${proofCol}</td>
        </tr>`;
    }

    function render(rows) {
      tbody.innerHTML = rows.length ? rows.map(rowHtml).join('') :
        `<tr><td colspan="8"><div class="empty-state"><i class="bi bi-send-x"></i>No disbursements recorded yet.</div></td></tr>`;
      tbody.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => openDisbursementDetails(btn.dataset.view)));
      tbody.querySelectorAll('[data-confirm-disb]').forEach(btn => btn.addEventListener('click', () => confirmDisbursement(btn.dataset.confirmDisb)));
    }

    async function confirmDisbursement(id) {
      try {
        await LoanFlow.api(`/disbursements/${id}/confirm`, { method: 'PATCH' });
        LoanFlow.Toast.show('success', 'Disbursement receipt confirmed successfully.');
        load();
      } catch (err) {
        LoanFlow.Toast.show('danger', err.message || 'Could not confirm disbursement.');
      }
    }

    function openDisbursementDetails(disbId) {
      const d = (table ? table.all : []).find(x => String(x.id) === String(disbId));
      if (!d) return;

      document.getElementById('detDisbAmount').textContent = fmt.money(d.amount);
      document.getElementById('detDisbDate').textContent = fmt.date(d.transaction_date);
      document.getElementById('detDisbMethod').textContent = (d.payment_method || '—').replace('_', ' ');

      const locRow = document.getElementById('detDisbLocationRow');
      if (d.payment_method === 'cash') {
        document.getElementById('detDisbLocation').textContent = d.cash_location || 'Not specified';
        locRow.classList.remove('d-none');
      } else {
        locRow.classList.add('d-none');
      }

      document.getElementById('detDisbWitnessName').textContent = d.witness_name || '—';
      document.getElementById('detDisbWitnessMobile').textContent = d.witness_mobile || '—';
      document.getElementById('detDisbWitnessStatus').innerHTML = `<span class="badge-status ${fmt.badgeClass(d.witness_status)}">${d.witness_status || '—'}</span>`;
      document.getElementById('detDisbRemarks').textContent = d.remarks ? `"${d.remarks}"` : 'No remarks provided.';

      const imgEl = document.getElementById('detDisbProofImg');
      const noneEl = document.getElementById('detDisbNoProof');
      if (d.screenshot_url) {
        imgEl.src = d.screenshot_url;
        imgEl.classList.remove('d-none');
        noneEl.classList.add('d-none');
      } else {
        imgEl.src = '';
        imgEl.classList.add('d-none');
        noneEl.classList.remove('d-none');
      }

      document.getElementById('detDisbViewLoanBtn').href = `loan-details.html?id=${d.loan_id}`;

      const modal = new bootstrap.Modal(document.getElementById('disbursementDetailsModal'));
      modal.show();
    }

    async function del(id) {
      if (!confirm('Delete this disbursement record?')) return;
      try {
        await LoanFlow.api(`/disbursements/${id}`, { method: 'DELETE' });
        LoanFlow.Toast.show('success', 'Disbursement deleted.');
        load();
      } catch (err) { LoanFlow.Toast.show('danger', err.message || 'Could not delete.'); }
    }

    async function load() {
      tbody.innerHTML = LoanFlow.skeletonRows(7, 5);
      try {
        const res = await LoanFlow.api('/disbursements');
        table = new LFTable({ data: res.data || [], pageSize: 8, searchKeys: ['borrower_name', 'payment_method'], render, paginationEl, countEl });
        table.renderPage();
      } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-exclamation-circle"></i>${err.message || 'Could not load disbursements.'}</div></td></tr>`;
      }
    }
    searchInput?.addEventListener('input', () => table?.search(searchInput.value));
    load();
  }
});
