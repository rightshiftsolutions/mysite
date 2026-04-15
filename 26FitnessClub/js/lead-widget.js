(function () {
    const STORAGE_KEY = 'gymmvp-wa-lead-state';
    const FALLBACK_PROGRAMS = [
        'Membership Plans',
        'Personal Training',
        'Weight Loss Program',
        'CrossFit',
        'Yoga & Mobility'
    ];

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function cleanText(value) {
        return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    }

    function sanitizePhoneNumber(value) {
        return String(value == null ? '' : value).replace(/[^\d]/g, '');
    }

    function sanitizeLeadPhone(value) {
        return String(value == null ? '' : value).replace(/[^\d+\-\s()]/g, '').replace(/\s+/g, ' ').trim();
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return { program: '', name: '', phone: '' };
            }

            const parsed = JSON.parse(raw);
            return {
                program: cleanText(parsed.program),
                name: cleanText(parsed.name),
                phone: sanitizeLeadPhone(parsed.phone)
            };
        } catch (error) {
            return { program: '', name: '', phone: '' };
        }
    }

    function saveState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                program: cleanText(state.program),
                name: cleanText(state.name),
                phone: sanitizeLeadPhone(state.phone)
            }));
        } catch (error) {
            // Ignore storage failures.
        }
    }

    async function loadSiteData() {
        if (window.GYMMVPSiteConfig && typeof window.GYMMVPSiteConfig.loadSiteData === 'function') {
            try {
                const sharedData = await window.GYMMVPSiteConfig.loadSiteData();
                if (sharedData && typeof sharedData === 'object') {
                    return sharedData;
                }
            } catch (error) {
                // Continue to local fallback.
            }
        }

        const fallback = window.GYMMVP_SITE_DATA && typeof window.GYMMVP_SITE_DATA === 'object'
            ? window.GYMMVP_SITE_DATA
            : {};

        if (Object.keys(fallback).length) {
            return fallback;
        }

        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error('Failed to load data.json');
            }

            const data = await response.json();

            try {
                const offerResponse = await fetch('offer.json');
                if (offerResponse.ok) {
                    data.offers = await offerResponse.json();
                }
            } catch (offerError) {
                // offer.json is optional
            }

            return data;
        } catch (error) {
            return {};
        }
    }

    function getBrandName(data) {
        const theme = data && data.theme ? data.theme : {};
        const brandText = [theme.brandTextWhite, theme.brandTextLight, theme.brandTextAccent]
            .map(cleanText)
            .filter(Boolean)
            .join('');

        if (brandText) {
            return brandText;
        }

        const brandIds = ['nav-brand-white', 'nav-brand-light', 'nav-brand-accent', 'shopBrandWhite', 'shopBrandLight', 'shopBrandAccent'];
        const brandParts = [];

        brandIds.forEach(function (id) {
            const element = document.getElementById(id);
            const text = cleanText(element && element.textContent);
            if (text) {
                brandParts.push(text);
            }
        });

        if (brandParts.length) {
            return brandParts.join('');
        }

        const brandElement = document.querySelector('.navbar-brand');
        const brandTextContent = cleanText(brandElement && brandElement.textContent);
        return brandTextContent || 'Fitness Club';
    }

    function getOfferTitle(offerData) {
        if (!offerData || typeof offerData !== 'object') {
            return '';
        }

        return [offerData.title, offerData.titleAccent, offerData.titleSuffix]
            .map(cleanText)
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getProgramOptions(data) {
        const options = [];
        const seen = new Set();
        const offerTitle = getOfferTitle(data && data.offers ? data.offers : null);

        if (offerTitle) {
            const offerValue = 'Current Offer - ' + offerTitle;
            options.push({
                value: offerValue,
                label: 'Current Offer',
                detail: offerTitle,
                isOffer: true
            });
            seen.add(offerValue.toLowerCase());
        }

        const programs = Array.isArray(data && data.programs) ? data.programs : [];
        programs.forEach(function (program) {
            const title = cleanText(program && program.title);
            if (!title) return;
            const key = title.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            options.push({
                value: title,
                label: title,
                detail: 'Program'
            });
        });

        if (!options.length) {
            FALLBACK_PROGRAMS.forEach(function (title) {
                const key = title.toLowerCase();
                if (seen.has(key)) return;
                seen.add(key);
                options.push({
                    value: title,
                    label: title,
                    detail: 'Program'
                });
            });
        }

        return options.slice(0, 7);
    }

    function getWidgetCopy(data, brandName, hasOwnerNumber) {
        const offerTitle = getOfferTitle(data && data.offers ? data.offers : null);
        const previewText = offerTitle
            ? 'Ask about ' + offerTitle
            : 'Ask about plans, prices and current offers';

        return {
            brandName: brandName,
            welcome: 'Hi there! Want details about memberships, training programs, or the latest offer?',
            intro: 'Select what you are interested in and I will prepare a WhatsApp message for the gym owner.',
            chooseProgram: 'Which program or offer would you like details about?',
            askName: 'Great choice. What is your name?',
            askPhone: 'Thanks! What phone number should we use to contact you?',
            summary: hasOwnerNumber
                ? 'Perfect. Tap below to send your details on WhatsApp.'
                : 'I can collect the lead details here. To open WhatsApp directly, keep data.json loading from a local server.',
            replyTime: hasOwnerNumber ? 'Usually replies quickly on WhatsApp' : 'Lead form preview mode',
            launcherTitle: 'Chat on WhatsApp',
            previewText: previewText,
            namePlaceholder: 'Enter your full name',
            phonePlaceholder: 'Enter your phone number',
            nameButton: 'Continue',
            phoneButton: 'Review Details',
            sendButton: hasOwnerNumber ? 'Send on WhatsApp' : 'WhatsApp setup needed',
            resetButton: 'Start over',
            changeButton: 'Change details',
            missingNumberMessage: 'WhatsApp number is unavailable right now. Keep contact.whatsappNumber filled in data.json and preview the site through a local server so JSON can load.'
        };
    }

    function getOwnerWhatsAppNumber(data) {
        const contact = data && data.contact ? data.contact : {};
        const primary = sanitizePhoneNumber(contact.whatsappNumber || '');
        if (primary) return primary;

        const fallback = sanitizePhoneNumber(contact.phone || '');
        return fallback;
    }

    function computeStep(state) {
        if (!cleanText(state.program)) return 1;
        if (!cleanText(state.name)) return 2;
        if (!cleanText(state.phone)) return 3;
        return 4;
    }

    function createWidgetShell(copy) {
        const widget = document.createElement('section');
        widget.className = 'wa-lead-widget';
        widget.setAttribute('aria-label', 'Sticky WhatsApp chat');

        widget.innerHTML = `
            <div class="wa-lead-hint" aria-hidden="true">${escapeHtml(copy.previewText)}</div>

            <button class="wa-launcher" type="button" aria-expanded="false" aria-controls="waLeadPanel">
                <span class="wa-launcher-pulse" aria-hidden="true"></span>
                <span class="wa-launcher-icon" aria-hidden="true"><i class="fab fa-whatsapp"></i></span>
                <span class="wa-launcher-copy">
                    <strong>${escapeHtml(copy.launcherTitle)}</strong>
                    <small>${escapeHtml(copy.replyTime)}</small>
                </span>
            </button>

            <div class="wa-panel" id="waLeadPanel" role="dialog" aria-modal="false" aria-label="WhatsApp lead chat">
                <div class="wa-panel-header">
                    <div class="wa-panel-brand">
                        <span class="wa-panel-brand-icon" aria-hidden="true"><i class="fab fa-whatsapp"></i></span>
                        <div>
                            <strong>${escapeHtml(copy.launcherTitle)}</strong>
                            <small>${escapeHtml(copy.replyTime)}</small>
                        </div>
                    </div>

                    <div class="wa-panel-actions">
                        <button class="wa-panel-action wa-reset-button" type="button">${escapeHtml(copy.resetButton)}</button>
                        <button class="wa-panel-close" type="button" aria-label="Close WhatsApp chat">
                            <i class="fas fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <div class="wa-chat-body">
                    <div class="wa-thread" id="waThread" aria-live="polite"></div>
                    <div class="wa-controls" id="waControls"></div>
                    <p class="wa-form-error" id="waFormError" hidden></p>
                </div>
            </div>
        `;

        return widget;
    }

    function buildThreadHtml(state, copy, hasOwnerNumber) {
        const safeProgram = escapeHtml(state.program);
        const safeName = escapeHtml(state.name);
        const safePhone = escapeHtml(state.phone);

        const bubbles = [
            `<div class="wa-bubble wa-bubble-bot">${escapeHtml(copy.welcome)}</div>`,
            `<div class="wa-bubble wa-bubble-bot wa-soft">${escapeHtml(copy.intro)}</div>`,
            `<div class="wa-bubble wa-bubble-bot">${escapeHtml(copy.chooseProgram)}</div>`
        ];

        if (state.program) {
            bubbles.push(`<div class="wa-bubble wa-bubble-user">${safeProgram}</div>`);
            bubbles.push(`<div class="wa-bubble wa-bubble-bot">${escapeHtml(copy.askName)}</div>`);
        }

        if (state.name) {
            bubbles.push(`<div class="wa-bubble wa-bubble-user">${safeName}</div>`);
            bubbles.push(`<div class="wa-bubble wa-bubble-bot">${escapeHtml(copy.askPhone)}</div>`);
        }

        if (state.phone) {
            bubbles.push(`<div class="wa-bubble wa-bubble-user">${safePhone}</div>`);
            bubbles.push(`<div class="wa-bubble wa-bubble-bot">${escapeHtml(copy.summary)}</div>`);

            if (!hasOwnerNumber) {
                bubbles.push(`<div class="wa-bubble wa-bubble-bot wa-warning">${escapeHtml(copy.missingNumberMessage)}</div>`);
            }
        }

        return bubbles.join('');
    }

    function buildControlsHtml(state, copy, programOptions, hasOwnerNumber) {
        const step = computeStep(state);

        if (step === 1) {
            return `
                <div class="wa-choices" role="list" aria-label="Program options">
                    ${programOptions.map(function (option) {
                        return `
                            <button
                                type="button"
                                class="wa-choice-button ${option.isOffer ? 'is-offer' : ''}"
                                data-program-value="${escapeHtml(option.value)}"
                                title="${escapeHtml(option.value)}"
                            >
                                <strong>${escapeHtml(option.label)}</strong>
                                <span>${escapeHtml(option.detail || 'Program')}</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            `;
        }

        if (step === 2) {
            return `
                <form class="wa-inline-form" id="waNameForm" novalidate>
                    <label class="visually-hidden" for="waLeadName">${escapeHtml(copy.askName)}</label>
                    <div class="wa-input-row">
                        <input class="wa-input" id="waLeadName" name="leadName" type="text" maxlength="80" autocomplete="name" placeholder="${escapeHtml(copy.namePlaceholder)}" value="${escapeHtml(state.name)}">
                        <button class="wa-inline-submit" type="submit">${escapeHtml(copy.nameButton)}</button>
                    </div>
                </form>
            `;
        }

        if (step === 3) {
            return `
                <form class="wa-inline-form" id="waPhoneForm" novalidate>
                    <label class="visually-hidden" for="waLeadPhone">${escapeHtml(copy.askPhone)}</label>
                    <div class="wa-input-row">
                        <input class="wa-input" id="waLeadPhone" name="leadPhone" type="tel" inputmode="tel" maxlength="20" autocomplete="tel" placeholder="${escapeHtml(copy.phonePlaceholder)}" value="${escapeHtml(state.phone)}">
                        <button class="wa-inline-submit" type="submit">${escapeHtml(copy.phoneButton)}</button>
                    </div>
                </form>
            `;
        }

        return `
            <div class="wa-summary-card">
                <div class="wa-summary-row"><span>Program</span><strong>${escapeHtml(state.program)}</strong></div>
                <div class="wa-summary-row"><span>Name</span><strong>${escapeHtml(state.name)}</strong></div>
                <div class="wa-summary-row"><span>Phone</span><strong>${escapeHtml(state.phone)}</strong></div>
            </div>
            ${hasOwnerNumber ? '' : `<p class="wa-config-note">${escapeHtml(copy.missingNumberMessage)}</p>`}
            <div class="wa-summary-actions">
                <button class="wa-panel-action wa-change-button" type="button">${escapeHtml(copy.changeButton)}</button>
                <button class="wa-send-button ${hasOwnerNumber ? '' : 'is-disabled'}" type="button">${escapeHtml(copy.sendButton)}</button>
            </div>
        `;
    }

    function validateName(value) {
        return cleanText(value).length >= 2;
    }

    function validatePhone(value) {
        return sanitizePhoneNumber(value).length >= 8;
    }

    function buildWhatsAppMessage(state, data, copy) {
        const offer = data && data.offers ? data.offers : {};
        const offerTitle = getOfferTitle(offer);
        const isOfferLead = offerTitle && cleanText(state.program).toLowerCase().indexOf(offerTitle.toLowerCase()) !== -1;
        const brandName = copy.brandName || 'Fitness Club';

        const lines = [];

        if (isOfferLead && cleanText(offer.whatsappMessage)) {
            lines.push(cleanText(offer.whatsappMessage));
        } else {
            lines.push('Hi ' + brandName + ' Team!');
        }

        lines.push('I came from the website and would like more details.');
        lines.push('');
        lines.push('Interested In: ' + cleanText(state.program));
        lines.push('Name: ' + cleanText(state.name));
        lines.push('Phone: ' + sanitizeLeadPhone(state.phone));

        if (offerTitle) {
            lines.push('Current Offer: ' + offerTitle);
        }

        lines.push('');
        lines.push('Please share fees, timings, and the joining process.');

        return lines.join('\n');
    }

    function setError(widget, message) {
        const errorElement = widget.querySelector('#waFormError');
        if (!errorElement) return;

        if (message) {
            errorElement.hidden = false;
            errorElement.textContent = message;
        } else {
            errorElement.hidden = true;
            errorElement.textContent = '';
        }
    }

    function focusActiveInput(widget) {
        window.requestAnimationFrame(function () {
            const nameInput = widget.querySelector('#waLeadName');
            const phoneInput = widget.querySelector('#waLeadPhone');

            if (nameInput) {
                nameInput.focus();
                nameInput.select();
                return;
            }

            if (phoneInput) {
                phoneInput.focus();
                phoneInput.select();
            }
        });
    }

    function toggleWidget(widget, shouldOpen) {
        const isOpen = typeof shouldOpen === 'boolean' ? shouldOpen : !widget.classList.contains('is-open');
        widget.classList.toggle('is-open', isOpen);
        const launcher = widget.querySelector('.wa-launcher');
        if (launcher) {
            launcher.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }

        if (isOpen) {
            focusActiveInput(widget);
        }
    }

    function initWidget(data) {
        const ownerNumber = getOwnerWhatsAppNumber(data);
        const brandName = getBrandName(data);
        const copy = getWidgetCopy(data, brandName, Boolean(ownerNumber));
        const programOptions = getProgramOptions(data);
        const state = loadState();

        const widget = createWidgetShell(copy);
        widget.dataset.configState = ownerNumber ? 'ready' : 'missing-number';
        document.body.appendChild(widget);
        document.body.classList.add('has-wa-lead-widget');

        const thread = widget.querySelector('#waThread');
        const controls = widget.querySelector('#waControls');
        const hint = widget.querySelector('.wa-lead-hint');

        function render() {
            thread.innerHTML = buildThreadHtml(state, copy, Boolean(ownerNumber));
            controls.innerHTML = buildControlsHtml(state, copy, programOptions, Boolean(ownerNumber));
            saveState(state);

            if (hint) {
                hint.textContent = state.program
                    ? 'Ready to send ' + cleanText(state.program)
                    : copy.previewText;
            }

            setError(widget, '');

            if (computeStep(state) > 1 && widget.classList.contains('is-open')) {
                focusActiveInput(widget);
            }
        }

        widget.addEventListener('click', function (event) {
            const launcher = event.target.closest('.wa-launcher');
            const closeButton = event.target.closest('.wa-panel-close');
            const resetButton = event.target.closest('.wa-reset-button');
            const changeButton = event.target.closest('.wa-change-button');
            const programButton = event.target.closest('[data-program-value]');
            const sendButton = event.target.closest('.wa-send-button');

            if (launcher) {
                toggleWidget(widget);
                return;
            }

            if (closeButton) {
                toggleWidget(widget, false);
                return;
            }

            if (resetButton) {
                state.program = '';
                state.name = '';
                state.phone = '';
                render();
                return;
            }

            if (changeButton) {
                state.name = '';
                state.phone = '';
                render();
                return;
            }

            if (programButton) {
                state.program = cleanText(programButton.getAttribute('data-program-value'));
                render();
                return;
            }

            if (sendButton) {
                if (!validateName(state.name) || !validatePhone(state.phone) || !cleanText(state.program)) {
                    setError(widget, 'Please complete the details before sending.');
                    return;
                }

                if (!ownerNumber) {
                    setError(widget, copy.missingNumberMessage);
                    return;
                }

                const message = buildWhatsAppMessage(state, data, copy);
                const url = 'https://wa.me/' + ownerNumber + '?text=' + encodeURIComponent(message);
                window.open(url, '_blank', 'noopener');
                return;
            }
        });

        widget.addEventListener('submit', function (event) {
            if (event.target && event.target.id === 'waNameForm') {
                event.preventDefault();
                const input = widget.querySelector('#waLeadName');
                const value = cleanText(input && input.value);
                if (!validateName(value)) {
                    setError(widget, 'Please enter your name.');
                    if (input) input.focus();
                    return;
                }
                state.name = value;
                render();
                return;
            }

            if (event.target && event.target.id === 'waPhoneForm') {
                event.preventDefault();
                const input = widget.querySelector('#waLeadPhone');
                const value = sanitizeLeadPhone(input && input.value);
                if (!validatePhone(value)) {
                    setError(widget, 'Please enter a valid phone number.');
                    if (input) input.focus();
                    return;
                }
                state.phone = value;
                render();
                return;
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && widget.classList.contains('is-open')) {
                toggleWidget(widget, false);
            }
        });

        document.addEventListener('click', function (event) {
            if (!widget.classList.contains('is-open')) return;
            if (widget.contains(event.target)) return;
            toggleWidget(widget, false);
        });

        render();
    }

    document.addEventListener('DOMContentLoaded', async function () {
        if (!document.body || document.body.dataset.disableLeadWidget === 'true') {
            return;
        }

        const data = await loadSiteData();
        initWidget(data || {});
    });
})();
