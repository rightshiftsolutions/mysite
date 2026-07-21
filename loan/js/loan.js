/* ==========================================================================
   loan.js — Create Loan wizard + calculator, Loan List, Loan Details
   ========================================================================== */

const { fmt } = LoanFlow || {};

/* ---------------------------------------------------------------------
   Shared: client-side loan math mirrored from the API notes, purely for
   the live "Loan Summary" preview. The server recalculates authoritatively.
--------------------------------------------------------------------- */
function computeLoanPreview(f) {
  const amount = Number(f.loan_amount) || 0;
  const duration = Number(f.loan_duration) || 0;
  const interestValue = Number(f.interest_value) || 0;
  const penalty = Number(f.penalty_amount) || 0;

  const loanType = f.loan_type || 'time_bounded';
  const isTimeBounded = loanType === 'time_bounded';

  let durationInMonths = duration;
  if (f.duration_type === 'days') durationInMonths = duration / 30;
  else if (f.duration_type === 'weeks') durationInMonths = duration / 4.3452;
  else if (f.duration_type === 'years') durationInMonths = duration * 12;

  const frequency = f.frequency || 'monthly';
  let monthsPerPeriod = 1;
  if (frequency === 'quarterly') monthsPerPeriod = 3;
  else if (frequency === '6_months') monthsPerPeriod = 6;
  else if (frequency === 'yearly') monthsPerPeriod = 12;

  const installments = isTimeBounded
    ? Math.max(1, Math.round(durationInMonths / monthsPerPeriod))
    : 1;

  const repaymentType = isTimeBounded
    ? (f.repayment_type || 'interest_only')
    : 'interest_only';

  const monthlyInterest = (amount / 100) * interestValue;

  let interest = 0;
  if (isTimeBounded && repaymentType === 'interest_principal') {
    interest = monthlyInterest * durationInMonths;
  } else {
    // interest_only (both time_bounded and non_time_bounded)
    interest = monthlyInterest * installments;
  }

  interest = Number(interest.toFixed(2));
  const totalPayable = Number((amount + interest).toFixed(2));
  const installmentAmount = installments > 0 ? Number((totalPayable / installments).toFixed(2)) : totalPayable;

  return {
    interest, totalPayable, outstanding: amount, installments, installmentAmount, penalty
  };
}

