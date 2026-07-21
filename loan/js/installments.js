/* ==========================================================================
   installments.js — Complete Installments & Lender/Borrower Payment Flow
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('installmentsBody');
  if (!tbody) return;
  const { fmt } = LoanFlow;

  LoanFlow.requireAuth();
  LoanFlow.initLayout('Installments');

  const currentUser = LoanFlow.Auth.getUser();
  const loanSelect = document.getElementById('installmentLoanSelect');
  const statusSelect = document.getElementById('installmentStatusFilter');
  const countEl = document.getElementById('installmentCount');
  
  // Next Payment Card elements
  const nextPaymentCard = document.getElementById('nextPaymentCard');
  const ntbLoanName = document.getElementById('ntbLoanName');
  const ntbOutstanding = document.getElementById('ntbOutstanding');
  const ntbDueDate = document.getElementById('ntbDueDate');
  const ntbInterest = document.getElementById('ntbInterest');
  const ntbActionCol = document.getElementById('ntbActionCol');

  let allRows = [];
  let allLoans = [];

  async function populateLoans() {
    try {
      const lenderRes = await LoanFlow.api('/loans/lender').catch(() => ({ data: [] }));
      const borrowerRes = await LoanFlow.api('/loans/borrower').catch(() => ({ data: [] }));
      const lenderLoans = (lenderRes.data || []).map(l => ({ ...l, role: 'lender' }));
      const borrowerLoans = (borrowerRes.data || [])
        .filter(l => l.status !== 'pending')
        .map(l => ({ ...l, role: 'borrower' }));
      
      allLoans = [...lenderLoans, ...borrowerLoans];

      let selectOptions = `<option value="all">All Loans (Overall View)</option>`;
      selectOptions += allLoans.map(l => 
        `<option value="${l.id}" data-role="${l.role}">#${l.id} — [${l.role === 'lender' ? 'Lent to ' + (l.borrower || 'Borrower') : 'Borrowed from ' + (l.lender || 'Lender')}] (${l.loan_reason || 'No Reason'})</option>`
      ).join('');

      loanSelect.innerHTML = selectOptions;

      const params = new URLSearchParams(location.search);
      const preselect = params.get('loanId');
      if (preselect) loanSelect.value = preselect;
      
      loadInstallments();
    } catch (err) {
      loanSelect.innerHTML = '<option value="all">All Loans</option>';
      loadInstallments();
    }
  }

  function getStatusBadge(status, hasProof) {
    if (status === 'pending_approval' || (hasProof && status !== 'paid')) {
      return `<span class="badge badge-pending-approval"><i class="bi bi-clock-history me-1"></i>Awaiting Confirmation</span>`;
    }
    if (status === 'paid') {
      return `<span class="badge-status badge-paid"><i class="bi bi-check-circle me-1"></i>Paid</span>`;
    }
    if (status === 'overdue') {
      return `<span class="badge-status badge-overdue"><i class="bi bi-exclamation-circle me-1"></i>Overdue</span>`;
    }
    return `<span class="badge-status badge-pending"><i class="bi bi-hourglass-split me-1"></i>Pending</span>`;
  }

  function rowHtml(i) {
    const isBorrower = (currentUser?.id == i.borrower_id);
    const isLender = (currentUser?.id == i.lender_id);
    const isAwaitingApproval = (i.status === 'pending_approval' || (i.payment_proof && i.status !== 'paid'));

    let partyLabel = '';
    if (isLender && i.borrower_name) {
      partyLabel = `<div class="small fw-semibold text-white">${i.loan_reason || 'Loan #' + i.loan_id}</div><div class="small text-secondary">Borrower: ${i.borrower_name}</div>`;
    } else if (isBorrower && i.lender_name) {
      partyLabel = `<div class="small fw-semibold text-white">${i.loan_reason || 'Loan #' + i.loan_id}</div><div class="small text-secondary">Lender: ${i.lender_name}</div>`;
    } else {
      partyLabel = `<div class="small fw-semibold text-white">${i.loan_reason || 'Loan #' + i.loan_id}</div>`;
    }

    let actionBtn = '';
    if (i.status === 'paid') {
      actionBtn = `<span class="text-secondary small"><i class="bi bi-check-all text-success me-1"></i>Settled</span>`;
    } else if (isAwaitingApproval) {
      // Borrower has paid & notification sent -> ONLY NOW Lender gets Confirm button!
      if (isLender) {
        actionBtn = `
          <button class="btn btn-success btn-sm me-1 py-1 px-3" data-confirm="${i.id}">
            <i class="bi bi-check-lg me-1"></i>Confirm
          </button>`;
      } else {
        actionBtn = `<span class="badge bg-warning bg-opacity-10 text-warning px-2 py-1"><i class="bi bi-clock me-1"></i>Awaiting Confirmation</span>`;
      }
    } else {
      // status is pending or overdue (Borrower hasn't paid yet)
      if (isBorrower) {
        actionBtn = `
          <button class="btn btn-gradient btn-sm py-1 px-3" data-pay="${i.id}">
            <span class="btn-text"><i class="bi bi-cash-stack me-1"></i>Pay Installment</span>
          </button>`;
      } else if (isLender) {
        // Lender sees "Waiting for Borrower" until borrower pays & sends notification
        actionBtn = `<span class="text-secondary small"><i class="bi bi-hourglass-split me-1"></i>Waiting for Borrower</span>`;
      }
    }

    const proofCol = i.screenshot_url 
      ? `<button class="btn btn-outline-info btn-sm py-0 px-2" style="font-size:0.75rem;" data-screenshot="${i.screenshot_url}"><i class="bi bi-image me-1"></i>View Proof</button>` 
      : `<span class="text-muted small">—</span>`;

    return `
      <tr>
        <td><strong>#${i.installment_no}</strong></td>
        <td>${partyLabel}</td>
        <td>${fmt.date(i.due_date)}</td>
        <td class="mono">${fmt.money(i.principal_amount)}</td>
        <td class="mono text-info">${fmt.money(i.interest_amount)}</td>
        <td class="mono amount text-white fw-semibold">${fmt.money(i.total_amount)}</td>
        <td>${getStatusBadge(i.status, !!i.payment_proof)}</td>
        <td>${proofCol}</td>
        <td class="text-end">${actionBtn}</td>
      </tr>`;
  }

  function checkAndRenderNextPaymentCard() {
    const selectedVal = loanSelect.value;
    let ntbRows = [];

    if (selectedVal === 'all') {
      ntbRows = allRows.filter(r => r.loan_type === 'non_time_bounded' && r.status !== 'paid');
    } else {
      ntbRows = allRows.filter(r => r.loan_id == selectedVal && r.loan_type === 'non_time_bounded' && r.status !== 'paid');
    }

    if (ntbRows.length === 0) {
      nextPaymentCard?.classList.add('d-none');
      return;
    }

    const ntbItem = ntbRows[0];
    const isBorrower = (currentUser?.id == ntbItem.borrower_id);
    const isLender = (currentUser?.id == ntbItem.lender_id);
    const isAwaitingApproval = (ntbItem.status === 'pending_approval' || (ntbItem.payment_proof && ntbItem.status !== 'paid'));

    nextPaymentCard?.classList.remove('d-none');
    ntbLoanName.textContent = `${ntbItem.loan_reason || 'Loan #' + ntbItem.loan_id} — Borrower: ${ntbItem.borrower_name || 'Borrower'}`;
    ntbOutstanding.textContent = fmt.money(ntbItem.loan_outstanding || ntbItem.outstanding_amount || 0);
    ntbDueDate.textContent = fmt.date(ntbItem.due_date);
    ntbInterest.textContent = fmt.money(ntbItem.interest_amount || ntbItem.total_amount);

    if (isAwaitingApproval) {
      if (isLender) {
        const proofBtn = ntbItem.screenshot_url 
          ? `<button class="btn btn-outline-info btn-sm py-2 px-3 me-2" data-screenshot="${ntbItem.screenshot_url}"><i class="bi bi-image me-1"></i>View Proof</button>`
          : '';
        ntbActionCol.innerHTML = `
          ${proofBtn}
          <button class="btn btn-success btn-sm py-2 px-3 me-1" data-confirm="${ntbItem.id}">
            <i class="bi bi-check-circle me-1"></i>Confirm Payment
          </button>`;
      } else {
        ntbActionCol.innerHTML = `<span class="badge bg-warning bg-opacity-20 text-warning px-3 py-2 fs-6"><i class="bi bi-clock me-1"></i>Awaiting Lender Confirmation</span>`;
      }
    } else {
      if (isBorrower) {
        ntbActionCol.innerHTML = `
          <button class="btn btn-gradient py-2 px-4" data-pay="${ntbItem.id}">
            <span class="btn-text"><i class="bi bi-cash-stack me-1"></i>Pay Installment</span>
          </button>`;
      } else if (isLender) {
        ntbActionCol.innerHTML = `<span class="text-secondary small"><i class="bi bi-hourglass-split me-1"></i>Waiting for Borrower Payment</span>`;
      }
    }
  }

  function render() {
    const status = statusSelect.value;
    const selectedLoan = loanSelect.value;

    let rows = allRows;
    if (selectedLoan && selectedLoan !== 'all') {
      rows = rows.filter(r => r.loan_id == selectedLoan);
    }
    if (status) {
      rows = rows.filter(r => r.status === status);
    }

    tbody.innerHTML = rows.length ? rows.map(rowHtml).join('') :
      `<tr><td colspan="9"><div class="empty-state"><i class="bi bi-calendar-x"></i>No installments match this filter.</div></td></tr>`;
    
    countEl.textContent = `${rows.length} installment${rows.length === 1 ? '' : 's'}`;
    
    // Attach listeners
    document.querySelectorAll('[data-pay]').forEach(btn => btn.addEventListener('click', () => openPayModal(btn.dataset.pay)));
    document.querySelectorAll('[data-confirm]').forEach(btn => btn.addEventListener('click', () => confirmPayment(btn.dataset.confirm)));
    document.querySelectorAll('[data-reject]').forEach(btn => btn.addEventListener('click', () => rejectPayment(btn.dataset.reject)));

    // Proof modal listener
    document.querySelectorAll('[data-screenshot]').forEach(icon => {
      icon.addEventListener('click', () => {
        const url = icon.dataset.screenshot;
        const imgEl = document.getElementById('screenshotPreviewImg');
        const errEl = document.getElementById('screenshotError');
        if (imgEl && errEl) {
          imgEl.src = '';
          imgEl.classList.add('d-none');
          errEl.classList.add('d-none');
          
          imgEl.onload = () => {
            imgEl.classList.remove('d-none');
            errEl.classList.add('d-none');
          };
          imgEl.onerror = () => {
            imgEl.classList.add('d-none');
            errEl.classList.remove('d-none');
          };
          
          imgEl.src = url;
          const screenshotModal = new bootstrap.Modal(document.getElementById('screenshotModal'));
          screenshotModal.show();
        }
      });
    });

    checkAndRenderNextPaymentCard();
  }

  async function loadInstallments() {
    tbody.innerHTML = LoanFlow.skeletonRows(9, 5);
    try {
      const selectedVal = loanSelect.value;
      const endpoint = (selectedVal && selectedVal !== 'all') ? `/installments/loan/${selectedVal}` : '/installments/all';
      const res = await LoanFlow.api(endpoint);
      allRows = res.data || [];
      render();
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><i class="bi bi-exclamation-circle"></i>${err.message || 'Could not load installments.'}</div></td></tr>`;
    }
  }

  loanSelect?.addEventListener('change', loadInstallments);
  statusSelect?.addEventListener('change', render);

  /* ---- Pay modal logic ---- */
  let activeInstallmentId = null;
  const payModalEl = document.getElementById('payModal');
  const payModal = payModalEl ? new bootstrap.Modal(payModalEl) : null;
  const payFileInput = document.getElementById('payScreenshotInput');
  const payPreview = document.getElementById('payScreenshotPreview');
  const payDropzone = document.getElementById('payDropzone');
  const payAmountInput = document.getElementById('payAmountInput');
  const payModalTitle = document.getElementById('payModalTitle');
  const payModalSub = document.getElementById('payModalSub');

  payDropzone?.addEventListener('click', () => payFileInput.click());
  payFileInput?.addEventListener('change', () => {
    if (payFileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = e => { payPreview.src = e.target.result; payPreview.classList.remove('d-none'); };
      reader.readAsDataURL(payFileInput.files[0]);
    }
  });

  function openPayModal(id) {
    activeInstallmentId = id;
    const item = allRows.find(r => r.id == id);
    const isBorrower = (currentUser?.id == item?.borrower_id);

    payFileInput.value = '';
    payPreview.classList.add('d-none');
    if (payAmountInput && item) {
      payAmountInput.value = item.total_amount || '';
    }

    if (payModalTitle && payModalSub) {
      payModalTitle.textContent = `Pay Installment #${item?.installment_no || ''}`;
      payModalSub.textContent = 'Upload payment screenshot & details to submit payment for lender confirmation.';
    }

    payModal?.show();
  }

  document.getElementById('confirmPayBtn')?.addEventListener('click', async () => {
    if (!activeInstallmentId) return;
    const btn = document.getElementById('confirmPayBtn');
    btn.classList.add('is-loading'); btn.disabled = true;
    
    const fd = new FormData();
    if (payAmountInput.value) fd.append('amount_paid', payAmountInput.value);
    if (payFileInput.files[0]) fd.append('payment_proof', payFileInput.files[0]);

    try {
      const res = await LoanFlow.api(`/installments/${activeInstallmentId}/pay`, { method: 'PATCH', body: fd, isForm: true });
      LoanFlow.Toast.show('success', res.message || 'Payment updated successfully.');
      payModal?.hide();
      loadInstallments();
    } catch (err) {
      LoanFlow.Toast.show('danger', err.message || 'Could not update payment.');
    } finally {
      btn.classList.remove('is-loading'); btn.disabled = false;
    }
  });

  async function confirmPayment(id) {
    if (!confirm('Are you sure you want to confirm this payment?')) return;
    try {
      const res = await LoanFlow.api(`/installments/${id}/confirm`, { method: 'PATCH' });
      LoanFlow.Toast.show('success', res.message || 'Payment confirmed successfully.');
      loadInstallments();
    } catch (err) {
      LoanFlow.Toast.show('danger', err.message || 'Could not confirm payment.');
    }
  }

  async function rejectPayment(id) {
    if (!confirm('Reject this payment submission?')) return;
    try {
      const res = await LoanFlow.api(`/installments/${id}/reject`, { method: 'PATCH' });
      LoanFlow.Toast.show('info', res.message || 'Payment rejected.');
      loadInstallments();
    } catch (err) {
      LoanFlow.Toast.show('danger', err.message || 'Could not reject payment.');
    }
  }

  populateLoans();
});
