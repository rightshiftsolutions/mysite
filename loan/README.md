# LoanFlow — Loan Management Dashboard (Frontend)

A dark-themed, glass-forward SaaS frontend for the Loan Management API, built with
HTML5, Bootstrap 5.3, Bootstrap Icons, vanilla JavaScript and CSS. No build step —
open the pages directly in a browser or serve the folder statically.

## Getting started

1. Make sure the Loan Management API is running at `http://localhost:5000`
   (the base URL baked into `js/app.js`). To point at a different host, set
   `window.LOANFLOW_API_BASE` before `app.js` loads, e.g. add this to a page's
   `<head>`:
   ```html
   <script>window.LOANFLOW_API_BASE = 'https://api.example.com';</script>
   ```
2. Open `index.html` (or serve the folder with any static server — recommended,
   since some browsers restrict `fetch`/file uploads from `file://`):
   ```bash
   npx serve .
   ```
3. Register an account on `pages/register.html`, then sign in on `pages/login.html`.

## Structure

```
/css
  style.css        theme tokens, layout shell (sidebar/navbar), cards, buttons, badges, animations
  forms.css        floating labels, icon inputs, validation, wizard steps, dropzone
  tables.css       premium tables, pagination, progress bars, circular ring
  dashboard.css    stat grid, chart placeholder, summary/timeline layout
  responsive.css   desktop → tablet → mobile, offcanvas sidebar
/js
  app.js           API client (auto-attaches JWT, redirects on 401), auth storage,
                   sidebar/navbar rendering, toast notifications, formatters
  auth.js          login + register (including invite-link registration)
  dashboard.js     summary cards, repayment-health ring, recent loans, upcoming/overdue
  loan.js          create-loan live calculator, loan list, loan details
  table.js         tiny reusable client-side search/filter/paginate helper
  borrowers.js      borrowers list + remove
  disbursement.js   create disbursement (multipart upload) + disbursement list
  installments.js   installments by loan + mark-paid modal (multipart upload)
  invitations.js    send invite, copy link, invitation history
  profile.js        view/edit profile, delete account
/pages             every screen (dashboard, loans, borrowers, disbursements,
                    installments, invitations, profile, settings, auth, 404)
index.html          redirects to the dashboard or login depending on session state
```

### Why sidebar/navbar are JS-rendered instead of separate `.html` partials

Static `sidebar.html`/`navbar.html` files would need to be pulled in with `fetch()`,
which several browsers block for local files opened directly (`file://`) without a
server. Rendering them from a small template in `app.js` (`LoanFlow.initLayout()`)
keeps every page a single self-contained file that still shares one source of truth
for the nav — no duplication when you add a new link.

## Notes on the backend contract

- The API documentation flags several endpoints (Get/Update/Delete Loan, Get/Update/
  Delete Disbursement, Get Disbursements By Loan, Remove Borrower) as **not requiring
  auth** in the current backend. The frontend still sends the bearer token on these
  calls where relevant — no functional impact today, but keep this in mind if you
  add stricter handling.
- Loan math (interest, total payable, installment schedule) is calculated
  server-side. `js/loan.js` includes a **client-side preview only**, mirrored from
  the documented rules, so the "Loan Summary" card updates live — the server's
  response is always the source of truth after submit.
- File uploads (disbursement screenshot, installment payment proof) are sent as
  `multipart/form-data` per the docs; JSON updates to a disbursement do **not**
  support replacing the screenshot (documented backend limitation).