/* ---------------------------------------------------------------------
   CREATE LOAN PAGE
--------------------------------------------------------------------- */
function initCreateLoanPage() {
  const form = document.getElementById('createLoanForm');
  if (!form) return;

  const borrowerSelect = document.getElementById('borrowerSelect');
  if (borrowerSelect) {
    LoanFlow.api('/lender-borrowers')
      .then(res => {
        const list = res.data || [];
        if (list.length === 0) {
          borrowerSelect.innerHTML = '<option value="" disabled>No borrowers found. Please invite first.</option>';
        } else {
          borrowerSelect.innerHTML = '<option value="" selected disabled>Choose borrower…</option>' +
            list.map(b => `<option value="${b.borrower_id}">${b.full_name} (${b.mobile || b.email})</option>`).join('');
        }
      })
      .catch(err => {
        borrowerSelect.innerHTML = '<option value="" disabled>Error loading borrowers</option>';
        LoanFlow.Toast.show('danger', err.message || 'Could not load borrowers.');
      });
  }

  const fields = ['borrower_id', 'loan_reason', 'loan_amount', 'loan_date', 'loan_duration', 'duration_type',
    'loan_type', 'interest_type', 'interest_value', 'penalty_amount', 'grace_period_days',
    'repayment_type', 'frequency', 'remarks'];

  const penaltyToggle = document.getElementById('penaltyEnabledToggle');
  const penaltyContainer = document.getElementById('penaltyFieldsContainer');
  const penaltyBox = document.getElementById('penaltyToggleBox');

  function handlePenaltyToggle() {
    if (penaltyToggle && penaltyContainer) {
      if (penaltyToggle.checked) {
        penaltyContainer.classList.remove('d-none');
      } else {
        penaltyContainer.classList.add('d-none');
      }
    }
  }

  penaltyBox?.addEventListener('click', (e) => {
    if (e.target !== penaltyToggle) {
      penaltyToggle.checked = !penaltyToggle.checked;
      handlePenaltyToggle();
      updatePreview();
    }
  });

  penaltyToggle?.addEventListener('change', () => {
    handlePenaltyToggle();
    updatePreview();
  });
  handlePenaltyToggle();

  function currentValues() {
    const f = {};
    fields.forEach(name => {
      const el = form.elements[name];
      if (el) f[name] = el.value;
    });
    if (penaltyToggle) {
      f.penalty_enabled = penaltyToggle.checked ? 1 : 0;
    }
    return f;
  }

  const steps = document.querySelectorAll('.wizard-step');
  const sections = document.querySelectorAll('[data-wizard-section]');

  const loanTypeSelect = form.elements['loan_type'];
  const repaymentTypeSelect = form.elements['repayment_type'];

  const durationContainer = document.getElementById('durationContainer');
  const loanDurationInput = document.getElementById('loanDurationInput');
  const durationTypeSelect = document.getElementById('durationTypeSelect');

  function handleLoanTypeChange() {
    if (loanTypeSelect) {
      const isTimeBounded = loanTypeSelect.value === 'time_bounded';

      // Toggle Duration fields visibility
      if (durationContainer) durationContainer.style.display = isTimeBounded ? '' : 'none';
      if (loanDurationInput) {
        if (isTimeBounded) {
          loanDurationInput.setAttribute('required', '');
        } else {
          loanDurationInput.removeAttribute('required');
        }
      }
      if (durationTypeSelect) {
        if (isTimeBounded) {
          durationTypeSelect.setAttribute('required', '');
        } else {
          durationTypeSelect.removeAttribute('required');
        }
      }

      // Toggle Repayment Section visibility
      if (steps[2]) steps[2].style.display = isTimeBounded ? '' : 'none';
      if (sections[2]) sections[2].style.display = isTimeBounded ? '' : 'none';

      // Update required attributes and value restrictions
      if (repaymentTypeSelect) {
        if (isTimeBounded) {
          repaymentTypeSelect.setAttribute('required', '');
          const opt = repaymentTypeSelect.querySelector('option[value="interest_principal"]');
          if (opt) opt.disabled = false;
        } else {
          repaymentTypeSelect.removeAttribute('required');
          repaymentTypeSelect.value = 'interest_only';
          const opt = repaymentTypeSelect.querySelector('option[value="interest_principal"]');
          if (opt) opt.disabled = true;
        }
      }

      const frequencySelect = form.elements['frequency'];
      if (frequencySelect) {
        if (isTimeBounded) {
          frequencySelect.setAttribute('required', '');
        } else {
          frequencySelect.removeAttribute('required');
          frequencySelect.value = 'monthly';
        }
      }

      updatePreview();
    }
  }

  loanTypeSelect?.addEventListener('change', handleLoanTypeChange);
  handleLoanTypeChange();

  function updatePreview() {
    const f = currentValues();
    const p = computeLoanPreview(f);
    document.getElementById('prevInterest').textContent = fmt.money(p.interest);
    document.getElementById('prevPenalty').textContent = fmt.money(p.penalty);
    document.getElementById('prevInstallments').textContent = p.installments;
    document.getElementById('prevInstallmentAmount').textContent = fmt.money(p.installmentAmount) + ' / installment';
    document.getElementById('prevTotalPayable').textContent = fmt.money(p.totalPayable);
    document.getElementById('prevOutstanding').textContent = fmt.money(p.outstanding);
  }

  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);
  updatePreview();

  // Wizard step highlight as user scrolls/tabs through fieldsets
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = [...sections].indexOf(entry.target);
        steps.forEach((s, i) => {
          s.classList.toggle('active', i === idx);
          s.classList.toggle('complete', i < idx);
        });
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => io.observe(s));

  const params = new URLSearchParams(location.search);
  const editLoanId = params.get('id');

  if (editLoanId) {
    const pageHeader = document.querySelector('h3.fw-semibold');
    if (pageHeader) pageHeader.textContent = `Edit Loan #${editLoanId}`;
    const submitBtn = document.getElementById('submitLoanBtn');
    if (submitBtn) submitBtn.querySelector('.btn-text').innerHTML = `<i class="bi bi-check2-circle me-1"></i>Update Loan`;

    LoanFlow.api('/loans/' + editLoanId)
      .then(res => {
        const l = res.data || {};
        fields.forEach(name => {
          const el = form.elements[name];
          if (el && l[name] !== undefined && l[name] !== null) {
            if (name === 'loan_date' && typeof l[name] === 'string') {
              el.value = l[name].split('T')[0];
            } else {
              el.value = l[name];
            }
          }
        });
        if (penaltyToggle) {
          penaltyToggle.checked = Boolean(l.penalty_enabled);
          handlePenaltyToggle();
        }
        handleLoanTypeChange();
        updatePreview();
      })
      .catch(err => {
        LoanFlow.Toast.show('danger', 'Could not load loan details for editing.');
      });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    const btn = document.getElementById('submitLoanBtn');
    btn.classList.add('is-loading'); btn.disabled = true;

    const f = currentValues();
    const isTimeBounded = f.loan_type === 'time_bounded';
    const isPenaltyOn = penaltyToggle ? penaltyToggle.checked : false;

    const payload = {
      borrower_id: Number(f.borrower_id),
      loan_reason: f.loan_reason,
      loan_amount: Number(f.loan_amount),
      loan_date: f.loan_date,
      loan_duration: isTimeBounded ? Number(f.loan_duration) : 0,
      duration_type: isTimeBounded ? f.duration_type : 'months',
      loan_type: f.loan_type,
      interest_type: f.interest_type || 'per_100',
      interest_value: Number(f.interest_value),
      penalty_enabled: isPenaltyOn ? 1 : 0,
      penalty_amount: isPenaltyOn ? Number(f.penalty_amount || 0) : 0,
      grace_period_days: isPenaltyOn ? Number(f.grace_period_days || 0) : 0,
      repayment_type: isTimeBounded ? f.repayment_type : 'interest_only',
      frequency: f.frequency || 'monthly',
      remarks: f.remarks || ''
    };

    try {
      let res;
      if (editLoanId) {
        res = await LoanFlow.api(`/loans/${editLoanId}`, { method: 'PUT', body: payload });
        LoanFlow.Toast.show('success', 'Loan updated — installments recalculated successfully.');
      } else {
        res = await LoanFlow.api('/loans', { method: 'POST', body: payload });
        LoanFlow.Toast.show('success', 'Loan created — installments generated automatically.');
      }
      const targetId = editLoanId || res.loanId;
      setTimeout(() => window.location.href = `loan-details.html?id=${targetId}`, 700);
    } catch (err) {
      LoanFlow.Toast.show('danger', err.message || 'Could not save the loan.');
    } finally {
      btn.classList.remove('is-loading'); btn.disabled = false;
    }
  });
}

/* ---------------------------------------------------------------------
   LOAN LIST PAGE
--------------------------------------------------------------------- */
function initLoanListPage() {
  const tbody = document.getElementById('loanListBody');
  if (!tbody) return;

  const searchInput = document.getElementById('loanSearch');
  const statusSelect = document.getElementById('loanStatusFilter');
  const paginationEl = document.getElementById('loanPagination');
  const countEl = document.getElementById('loanCount');

  let table;

  function rowHtml(l) {
    return `
      <tr>
        <td><span class="code-id text-secondary">#${l.id}</span></td>
        <td>
          <div class="fw-semibold">${l.borrower || l.loan_reason || '—'}</div>
          <div class="small text-secondary">${l.loan_reason || ''}</div>
        </td>
        <td class="mono amount">${fmt.money(l.loan_amount)}</td>
        <td>${fmt.date(l.loan_date)}</td>
        <td>${fmt.date(l.due_date)}</td>
        <td><span class="badge-status ${fmt.badgeClass(l.status)}">${l.status || '—'}</span></td>
        <td>
          <div class="action-btns">
            <a class="btn btn-outline-soft btn-icon-only" title="View" href="loan-details.html?id=${l.id}"><i class="bi bi-eye"></i></a>
            <button class="btn btn-outline-soft btn-icon-only" title="Edit" data-edit="${l.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-soft-danger btn-icon-only" title="Delete" data-delete="${l.id}"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>`;
  }

  function render(rows) {
    tbody.innerHTML = rows.length ? rows.map(rowHtml).join('') :
      `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-inbox"></i>No loans match your filters.</div></td></tr>`;

    tbody.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteLoan(btn.dataset.delete)));
    tbody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => window.location.href = `create-loan.html?id=${btn.dataset.edit}`));
  }

  async function acceptLoan(id) {
    try {
      await LoanFlow.api(`/loans/${id}/accept`, { method: 'PATCH' });
      LoanFlow.Toast.show('success', 'Loan accepted.');
      loadLoans();
    } catch (err) { LoanFlow.Toast.show('danger', err.message || 'Could not accept loan.'); }
  }

  async function deleteLoan(id) {
    if (!confirm('Delete this loan? This cannot be undone.')) return;
    try {
      await LoanFlow.api(`/loans/${id}`, { method: 'DELETE' });
      LoanFlow.Toast.show('success', 'Loan deleted.');
      loadLoans();
    } catch (err) { LoanFlow.Toast.show('danger', err.message || 'Could not delete loan.'); }
  }

  async function loadLoans() {
    tbody.innerHTML = LoanFlow.skeletonRows(7, 6);
    try {
      const res = await LoanFlow.api('/loans/lender');
      let rows = res.data || [];
      const params = new URLSearchParams(location.search);
      const filterBorrower = params.get('borrower');
      if (filterBorrower) {
        rows = rows.filter(r => String(r.borrower_id) === String(filterBorrower));
      }
      table = new LFTable({ data: rows, pageSize: 8, searchKeys: ['borrower', 'loan_reason'], render, paginationEl, countEl });
      table.renderPage();
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-exclamation-circle"></i>${err.message || 'Could not load loans.'}</div></td></tr>`;
    }
  }

  searchInput?.addEventListener('input', () => table?.search(searchInput.value));
  statusSelect?.addEventListener('change', () => table?.filterStatus(statusSelect.value));

  loadLoans();
}

/* ---------------------------------------------------------------------
   LOAN DETAILS PAGE
--------------------------------------------------------------------- */
function initLoanDetailsPage() {
  const root = document.getElementById('loanDetailsRoot');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const loanId = params.get('id');
  if (!loanId) { root.innerHTML = `<div class="empty-state"><i class="bi bi-question-circle"></i>No loan specified.</div>`; return; }

  let activeLoan = null;
  let attachments = [];
  function renderAttachments() {
    const wrap = document.getElementById('loanAttachments');
    if (!wrap) return;
    if (!attachments.length) {
      wrap.innerHTML = '<div class="text-secondary small">No attachments available.</div>';
      return;
    }
    wrap.innerHTML = attachments.map(a => `
      <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--border)!important;">
        <span class="small text-truncate" style="max-width:180px;" title="${a.name}"><i class="bi bi-file-image me-2 text-secondary"></i>${a.name}</span>
        <a class="btn btn-outline-soft btn-sm px-2 py-0 fs-7" href="${a.url}" target="_blank">View</a>
      </div>
    `).join('');
  }

  /* ---- Pay Installment Modal wiring ---- */
  let activeInstallmentId = null;
  const payModalEl = document.getElementById('payModal');
  const payModal = payModalEl ? new bootstrap.Modal(payModalEl) : null;
  const payFileInput = document.getElementById('payScreenshotInput');
  const payPreview = document.getElementById('payScreenshotPreview');
  const payDropzone = document.getElementById('payDropzone');

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
    payFileInput.value = '';
    payPreview.classList.add('d-none');
    payModal?.show();
  }

  document.getElementById('confirmPayBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('confirmPayBtn');
    btn.classList.add('is-loading'); btn.disabled = true;
    const fd = new FormData();
    if (payFileInput.files[0]) fd.append('payment_proof', payFileInput.files[0]);
    try {
      await LoanFlow.api(`/installments/${activeInstallmentId}/pay`, { method: 'PATCH', body: fd, isForm: true });
      LoanFlow.Toast.show('success', 'Installment payment recorded successfully.');
      payModal?.hide();
      loadLoan(); // Refresh numbers
      loadInstallments(); // Refresh timeline
    } catch (err) {
      LoanFlow.Toast.show('danger', err.message || 'Could not record installment payment.');
    } finally {
      btn.classList.remove('is-loading'); btn.disabled = false;
    }
  });

  async function startInit() {
    await loadLoan();
    loadInstallments();
    loadDisbursements();
  }
  startInit();

  function setTxt(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val !== undefined && val !== null ? val : '—';
  }

  function setHtml(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val || '';
  }

  async function loadLoan() {
    try {
      const res = await LoanFlow.api(`/loans/${loanId}`);
      const l = res.data || {};
      activeLoan = l;

      setTxt('loanReason', l.loan_reason || 'Loan #' + l.id);
      setTxt('loanBorrower', (l.borrower && l.borrower.full_name) || l.borrower_name || '—');
      setHtml('loanStatusBadge', `<span class="badge-status ${fmt.badgeClass(l.status)}">${l.status || '—'}</span>`);
      setTxt('loanAmount', fmt.money(l.loan_amount));
      setTxt('loanDate', fmt.date(l.loan_date));
      setTxt('loanDueDate', fmt.date(l.due_date));
      setTxt('loanType', l.loan_type === 'non_time_bounded' ? 'Non-Time Bounded' : 'Time Bounded');
      setTxt('loanRepaymentType', l.repayment_type === 'interest_principal' ? 'Interest & Principal' : 'Interest Only');

      let freqLabel = '—';
      if (l.frequency === 'monthly') freqLabel = 'Monthly';
      else if (l.frequency === 'quarterly') freqLabel = 'Quarterly';
      else if (l.frequency === '6_months') freqLabel = 'Half-Yearly';
      else if (l.frequency === 'yearly') freqLabel = 'Yearly';
      setTxt('loanFrequency', freqLabel);

      setTxt('loanInstallmentAmount', fmt.money(l.installment_amount));
      setTxt('loanInstallmentCount', l.number_of_installments || 1);
      setTxt('loanRemarks', l.remarks || 'No remarks provided.');

      // Interest & Penalty Details
      setTxt('loanInterestType', l.interest_type ? l.interest_type.replace('_', ' ') : '—');
      setTxt('loanInterestVal', l.interest_type === 'percentage' ? `${l.interest_value}%` : fmt.money(l.interest_value));

      const computedInterestAmt = (l.interest_amount !== undefined && l.interest_amount !== null && Number(l.interest_amount) > 0)
        ? l.interest_amount
        : Number(Math.max(0, Number(l.total_payable || 0) - Number(l.loan_amount || 0)).toFixed(2));

      setTxt('loanInterestAmt', fmt.money(computedInterestAmt));
      setTxt('loanTotalPayable', fmt.money(l.total_payable));
      setTxt('loanOutstanding', fmt.money(l.outstanding_amount));

      setTxt('loanPenaltyEnabled', l.penalty_enabled ? 'Yes' : 'No');
      setTxt('loanPenaltyAmt', fmt.money(l.penalty_amount));
      setTxt('loanGraceDays', `${l.grace_period_days || 0} days`);
      setTxt('loanAccruedPenalty', fmt.money(l.current_penalty));
      setTxt('loanTotalOutstanding', fmt.money(l.total_outstanding));

      // Borrower Details
      const borrowerName = (l.borrower && l.borrower.full_name) || l.borrower_name || 'Borrower';
      const borrowerMobile = (l.borrower && l.borrower.mobile) || l.borrower_mobile || '';
      const borrowerEmail = (l.borrower && l.borrower.email) || l.borrower_email || '—';

      setTxt('borrowerAvatar', fmt.initials(borrowerName));
      setTxt('borrowerName', borrowerName);
      setHtml('borrowerStatus', `<span class="badge-status ${fmt.badgeClass(l.borrower?.status)}">${l.borrower?.status || '—'}</span>`);
      setTxt('borrowerEmail', borrowerEmail);
      setTxt('borrowerMobile', borrowerMobile);

      const loanAmountStr = fmt.money(l.loan_amount);
      const totalPayableStr = fmt.money(l.total_payable);
      const installmentAmountStr = fmt.money(l.installment_amount);

      const loanTypeLabel = l.loan_type === 'non_time_bounded' ? 'Non-Time Bounded' : 'Time Bounded';
      const repaymentTypeLabel = l.repayment_type === 'interest_principal' ? 'Interest & Principal' : 'Interest Only';
      const interestValStr = l.interest_type === 'percentage' ? `${l.interest_value}%` : fmt.money(l.interest_value);
      const computedInterestStr = fmt.money(computedInterestAmt);
      const penaltyEnabledStr = l.penalty_enabled ? 'Enabled' : 'Disabled';
      const penaltyAmtStr = fmt.money(l.penalty_amount);
      const gracePeriodStr = `${l.grace_period_days || 0} days`;
      const accruedPenaltyStr = fmt.money(l.current_penalty || 0);
      const totalOutstandingStr = fmt.money(l.total_outstanding || l.outstanding_amount || l.loan_amount);

      let cleanMobile = borrowerMobile.replace(/\D/g, '');
      if (cleanMobile.length === 10) {
        cleanMobile = '91' + cleanMobile;
      }

      const shareBtn = document.getElementById('shareWhatsAppBtn');
      const shareModalEl = document.getElementById('shareWhatsAppModal');
      let shareModal;
      if (shareModalEl && window.bootstrap) {
        shareModal = new bootstrap.Modal(shareModalEl);
      }

      if (shareBtn) {
        shareBtn.onclick = (e) => {
          e.preventDefault();
          setTxt('waBorrowerNameDisplay', borrowerName);
          const pwdInput = document.getElementById('waBorrowerPasswordInput');
          if (pwdInput) pwdInput.value = '';
          if (shareModal) {
            shareModal.show();
          } else {
            sendWhatsAppMsg('');
          }
        };
      }

      const confirmShareBtn = document.getElementById('confirmShareWhatsAppBtn');
      if (confirmShareBtn) {
        confirmShareBtn.onclick = () => {
          const pwdInput = document.getElementById('waBorrowerPasswordInput');
          const typedPassword = pwdInput && pwdInput.value ? pwdInput.value.trim() : '[ENTER_PASSWORD]';
          if (shareModal) shareModal.hide();
          sendWhatsAppMsg(typedPassword);
        };
      }

      function sendWhatsAppMsg(pass) {
        const finalPassword = pass || '[ENTER_PASSWORD]';

        const text = `📄 *LOAN AGREEMENT & DETAILS*\n\n` +
          `Dear *${borrowerName}*,\n\n` +
          `Your loan has been successfully created. Please review the details below:\n\n` +
          `*📌 Loan Information*\n` +
          `• *Borrower:* ${borrowerName}\n` +
          `• *Loan Purpose:* ${l.loan_reason || '—'}\n` +
          `• *Loan Type:* ${loanTypeLabel}\n` +
          `• *Principal Amount:* ${loanAmountStr}\n` +
          `• *Loan Start Date:* ${fmt.date(l.loan_date)}\n` +
          `• *Loan Due Date:* ${fmt.date(l.due_date)}\n` +
          `• *Repayment Mode:* ${repaymentTypeLabel}\n` +
          `• *Payment Frequency:* ${freqLabel}\n` +
          `• *Installment Amount:* ${installmentAmountStr}\n` +
          `• *Total Installments:* ${l.number_of_installments || 1}\n` +
          `• *Remarks:* ${l.remarks || 'No remarks provided.'}\n\n` +
          `*💰 Interest & Penalty Details*\n` +
          `• *Interest Type:* ₹${l.interest_value || 1} per ₹100\n` +
          `• *Interest Value:* ${interestValStr}\n` +
          `• *Total Interest:* ${computedInterestStr}\n` +
          `• *Total Amount Payable:* ${totalPayableStr}\n` +
          `• *Outstanding Principal:* ${fmt.money(l.outstanding_amount)}\n` +
          `• *Late Payment Penalty:* ${penaltyEnabledStr}\n` +
          `• *Penalty Charge:* ${penaltyAmtStr} per day\n` +
          `• *Grace Period:* ${gracePeriodStr}\n` +
          `• *Accrued Penalty:* ${accruedPenaltyStr}\n` +
          `• *Current Outstanding Amount:* ${totalOutstandingStr}\n\n` +
          `🔗 *Loan Ledger Portal*\n` +
          `https://www.gymgurus.in/loanledger/login.html\n\n` +
          `🔐 *Login Credentials*\n` +
          `• *Email:* ${borrowerEmail}\n` +
          `• *Password:* ${finalPassword}\n\n` +
          `Please log in to the portal to view your complete loan details, repayment schedule, payment history, and future installments.\n\n` +
          `Thank you.`;

        const whatsappUrl = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
      }

      // Lender Details
      if (l.lender && l.lender.id) {
        setTxt('lenderAvatar', fmt.initials(l.lender.full_name));
        setTxt('lenderName', l.lender.full_name || '—');
        setHtml('lenderStatus', `<span class="badge-status ${fmt.badgeClass(l.lender.status)}">${l.lender.status || '—'}</span>`);
        setTxt('lenderEmail', l.lender.email || '—');
        setTxt('lenderMobile', l.lender.mobile || '—');
      }

      const pct = l.total_payable ? Math.min(100, Math.round(((l.total_payable - (l.outstanding_amount ?? l.total_payable)) / l.total_payable) * 100)) : 0;
      const bar = document.getElementById('loanProgressBar');
      if (bar) { bar.style.width = pct + '%'; document.getElementById('loanProgressPct').textContent = pct + '%'; }

      const currentUser = LoanFlow.Auth.getUser() || {};
      const isBorrower = (String(l.borrower_id) === String(currentUser.id));
      const isLender = (String(l.lender_id) === String(currentUser.id));

      const acceptBtn = document.getElementById('acceptLoanBtn');
      const rejectBtn = document.getElementById('rejectLoanBtn');
      const editLink = document.getElementById('editLoanLink');
      const disbLink = document.getElementById('createDisbursementLink');

      if (isBorrower) {
        if (editLink) editLink.classList.add('d-none');
        if (disbLink) disbLink.classList.add('d-none');
        if (shareBtn) shareBtn.classList.add('d-none');

        if (l.status === 'pending') {
          if (acceptBtn) {
            acceptBtn.classList.remove('d-none');
            acceptBtn.onclick = async () => {
              try {
                acceptBtn.disabled = true;
                await LoanFlow.api(`/loans/${l.id}/accept`, { method: 'PATCH' });
                LoanFlow.Toast.show('success', 'Loan offer accepted!');
                loadLoan();
                loadInstallments();
              } catch (err) {
                LoanFlow.Toast.show('danger', err.message || 'Could not accept loan.');
                acceptBtn.disabled = false;
              }
            };
          }
          if (rejectBtn) {
            rejectBtn.classList.remove('d-none');
            rejectBtn.onclick = async () => {
              if (!confirm('Reject this loan offer?')) return;
              try {
                rejectBtn.disabled = true;
                await LoanFlow.api(`/loans/${l.id}/reject`, { method: 'PATCH' });
                LoanFlow.Toast.show('info', 'Loan offer rejected.');
                setTimeout(() => window.location.href = 'borrowed-loans.html', 700);
              } catch (err) {
                LoanFlow.Toast.show('danger', err.message || 'Could not reject loan.');
                rejectBtn.disabled = false;
              }
            };
          }
        } else {
          if (acceptBtn) acceptBtn.classList.add('d-none');
          if (rejectBtn) rejectBtn.classList.add('d-none');
        }
      } else if (isLender) {
        if (acceptBtn) acceptBtn.classList.add('d-none');
        if (rejectBtn) rejectBtn.classList.add('d-none');

        if (editLink) {
          editLink.href = `create-loan.html?id=${l.id}`;
          editLink.classList.remove('d-none');
        }
        if (disbLink) {
          disbLink.href = `create-disbursement.html?loanId=${l.id}`;
          disbLink.classList.remove('d-none');
        }
        if (shareBtn) {
          shareBtn.classList.remove('d-none');
        }
      }
    } catch (err) {
      root.innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-circle"></i>${err.message || 'Could not load this loan.'}</div>`;
    }
  }

  async function loadInstallments() {
    const wrap = document.getElementById('installmentTimeline');
    try {
      const res = await LoanFlow.api(`/installments/loan/${loanId}`);
      const rows = res.data || [];
      if (!rows.length) { wrap.innerHTML = `<div class="empty-state py-3"><i class="bi bi-calendar-x"></i>No installments generated.</div>`; return; }

      attachments = attachments.filter(a => !a.name.startsWith('Installment #'));
      rows.forEach(i => {
        if (i.screenshot_url) {
          attachments.push({
            name: `Installment #${i.installment_no} Proof`,
            url: i.screenshot_url
          });
        }
      });
      renderAttachments();

      const currentUser = LoanFlow.Auth.getUser() || {};
      const isBorrower = activeLoan && String(activeLoan.borrower_id) === String(currentUser.id);
      const isLender = activeLoan && String(activeLoan.lender_id) === String(currentUser.id);

      wrap.innerHTML = rows.map((i, idx) => {
        const state = i.status === 'paid' ? 'done' : i.status === 'overdue' ? 'overdue' : 'next';
        const icon = i.status === 'paid' ? 'bi-check-lg' : i.status === 'overdue' ? 'bi-exclamation' : 'bi-clock';
        const totalAmt = i.total_amount !== undefined ? i.total_amount : (i.amount || 0);

        return `
        <div class="timeline-item">
          ${idx < rows.length - 1 ? '<div class="thread-line"></div>' : ''}
          <div class="thread-node ${state}"><i class="bi ${icon}"></i></div>
          <div class="flex-fill d-flex justify-content-between align-items-center pb-2">
            <div>
              <div class="fw-semibold small">Installment #${i.installment_no}</div>
              <div class="text-secondary small"><i class="bi bi-calendar3 me-1"></i>Due Date: <strong class="text-white">${fmt.date(i.due_date)}</strong></div>
              ${Number(i.principal_amount) > 0 ? `<div class="text-muted" style="font-size:0.75rem;">Principal: ${fmt.money(i.principal_amount)} | Interest: ${fmt.money(i.interest_amount)}</div>` : `<div class="text-muted" style="font-size:0.75rem;">Interest: ${fmt.money(i.interest_amount)}</div>`}
            </div>
            <div class="text-end">
              <div class="mono fw-bold text-white fs-6">${fmt.money(totalAmt)}</div>
              <div class="d-flex align-items-center gap-1 justify-content-end mt-1">
                <span class="badge-status ${fmt.badgeClass(i.status)}">${i.status}</span>
              </div>
            </div>
          </div>
        </div>`;
      }).join('');

      wrap.querySelectorAll('[data-pay]').forEach(btn => {
        btn.addEventListener('click', () => openPayModal(btn.dataset.pay));
      });
    } catch (err) {
      wrap.innerHTML = `<div class="empty-state py-3"><i class="bi bi-exclamation-circle"></i>Could not load installments.</div>`;
    }
  }

  async function loadDisbursements() {
    const wrap = document.getElementById('disbursementHistory');
    try {
      const res = await LoanFlow.api(`/disbursements/loan/${loanId}`);
      const rows = res.data || [];
      if (!rows.length) { wrap.innerHTML = `<div class="empty-state py-3"><i class="bi bi-send-x"></i>No disbursements yet.</div>`; return; }

      attachments = attachments.filter(a => !a.name.startsWith('Disbursement #'));
      rows.forEach(d => {
        if (d.screenshot_url) {
          attachments.push({
            name: `Disbursement #${d.id} Proof`,
            url: d.screenshot_url
          });
        }
      });
      renderAttachments();

      wrap.innerHTML = rows.map(d => `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom" style="border-color:var(--border)!important;">
          <div>
            <div class="fw-semibold small">${d.payment_method || '—'}</div>
            <div class="text-secondary small">${fmt.date(d.transaction_date)}</div>
          </div>
          <div class="mono fw-semibold">${fmt.money(d.amount)}</div>
        </div>
      `).join('');
    } catch (err) {
      wrap.innerHTML = `<div class="empty-state py-3"><i class="bi bi-exclamation-circle"></i>Could not load disbursements.</div>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCreateLoanPage();
  initLoanListPage();
  initLoanDetailsPage();
});
