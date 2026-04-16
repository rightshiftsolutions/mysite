/*!
* Start Bootstrap - 26fitnessClub Scripts
*/
//
// Scripts
//

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[char]));
}

function escapeAttribute(value = '') {
    return escapeHtml(value);
}

function normalizeUrl(value) {
    const raw = String(value || '').trim();

    if (!raw || raw === '#' || raw === '#!' || /^javascript:/i.test(raw)) {
        return '';
    }

    if (/^(https?:\/\/|mailto:|tel:|\/\/)/i.test(raw)) {
        return raw;
    }

    if (/^(wa\.me\/|api\.whatsapp\.com\/)/i.test(raw)) {
        return `https://${raw}`;
    }

    if (/^[\w.-]+\.[A-Za-z]{2,}(\/.*)?$/.test(raw)) {
        return `https://${raw}`;
    }

    return '';
}


const THEME_PRESETS = {
    'obsidian-gold': { themeColor: '#050608' },
    'arctic-silver': { themeColor: '#060a12' },
    'emerald-elite': { themeColor: '#06100c' },
    'electric-cyan': { themeColor: '#040c10' },
    'crimson-luxe': { themeColor: '#12070a' },
    'royal-amethyst': { themeColor: '#090712' },
    'sunset-ember': { themeColor: '#130907' },
};

const THEME_PRESET_ALIASES = {
    gold: 'obsidian-gold',
    luxe: 'obsidian-gold',
    obsidian: 'obsidian-gold',
    silver: 'arctic-silver',
    arctic: 'arctic-silver',
    emerald: 'emerald-elite',
    green: 'emerald-elite',
    cyan: 'electric-cyan',
    blue: 'electric-cyan',
    electric: 'electric-cyan',
    crimson: 'crimson-luxe',
    red: 'crimson-luxe',
    ruby: 'crimson-luxe',
    amethyst: 'royal-amethyst',
    purple: 'royal-amethyst',
    violet: 'royal-amethyst',
    ember: 'sunset-ember',
    sunset: 'sunset-ember',
    orange: 'sunset-ember',
};

function normalizeThemePreset(value = '') {
    const raw = String(value || '').trim().toLowerCase().replace(/[_\s]+/g, '-');

    if (THEME_PRESETS[raw]) {
        return raw;
    }

    return THEME_PRESET_ALIASES[raw] || 'obsidian-gold';
}

function applyThemePreset(theme = {}) {
    const preset = normalizeThemePreset(theme.preset || theme.themePreset || theme.name || '');
    const themeMeta = THEME_PRESETS[preset] || THEME_PRESETS['obsidian-gold'];

    if (document.body) {
        document.body.dataset.theme = preset;
    }

    document.documentElement.setAttribute('data-premium-theme', preset);

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (themeColorMeta && themeMeta.themeColor) {
        themeColorMeta.setAttribute('content', themeMeta.themeColor);
    }

    return preset;
}

function setDynamicLink(element, value, label = '') {
    if (!element) return false;

    const normalized = normalizeUrl(value);
    const isActive = Boolean(normalized);

    element.href = isActive ? normalized : '#!';
    element.classList.toggle('is-disabled', !isActive);

    if (label) {
        element.setAttribute('aria-label', isActive ? label : `${label} link not configured`);
        element.setAttribute('title', isActive ? label : `${label} link not configured`);
    }

    if (isActive) {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
        element.removeAttribute('aria-disabled');
        element.removeAttribute('tabindex');
    } else {
        element.removeAttribute('target');
        element.removeAttribute('rel');
        element.setAttribute('aria-disabled', 'true');
        element.setAttribute('tabindex', '-1');
    }

    return isActive;
}

function titleCase(value = '') {
    return String(value)
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getSocialPlatforms(socialData = {}) {
    const order = ['instagram', 'facebook', 'twitter', 'x', 'youtube', 'linkedin', 'whatsapp', 'tiktok', 'threads', 'telegram', 'discord', 'pinterest', 'website'];

    const config = {
        instagram: {
            label: 'Instagram',
            icon: 'fab fa-instagram',
            headline: 'Reels, results, and real momentum.',
            description: 'Daily stories, transformations, aesthetics, and gym energy in one place.',
            cta: 'Open Instagram',
            tone: '#E4405F',
            toneGlow: 'rgba(228, 64, 95, 0.34)',
            tags: ['Reels', 'Stories'],
        },
        facebook: {
            label: 'Facebook',
            icon: 'fab fa-facebook-f',
            headline: 'Community updates that are easy to follow.',
            description: 'Announcements, events, reviews, and member moments without the clutter.',
            cta: 'Open Facebook',
            tone: '#1877F2',
            toneGlow: 'rgba(24, 119, 242, 0.32)',
            tags: ['Events', 'Community'],
        },
        twitter: {
            label: 'Twitter / X',
            icon: 'fab fa-twitter',
            headline: 'Fast updates, zero fluff.',
            description: 'Fresh drops, quick alerts, and sharp brand updates at a glance.',
            cta: 'Open Twitter / X',
            tone: '#1DA1F2',
            toneGlow: 'rgba(29, 161, 242, 0.30)',
            tags: ['Updates', 'Drops'],
        },
        x: {
            label: 'Twitter / X',
            icon: 'fab fa-twitter',
            headline: 'Fast updates, zero fluff.',
            description: 'Fresh drops, quick alerts, and sharp brand updates at a glance.',
            cta: 'Open Twitter / X',
            tone: '#1DA1F2',
            toneGlow: 'rgba(29, 161, 242, 0.30)',
            tags: ['Updates', 'Drops'],
        },
        youtube: {
            label: 'YouTube',
            icon: 'fab fa-youtube',
            headline: 'Long-form workouts and premium video content.',
            description: 'Training videos, highlights, walkthroughs, and deeper brand storytelling.',
            cta: 'Open YouTube',
            tone: '#FF0000',
            toneGlow: 'rgba(255, 0, 0, 0.28)',
            tags: ['Workouts', 'Videos'],
        },
        linkedin: {
            label: 'LinkedIn',
            icon: 'fab fa-linkedin-in',
            headline: 'Professional growth and business-side updates.',
            description: 'Milestones, partnerships, hiring updates, and the brand-building side of the gym.',
            cta: 'Open LinkedIn',
            tone: '#0A66C2',
            toneGlow: 'rgba(10, 102, 194, 0.28)',
            tags: ['Growth', 'Milestones'],
        },
        whatsapp: {
            label: 'WhatsApp',
            icon: 'fab fa-whatsapp',
            headline: 'Direct chat with the team.',
            description: 'Open a conversation quickly for offers, questions, bookings, and replies.',
            cta: 'Open WhatsApp',
            tone: '#25D366',
            toneGlow: 'rgba(37, 211, 102, 0.28)',
            tags: ['Chat', 'Support'],
        },
        tiktok: {
            label: 'TikTok',
            icon: 'fab fa-tiktok',
            headline: 'Short-form intensity and trend-driven clips.',
            description: 'Quick motivation bursts, gym edits, and punchy content that is easy to consume.',
            cta: 'Open TikTok',
            tone: '#111111',
            toneGlow: 'rgba(255, 255, 255, 0.18)',
            tags: ['Clips', 'Trends'],
        },
        threads: {
            label: 'Threads',
            icon: 'fas fa-at',
            headline: 'Casual thoughts and daily check-ins.',
            description: 'Conversations, reactions, and smaller community moments throughout the week.',
            cta: 'Open Threads',
            tone: '#222222',
            toneGlow: 'rgba(255, 255, 255, 0.18)',
            tags: ['Conversations', 'Daily'],
        },
        telegram: {
            label: 'Telegram',
            icon: 'fab fa-telegram-plane',
            headline: 'Broadcast updates for your inner circle.',
            description: 'Announcements, reminders, and quick-fire alerts for people who want the fastest access.',
            cta: 'Open Telegram',
            tone: '#229ED9',
            toneGlow: 'rgba(34, 158, 217, 0.28)',
            tags: ['Broadcasts', 'Alerts'],
        },
        discord: {
            label: 'Discord',
            icon: 'fab fa-discord',
            headline: 'Community-first chats and member spaces.',
            description: 'Discussion rooms, groups, and interactive conversations built around your brand.',
            cta: 'Open Discord',
            tone: '#5865F2',
            toneGlow: 'rgba(88, 101, 242, 0.28)',
            tags: ['Members', 'Rooms'],
        },
        pinterest: {
            label: 'Pinterest',
            icon: 'fab fa-pinterest-p',
            headline: 'Visual inspiration that is easy to save.',
            description: 'Mood boards, transformations, and branded lifestyle ideas your audience can keep.',
            cta: 'Open Pinterest',
            tone: '#E60023',
            toneGlow: 'rgba(230, 0, 35, 0.26)',
            tags: ['Ideas', 'Moodboards'],
        },
        website: {
            label: 'Website',
            icon: 'fas fa-globe',
            headline: 'Your official digital home base.',
            description: 'Offers, information, bookings, and the complete branded experience in one place.',
            cta: 'Open website',
            tone: 'var(--accent-color)',
            toneGlow: 'var(--accent-glow)',
            tags: ['Offers', 'Booking'],
        },
    };

    const seen = new Set();
    const orderedKeys = [
        ...order.filter((key) => {
            if (!Object.prototype.hasOwnProperty.call(socialData || {}, key) || seen.has(key)) return false;
            seen.add(key);
            return true;
        }),
        ...Object.keys(socialData || {}).filter((key) => {
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }),
    ];

    return orderedKeys.map((key) => {
        const preset = config[key] || {};
        const label = preset.label || titleCase(key);
        const normalizedUrl = normalizeUrl(socialData?.[key]);
        return {
            key,
            label,
            icon: preset.icon || 'fas fa-share-nodes',
            headline: preset.headline || `${label} updates made simple.`,
            description: preset.description || `Open ${label} to explore the latest updates and branded content.`,
            cta: preset.cta || `Open ${label}`,
            tone: preset.tone || 'var(--accent-color)',
            toneGlow: preset.toneGlow || 'var(--accent-glow)',
            tags: Array.isArray(preset.tags) && preset.tags.length ? preset.tags.slice(0, 3) : ['Updates', 'Channel'],
            url: normalizedUrl,
            isActive: Boolean(normalizedUrl),
            displayUrl: formatSocialDisplayUrl(normalizedUrl, label),
        };
    });
}

function formatSocialDisplayUrl(url, label = 'platform') {
    const normalized = normalizeUrl(url);
    if (!normalized) {
        return `Add ${label} URL in data.json`;
    }

    try {
        const parsed = new URL(normalized);
        const host = parsed.hostname.replace(/^www\./i, '');
        const path = parsed.pathname.replace(/\/+$/, '');
        return path && path !== '/' ? `${host}${path}` : host;
    } catch (error) {
        return normalized.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    }
}

function getFallbackOrbitPlatforms() {
    return [
        { icon: 'fab fa-instagram', tone: '#E4405F', toneGlow: 'rgba(228, 64, 95, 0.34)', isActive: false },
        { icon: 'fab fa-facebook-f', tone: '#1877F2', toneGlow: 'rgba(24, 119, 242, 0.32)', isActive: false },
        { icon: 'fab fa-twitter', tone: '#1DA1F2', toneGlow: 'rgba(29, 161, 242, 0.30)', isActive: false },
        { icon: 'fab fa-youtube', tone: '#FF0000', toneGlow: 'rgba(255, 0, 0, 0.28)', isActive: false },
    ];
}

function getOrbitPositions(count) {
    const layouts = {
        1: [{ left: 50, top: 12 }],
        2: [{ left: 18, top: 34 }, { left: 82, top: 66 }],
        3: [{ left: 50, top: 10 }, { left: 19, top: 68 }, { left: 81, top: 68 }],
        4: [{ left: 50, top: 8 }, { left: 12, top: 50 }, { left: 50, top: 92 }, { left: 88, top: 50 }],
        5: [{ left: 50, top: 8 }, { left: 18, top: 26 }, { left: 24, top: 76 }, { left: 76, top: 76 }, { left: 82, top: 26 }],
        6: [{ left: 50, top: 8 }, { left: 18, top: 22 }, { left: 10, top: 60 }, { left: 50, top: 92 }, { left: 90, top: 60 }, { left: 82, top: 22 }],
    };

    if (layouts[count]) return layouts[count];

    const total = Math.max(1, count);
    const radius = 40;

    return Array.from({ length: total }, (_, index) => {
        const angle = ((Math.PI * 2) / total) * index - (Math.PI / 2);
        return {
            left: +(50 + Math.cos(angle) * radius).toFixed(2),
            top: +(50 + Math.sin(angle) * radius).toFixed(2),
        };
    });
}

function renderSocialOrbit(platforms) {
    const orbitContainer = document.getElementById('social-orbit-icons');
    if (!orbitContainer) return;

    const items = (platforms && platforms.length ? platforms.slice(0, 6) : getFallbackOrbitPlatforms());
    const positions = getOrbitPositions(items.length);

    orbitContainer.innerHTML = items.map((platform, index) => {
        const position = positions[index] || { left: 50, top: 50 };

        return `
            <span
                class="social-orbit-icon ${platform.isActive ? '' : 'is-inactive'}"
                style="left: ${position.left}%; top: ${position.top}%; --delay: ${index * 0.35}s; --social-tone: ${platform.tone}; --social-tone-glow: ${platform.toneGlow};"
                aria-hidden="true"
            >
                <i class="${platform.icon}"></i>
            </span>
        `;
    }).join('');
}

function renderFooterSocialLinks(platforms) {
    const container = document.getElementById('footer-social-links');
    if (!container) return;

    const socials = (Array.isArray(platforms) ? platforms : []).filter((platform) => platform.isActive);

    if (!socials.length) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = socials.map((platform) => `
        <a
            class="btn btn-social footer-social-link"
            href="${escapeAttribute(platform.url)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="${escapeAttribute(platform.label)}"
            title="${escapeAttribute(platform.label)}"
        >
            <i class="${platform.icon}"></i>
        </a>
    `).join('');
}

function renderSocialQuickNav(platforms) {
    const container = document.getElementById('social-quick-nav');
    if (!container) return;

    if (!platforms.length) {
        container.innerHTML = '<span class="social-quick-empty">Add social platforms in data.json to enable quick access.</span>';
        return;
    }

    container.innerHTML = platforms.map((platform, index) => `
        <button
            type="button"
            class="social-quick-chip ${index === 0 ? 'is-current' : ''} ${platform.isActive ? '' : 'is-inactive'}"
            data-social-target="${escapeAttribute(platform.key)}"
            aria-pressed="${index === 0 ? 'true' : 'false'}"
            aria-label="${escapeAttribute(platform.isActive ? platform.cta : `${platform.label} not configured yet`)}"
            style="--social-tone: ${platform.tone}; --social-tone-glow: ${platform.toneGlow};"
        >
            <i class="${platform.icon}"></i>
            <span>${escapeHtml(platform.label)}</span>
        </button>
    `).join('');
}

function setFeaturedSocialPlatform(platform) {
    const featuredIcon = document.getElementById('social-featured-icon');
    const featuredLabel = document.getElementById('social-featured-label');
    const featuredHeadline = document.getElementById('social-featured-headline');
    const featuredDescription = document.getElementById('social-featured-description');
    const featuredTags = document.getElementById('social-featured-tags');
    const featuredLink = document.getElementById('social-featured-link');
    const featuredHelper = document.getElementById('social-featured-helper');

    if (featuredIcon) {
        featuredIcon.style.setProperty('--social-tone', platform?.tone || 'var(--accent-color)');
        featuredIcon.style.setProperty('--social-tone-glow', platform?.toneGlow || 'var(--accent-glow)');
        featuredIcon.style.background = platform ? `linear-gradient(135deg, ${platform.tone}, rgba(255, 255, 255, 0.18))` : '';
        featuredIcon.style.boxShadow = platform ? `0 0 26px ${platform.toneGlow}` : '';
        featuredIcon.innerHTML = `<i class="${platform?.icon || 'fas fa-bolt'}"></i>`;
    }

    if (featuredLabel) featuredLabel.textContent = platform?.label || 'Choose a platform';
    if (featuredHeadline) featuredHeadline.textContent = platform?.headline || 'Your social links, easier to explore.';
    if (featuredDescription) featuredDescription.textContent = platform?.description || 'Active channels from your site data appear here automatically for quick access.';

    if (featuredTags) {
        const tags = Array.isArray(platform?.tags) && platform.tags.length ? platform.tags : ['Quick access', 'Live links'];
        featuredTags.innerHTML = tags.slice(0, 3).map((tag) => `
            <span class="social-featured-tag"><i class="fas fa-check-circle"></i>${escapeHtml(tag)}</span>
        `).join('');
    }

    if (featuredHelper) {
        featuredHelper.textContent = platform?.displayUrl || 'Update social URLs in data.json and they appear here automatically.';
    }

    if (featuredLink) {
        if (platform?.isActive) {
            featuredLink.textContent = platform.cta || `Open ${platform.label}`;
            featuredLink.href = platform.url;
            featuredLink.classList.remove('is-disabled');
            featuredLink.removeAttribute('aria-disabled');
            featuredLink.removeAttribute('tabindex');
            featuredLink.setAttribute('target', '_blank');
            featuredLink.setAttribute('rel', 'noopener noreferrer');
        } else {
            featuredLink.textContent = 'Open channel';
            featuredLink.href = '#!';
            featuredLink.classList.add('is-disabled');
            featuredLink.setAttribute('aria-disabled', 'true');
            featuredLink.setAttribute('tabindex', '-1');
            featuredLink.removeAttribute('target');
            featuredLink.removeAttribute('rel');
        }
    }
}

function initSocialShowcaseNavigation(platforms) {
    if (!platforms.length) {
        setFeaturedSocialPlatform(null);
        return;
    }

    const platformMap = new Map(platforms.map((platform) => [platform.key, platform]));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const activatePlatform = (key, options = {}) => {
        const platform = platformMap.get(key) || platforms[0];
        if (!platform) return;

        setFeaturedSocialPlatform(platform);

        document.querySelectorAll('.social-quick-chip').forEach((chip) => {
            const isCurrent = chip.dataset.socialTarget === platform.key;
            chip.classList.toggle('is-current', isCurrent);
            chip.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
        });

        document.querySelectorAll('.social-showcase-card').forEach((card) => {
            const isCurrent = card.dataset.socialKey === platform.key;
            card.classList.toggle('is-current', isCurrent);
        });

        if (options.scrollToCard) {
            const card = document.getElementById(`social-card-${platform.key}`);
            if (card) {
                card.scrollIntoView({
                    behavior: reduceMotion ? 'auto' : 'smooth',
                    block: window.innerWidth < 992 ? 'start' : 'nearest',
                });
            }
        }
    };

    document.querySelectorAll('.social-quick-chip').forEach((chip) => {
        if (chip.dataset.socialBound === 'true') return;
        chip.dataset.socialBound = 'true';

        chip.addEventListener('click', (event) => {
            event.preventDefault();
            activatePlatform(chip.dataset.socialTarget, { scrollToCard: window.innerWidth < 992 });
        });

        chip.addEventListener('focus', () => activatePlatform(chip.dataset.socialTarget));
    });

    document.querySelectorAll('.social-showcase-card').forEach((card) => {
        if (card.dataset.socialBound === 'true') return;
        card.dataset.socialBound = 'true';

        card.addEventListener('mouseenter', () => {
            if (window.innerWidth >= 992) {
                activatePlatform(card.dataset.socialKey);
            }
        });

        card.addEventListener('focus', () => activatePlatform(card.dataset.socialKey));
    });

    activatePlatform((platforms.find((platform) => platform.isActive) || platforms[0]).key);
}

function renderSocialShowcase(data) {
    const theme = data.theme || {};
    const allPlatforms = getSocialPlatforms(data.social || {});
    const activePlatforms = allPlatforms.filter((platform) => platform.isActive);
    const displayPlatforms = allPlatforms;
    const grid = document.getElementById('social-media-grid');

    document.querySelectorAll('[data-social-active-count]').forEach((element) => {
        element.textContent = String(activePlatforms.length);
    });

    const socialBrandWhite = document.getElementById('social-brand-white');
    const socialBrandLight = document.getElementById('social-brand-light');
    const socialBrandAccent = document.getElementById('social-brand-accent');

    if (socialBrandWhite) socialBrandWhite.textContent = theme.brandTextWhite || '';
    if (socialBrandLight) socialBrandLight.textContent = theme.brandTextLight || '';
    if (socialBrandAccent) socialBrandAccent.textContent = theme.brandTextAccent || '';

    renderFooterSocialLinks(allPlatforms);
    renderSocialQuickNav(displayPlatforms);
    renderSocialOrbit(activePlatforms.length ? activePlatforms : displayPlatforms);

    if (!grid) {
        setFeaturedSocialPlatform((activePlatforms.find((platform) => platform.isActive) || displayPlatforms[0] || null));
        initSocialShowcaseNavigation(displayPlatforms);
        return;
    }

    if (!displayPlatforms.length) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="social-empty-state" data-aos="fade-up">
                    Add your social platforms in <strong>data.json</strong> and this section will automatically create premium cards for each link.
                </div>
            </div>
        `;
        setFeaturedSocialPlatform(null);
        return;
    }

    grid.innerHTML = displayPlatforms.map((platform, index) => `
        <div class="col-sm-6 col-xl-6" data-aos="fade-up" data-aos-delay="${Math.min((index + 1) * 80, 320)}">
            <a
                id="social-card-${escapeAttribute(platform.key)}"
                class="social-link-card social-showcase-card social-card--${platform.key} ${platform.isActive ? '' : 'is-disabled'}"
                data-social-key="${escapeAttribute(platform.key)}"
                href="${platform.isActive ? escapeAttribute(platform.url) : '#!'}"
                ${platform.isActive ? 'target="_blank" rel="noopener noreferrer"' : 'tabindex="-1" aria-disabled="true"'}
                style="--social-tone: ${platform.tone}; --social-tone-glow: ${platform.toneGlow};"
                aria-label="${escapeAttribute(platform.isActive ? platform.cta : `${platform.label} not configured yet`)}"
            >
                <span class="social-link-card-glow" aria-hidden="true"></span>

                <div class="social-link-card-head">
                    <div class="social-link-icon">
                        <i class="${platform.icon}"></i>
                    </div>

                    <span class="social-link-status ${platform.isActive ? 'is-live' : 'is-setup'}">
                        <i class="fas ${platform.isActive ? 'fa-circle-check' : 'fa-wrench'}"></i>
                        <span>${platform.isActive ? 'Live' : 'Setup needed'}</span>
                    </span>
                </div>

                <div class="social-link-card-body">
                    <span class="social-link-name">${escapeHtml(platform.label)}</span>
                    <h3>${escapeHtml(platform.headline)}</h3>
                    <p>${escapeHtml(platform.description)}</p>
                </div>

                <div class="social-link-tags">
                    ${(platform.tags || []).slice(0, 3).map((tag) => `<span class="social-link-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>

                <div class="social-link-card-footer">
                    <span class="social-link-url">${escapeHtml(platform.displayUrl)}</span>
                    <span class="social-link-button">
                        ${escapeHtml(platform.isActive ? platform.cta : 'Add URL in data.json')}
                        <i class="fas ${platform.isActive ? 'fa-arrow-right' : 'fa-gear'}"></i>
                    </span>
                </div>
            </a>
        </div>
    `).join('');

    setFeaturedSocialPlatform((activePlatforms.find((platform) => platform.isActive) || displayPlatforms[0] || null));
    initSocialShowcaseNavigation(displayPlatforms);
}

function extractOfferBadgeText(offers = {}) {
    const combinedDiscount = [offers.discount, offers.discountAccent]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

    const combinedTitle = [offers.title, offers.titleAccent, offers.titleSuffix]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

    const candidates = [combinedDiscount, offers.badgeText, combinedTitle, 'Live'];
    const badgeText = candidates.find((item) => String(item || '').trim());

    return String(badgeText || 'Live').replace(/\s+/g, ' ').trim().slice(0, 18);
}

function setOfferNavigationState(offers = {}) {
    const navOfferLink = document.getElementById('nav-offers-link');
    const navOfferBadge = document.getElementById('nav-offer-badge');

    if (!navOfferLink) return;

    const badgeText = extractOfferBadgeText(offers);
    if (navOfferBadge) {
        navOfferBadge.textContent = badgeText;
    }

    const longLabel = [offers.badgeText, offers.title, offers.titleAccent, offers.titleSuffix]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

    const offerDescription = String(offers.description || '').replace(/\s+/g, ' ').trim();
    const accessibleLabelParts = ['View current offers'];

    if (longLabel) {
        accessibleLabelParts.push(`Current offer: ${longLabel}`);
    } else if (badgeText) {
        accessibleLabelParts.push(`Current offer: ${badgeText}`);
    }

    if (offerDescription) {
        accessibleLabelParts.push(offerDescription);
    }

    navOfferLink.classList.toggle('is-live', Boolean(longLabel || badgeText || offerDescription));
    navOfferLink.setAttribute('title', [longLabel || badgeText, offerDescription].filter(Boolean).join(' • '));
    navOfferLink.setAttribute('aria-label', accessibleLabelParts.join('. '));
}

function animateCountValue(element) {
    if (!element || element.dataset.countAnimated === 'true') return;

    const originalText = String(element.textContent || '').trim();
    const match = originalText.match(/\d+/);

    if (!match) return;

    const numericValue = parseInt(match[0], 10);
    if (!Number.isFinite(numericValue)) return;

    const digits = match[0].length;
    const startIndex = match.index || 0;
    const endIndex = startIndex + match[0].length;
    const duration = 1200;
    const startTime = performance.now();

    const renderValue = (value) => {
        const output = String(value).padStart(digits, '0');
        element.textContent = `${originalText.slice(0, startIndex)}${output}${originalText.slice(endIndex)}`;
    };

    const step = (timestamp) => {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        renderValue(Math.round(numericValue * eased));

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.dataset.countAnimated = 'true';
        }
    };

    renderValue(0);
    window.requestAnimationFrame(step);
}

function initHeroCounters() {
    const counters = Array.from(document.querySelectorAll('.premium-home .hero-stat-card strong'));
    if (!counters.length) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        counters.forEach((counter) => animateCountValue(counter));
        return;
    }

    const statsGrid = document.querySelector('.premium-home .hero-stats-grid');
    if (!statsGrid) {
        counters.forEach((counter) => animateCountValue(counter));
        return;
    }

    const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                counters.forEach((counter) => animateCountValue(counter));
                instance.disconnect();
            }
        });
    }, {
        threshold: 0.35
    });

    observer.observe(statsGrid);
}

function initPremiumReveal() {
    const revealSelector = [
        '.premium-home .offer-panel',
        '.premium-home .premium-card',
        '.premium-home .trainer-card',
        '.premium-home .social-link-card',
        '.premium-home .social-featured-panel',
        '.premium-home .social-grid-shell',
        '.premium-home .video-swiper-shell',
        '.premium-home .testimonial-swiper-shell',
        '.premium-home .contact-card',
        '.premium-home .footer-shell',
        '.premium-home .gallery-item',
        '.premium-home .about-visual-main',
        '.premium-home .about-visual-card',
        '.premium-home .hero-stat-card',
        '.premium-home .hero-visual-main',
        '.premium-home .hero-visual-card',
        '.premium-home .offer-visual-main',
        '.premium-home .offer-visual-accent',
        '.premium-home .about-feature-list li'
    ].join(', ');

    const revealElements = Array.from(document.querySelectorAll(revealSelector));
    if (!revealElements.length) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach((element) => element.classList.add('in-view'));
        return;
    }

    const visibleThreshold = window.innerHeight * 0.94;
    const pendingElements = [];

    revealElements.forEach((element, index) => {
        element.style.setProperty('--motion-delay', `${(index % 4) * 70}ms`);

        const rect = element.getBoundingClientRect();
        if (rect.top <= visibleThreshold) {
            element.classList.add('in-view');
        } else {
            element.classList.add('reveal-surface');
            pendingElements.push(element);
        }
    });

    if (!pendingElements.length) return;

    const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                instance.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px'
    });

    pendingElements.forEach((element) => observer.observe(element));
}

function initPremiumTilt() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (prefersReducedMotion || !canHover) return;

    const tiltTargets = document.querySelectorAll([
        '.premium-home .hero-stat-card',
        '.premium-home .premium-card',
        '.premium-home .trainer-card',
        '.premium-home .social-link-card',
        '.premium-home .offer-panel',
        '.premium-home .contact-card',
        '.premium-home .social-featured-panel',
        '.premium-home .social-grid-shell'
    ].join(', '));

    tiltTargets.forEach((element) => {
        if (element.dataset.tiltBound === 'true') return;

        element.dataset.tiltBound = 'true';
        element.classList.add('motion-tilt');

        const resetTilt = () => {
            element.classList.remove('is-tilting');
            element.style.setProperty('--tilt-rotate-x', '0deg');
            element.style.setProperty('--tilt-rotate-y', '0deg');
        };

        element.addEventListener('pointermove', (event) => {
            const rect = element.getBoundingClientRect();
            const horizontal = ((event.clientX - rect.left) / rect.width) - 0.5;
            const vertical = ((event.clientY - rect.top) / rect.height) - 0.5;

            element.classList.add('is-tilting');
            element.style.setProperty('--tilt-rotate-x', `${(vertical * -7).toFixed(2)}deg`);
            element.style.setProperty('--tilt-rotate-y', `${(horizontal * 8).toFixed(2)}deg`);
        });

        element.addEventListener('pointerleave', resetTilt);
        element.addEventListener('pointercancel', resetTilt);
    });
}

function initPremiumExperience() {
    if (!document.body.classList.contains('premium-home')) return;

    initPremiumReveal();
    initPremiumTilt();
    initHeroCounters();
}

function renderData(data) {
    const theme = data.theme || {};
    applyThemePreset(theme);
    const hero = data.hero || {};
    const offers = data.offers || {};
    const about = data.about || {};
    const contact = data.contact || {};
    const footer = data.footer || {};

    const setText = (id, text) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text == null ? '' : text;
    };

    const setHtml = (id, html) => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = html == null ? '' : html;
    };

    const setSrc = (id, src) => {
        const element = document.getElementById(id);
        if (element) element.src = src || '';
    };

    // Navbar
    setText('nav-brand-white', theme.brandTextWhite);
    setText('nav-brand-light', theme.brandTextLight);
    setText('nav-brand-accent', theme.brandTextAccent);
    setOfferNavigationState(offers);

    // Hero
    setText('hero-title-prefix', hero.titlePrefix);
    setText('hero-title-accent', hero.titleAccent);
    setText('hero-subtitle', hero.subtitle);

    const activeSocialCount = getSocialPlatforms(data.social || {}).filter((platform) => platform.isActive).length;
    setText('hero-program-count', Array.isArray(data.programs) ? String(data.programs.length).padStart(2, '0') : '00');
    setText('hero-trainer-count', Array.isArray(data.trainers) ? String(data.trainers.length).padStart(2, '0') : '00');
    setText('hero-social-count', String(activeSocialCount).padStart(2, '0'));

    // Offers
    setText('offers-badge', offers.badgeText);
    setText('offers-title', offers.title);
    setText('offers-title-accent', offers.titleAccent);
    setText('offers-title-suffix', offers.titleSuffix);
    setText('offers-discount', offers.discount);
    setText('offers-discount-accent', offers.discountAccent);
    setText('offers-description', offers.description);

    setDynamicLink(
        document.getElementById('offers-whatsapp-btn'),
        contact.whatsappNumber ? `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(offers.whatsappMessage || '')}` : '',
        'Offers WhatsApp chat'
    );

    // About
    setSrc('about-image', about.image);
    setText('about-title-prefix', about.titlePrefix);
    setText('about-title-accent', about.titleAccent);
    setText('about-description', about.description);

    if (Array.isArray(about.features)) {
        setHtml(
            'about-features',
            about.features.map((feature) => `<li class="mb-3"><i class="fas fa-check-circle text-accent me-3"></i> ${escapeHtml(feature)}</li>`).join('')
        );
    }

    // Programs
    if (Array.isArray(data.programs)) {
        setHtml(
            'programs-container',
            data.programs.map((program, index) => `
                <div class="col-md-4 col-sm-6" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
                    <div class="premium-card text-center">
                        <div class="icon-wrapper mb-4">
                            <i class="${escapeAttribute(program.icon || 'fas fa-dumbbell')} fa-3x text-accent"></i>
                        </div>
                        <h4>${escapeHtml(program.title || '')}</h4>
                        <p class="text-secondary">${escapeHtml(program.description || '')}</p>
                    </div>
                </div>
            `).join('')
        );
    }

    // Trainers
    if (Array.isArray(data.trainers)) {
        setHtml(
            'trainers-container',
            data.trainers.map((trainer, index) => `
                <div class="col-md-4" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
                    <div class="trainer-card text-center h-100">
                        <div class="trainer-img-wrapper hover-shine">
                            <img src="${escapeAttribute(trainer.image || '')}" alt="${escapeAttribute(trainer.name || 'Trainer')}" class="trainer-img">
                            <div class="trainer-social">
                                <a href="${escapeAttribute(normalizeUrl(trainer.social?.instagram) || '#!')}" ${normalizeUrl(trainer.social?.instagram) ? 'target="_blank" rel="noopener noreferrer"' : 'tabindex="-1" aria-disabled="true" class="is-disabled"'}><i class="fab fa-instagram"></i></a>
                                <a href="${escapeAttribute(normalizeUrl(trainer.social?.twitter) || '#!')}" ${normalizeUrl(trainer.social?.twitter) ? 'target="_blank" rel="noopener noreferrer"' : 'tabindex="-1" aria-disabled="true" class="is-disabled"'}><i class="fab fa-twitter"></i></a>
                                <a href="${escapeAttribute(normalizeUrl(trainer.social?.linkedin) || '#!')}" ${normalizeUrl(trainer.social?.linkedin) ? 'target="_blank" rel="noopener noreferrer"' : 'tabindex="-1" aria-disabled="true" class="is-disabled"'}><i class="fab fa-linkedin"></i></a>
                            </div>
                        </div>
                        <div class="p-4">
                            <h4 class="mb-1">${escapeHtml(trainer.name || '')}</h4>
                            <p class="text-accent mb-0">${escapeHtml(trainer.role || '')}</p>
                        </div>
                    </div>
                </div>
            `).join('')
        );
    }

    // Pricing
    if (Array.isArray(data.pricing)) {
        setHtml(
            'pricing-container',
            data.pricing.map((plan, index) => `
                <div class="col-lg-4" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
                    <div class="premium-card pricing-card text-center ${plan.isPopular ? 'popular position-relative' : ''}">
                        ${plan.isPopular ? '<div class="position-absolute top-0 end-0 bg-accent text-dark px-3 py-1 fw-bold rounded-start mt-3" style="background-color: var(--accent-color);">POPULAR</div>' : ''}
                        <h4 class="text-uppercase mb-4 ${plan.isPopular ? 'mt-3' : ''}">${escapeHtml(plan.title || '')}</h4>
                        <div class="mb-4">
                            <span class="price-tag">${escapeHtml(plan.price || '')}</span><span class="price-period">${escapeHtml(plan.period || '')}</span>
                        </div>
                        <ul class="list-unstyled feature-list text-start mb-5">
                            ${(Array.isArray(plan.features) ? plan.features : []).map((feature) => `<li><i class="fas ${feature.included ? 'fa-check text-accent' : 'fa-times text-secondary'} me-2"></i> ${escapeHtml(feature.name || '')}</li>`).join('')}
                        </ul>
                        <a href="#" class="btn ${plan.isPopular ? 'btn-accent' : 'btn-outline-accent'} w-100">Select Plan</a>
                    </div>
                </div>
            `).join('')
        );
    }

    // Gallery
    if (Array.isArray(data.gallery)) {
        setHtml(
            'gallery-container',
            data.gallery.map((item, index) => `
                <div class="col-lg-4 col-sm-6" data-aos="fade-in" data-aos-delay="${item.delay || ((index + 1) * 100)}">
                    <a href="${escapeAttribute(item.imageLarge || '')}" data-lightbox="gym-gallery" data-title="${escapeAttribute(item.title || '')}" class="gallery-item hover-shine">
                        <img src="${escapeAttribute(item.imageThumb || '')}" alt="${escapeAttribute(item.title || 'Gallery image')}">
                        <div class="gallery-overlay">
                            <i class="fas fa-search-plus"></i>
                        </div>
                    </a>
                </div>
            `).join('')
        );
    }

    // Video Gallery
    if (Array.isArray(data.videoGallery)) {
        setHtml(
            'video-gallery-container',
            data.videoGallery.map((video) => `
                <div class="swiper-slide">
                    <div class="premium-card p-0 overflow-hidden d-flex flex-column h-100" style="border-radius: 12px;">
                        <div class="ratio ratio-16x9">
                            <iframe src="${escapeAttribute(video.videoSrc || '')}" title="${escapeAttribute(video.title || 'Video')}" allowfullscreen style="border: 0;"></iframe>
                        </div>
                        <div class="p-4 bg-surface flex-grow-1">
                            <h4 class="text-white mb-2">${escapeHtml(video.title || '')}</h4>
                            <p class="text-secondary mb-0">${escapeHtml(video.description || '')}</p>
                        </div>
                    </div>
                </div>
            `).join('')
        );
    }

    // Testimonials
    if (Array.isArray(data.testimonials)) {
        setHtml(
            'testimonials-container',
            data.testimonials.map((testimonial) => {
                const fullStars = Math.floor(testimonial.stars || 0);
                const halfStar = (testimonial.stars || 0) % 1 !== 0;
                let starsHtml = '';

                for (let index = 0; index < fullStars; index += 1) {
                    starsHtml += '<li class="list-inline-item m-0"><i class="fas fa-star"></i></li>';
                }

                if (halfStar) {
                    starsHtml += '<li class="list-inline-item m-0"><i class="fas fa-star-half-alt"></i></li>';
                }

                return `
                    <div class="swiper-slide">
                        <div class="testimonial-card premium-card d-flex flex-column h-100">
                            <ul class="list-inline text-warning mb-3">${starsHtml}</ul>
                            <p class="fs-5 fst-italic mb-4 flex-grow-1">${escapeHtml(testimonial.text || '')}</p>
                            <div class="d-flex align-items-center mt-auto">
                                <img src="${escapeAttribute(testimonial.image || '')}" alt="${escapeAttribute(testimonial.name || 'Member')}" class="rounded-circle me-3" style="width: 60px; height: 60px; object-fit: cover; border: 2px solid var(--accent-color);">
                                <div>
                                    <h5 class="mb-0">${escapeHtml(testimonial.name || '')}</h5>
                                    <span class="text-secondary small">${escapeHtml(testimonial.subtitle || '')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')
        );
    }

    // Contact
    setText('contact-address', contact.address);
    setText('contact-phone', contact.phone);
    setDynamicLink(document.getElementById('contact-map-link'), contact.mapLink, 'Get directions');
    setDynamicLink(
        document.getElementById('contact-whatsapp-btn'),
        contact.whatsappNumber ? `https://wa.me/${contact.whatsappNumber}` : '',
        'Open WhatsApp chat'
    );

    // Social Showcase + Footer
    renderSocialShowcase(data);

    setText('footer-brand-white', theme.brandTextWhite);
    setText('footer-brand-light', theme.brandTextLight);
    setText('footer-brand-accent', theme.brandTextAccent);
    setText('footer-description', footer.description);

    if (Array.isArray(footer.links)) {
        setHtml(
            'footer-links',
            footer.links.map((link) => `<a class="link-secondary text-decoration-none me-3" href="${escapeAttribute(normalizeUrl(link.url) || link.url || '#!')}">${escapeHtml(link.text || '')}</a>`).join('')
        );
    }

    setText('footer-copyright', footer.copyright);
}


function initScrollAnimations() {
    const animatedElements = Array.from(document.querySelectorAll('[data-aos]'));
    if (!animatedElements.length) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    animatedElements.forEach((element) => {
        const delay = parseInt(element.getAttribute('data-aos-delay') || '0', 10);
        if (Number.isFinite(delay) && delay > 0) {
            element.style.setProperty('--aos-delay', `${delay}ms`);
        }
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        animatedElements.forEach((element) => element.classList.add('aos-animate'));
        return;
    }

    const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                instance.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px'
    });

    animatedElements.forEach((element) => observer.observe(element));
}

function createLocalLightbox() {
    const existing = document.getElementById('localLightbox');
    if (existing) return existing;

    const overlay = document.createElement('div');
    overlay.className = 'local-lightbox';
    overlay.id = 'localLightbox';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
        <button type="button" class="local-lightbox-control local-lightbox-close" aria-label="Close image viewer">×</button>
        <button type="button" class="local-lightbox-control local-lightbox-prev" aria-label="Previous image">‹</button>
        <div class="local-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Image viewer">
            <img class="local-lightbox-image" alt="">
            <p class="local-lightbox-caption"></p>
        </div>
        <button type="button" class="local-lightbox-control local-lightbox-next" aria-label="Next image">›</button>
    `;

    document.body.appendChild(overlay);
    return overlay;
}

function initLocalLightbox() {
    const lightboxItems = Array.from(document.querySelectorAll('[data-lightbox]'));
    if (!lightboxItems.length) return;

    const overlay = createLocalLightbox();
    const imageElement = overlay.querySelector('.local-lightbox-image');
    const captionElement = overlay.querySelector('.local-lightbox-caption');
    const closeButton = overlay.querySelector('.local-lightbox-close');
    const prevButton = overlay.querySelector('.local-lightbox-prev');
    const nextButton = overlay.querySelector('.local-lightbox-next');

    let activeGroup = [];
    let activeIndex = 0;

    const renderImage = () => {
        const currentItem = activeGroup[activeIndex];
        if (!currentItem) return;

        const href = currentItem.getAttribute('href') || '';
        const title = currentItem.getAttribute('data-title') || currentItem.getAttribute('aria-label') || '';

        imageElement.src = href;
        imageElement.alt = title || 'Gallery image';
        captionElement.textContent = title;
        prevButton.disabled = activeGroup.length < 2;
        nextButton.disabled = activeGroup.length < 2;
    };

    const openLightbox = (group, index) => {
        activeGroup = group;
        activeIndex = index;
        renderImage();

        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('local-lightbox-open');
    };

    const closeLightbox = () => {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('local-lightbox-open');
        imageElement.removeAttribute('src');
    };

    const moveLightbox = (direction) => {
        if (activeGroup.length < 2) return;
        activeIndex = (activeIndex + direction + activeGroup.length) % activeGroup.length;
        renderImage();
    };

    if (!overlay.dataset.bound) {
        overlay.dataset.bound = 'true';

        closeButton.addEventListener('click', closeLightbox);
        prevButton.addEventListener('click', () => moveLightbox(-1));
        nextButton.addEventListener('click', () => moveLightbox(1));

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (!overlay.classList.contains('is-open')) return;

            if (event.key === 'Escape') {
                closeLightbox();
            } else if (event.key === 'ArrowLeft') {
                moveLightbox(-1);
            } else if (event.key === 'ArrowRight') {
                moveLightbox(1);
            }
        });
    }

    lightboxItems.forEach((item) => {
        if (item.dataset.localLightboxBound === 'true') return;

        item.dataset.localLightboxBound = 'true';
        item.addEventListener('click', (event) => {
            event.preventDefault();

            const groupName = item.getAttribute('data-lightbox') || 'default';
            const groupItems = lightboxItems.filter((element) => (element.getAttribute('data-lightbox') || 'default') === groupName);
            const index = Math.max(groupItems.indexOf(item), 0);

            openLightbox(groupItems, index);
        });
    });
}

function resolveSliderConfig(breakpoints) {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const normalized = Object.keys(breakpoints || {})
        .map((key) => Number(key))
        .filter((value) => Number.isFinite(value))
        .sort((left, right) => left - right);

    let config = { slidesPerView: 1, spaceBetween: 20 };

    normalized.forEach((point) => {
        if (viewportWidth >= point) {
            config = { ...config, ...breakpoints[point] };
        }
    });

    return config;
}

function initSimpleSlider(selector, options = {}) {
    const slider = document.querySelector(selector);
    if (!slider) return;

    const wrapper = slider.querySelector('.swiper-wrapper');
    const slides = wrapper ? Array.from(wrapper.children) : [];

    if (!wrapper || !slides.length) return;

    const shell = slider.closest('.position-relative') || slider.parentElement;
    const nextButton = shell ? shell.querySelector(options.nextSelector || '.swiper-button-next') : null;
    const prevButton = shell ? shell.querySelector(options.prevSelector || '.swiper-button-prev') : null;
    const pagination = slider.querySelector(options.paginationSelector || '.swiper-pagination');

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activePage = 0;
    let pageCount = 1;
    let autoplayTimer = null;

    const stopAutoplay = () => {
        if (autoplayTimer) {
            window.clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    };

    const updateControls = () => {
        const isActive = pageCount > 1;

        if (pagination) {
            pagination.style.display = isActive ? '' : 'none';
            Array.from(pagination.children).forEach((bullet, index) => {
                bullet.classList.toggle('swiper-pagination-bullet-active', index === activePage);
                bullet.setAttribute('aria-current', index === activePage ? 'true' : 'false');
            });
        }

        [nextButton, prevButton].forEach((button) => {
            if (!button) return;
            button.style.display = isActive ? '' : 'none';
            button.classList.toggle('is-disabled', !isActive);
            button.disabled = !isActive;
            button.setAttribute('aria-disabled', !isActive ? 'true' : 'false');
        });
    };

    const goToPage = (index) => {
        if (!slides.length) return;

        const config = resolveSliderConfig(options.breakpoints || { 0: { slidesPerView: 1, spaceBetween: 20 } });
        const perView = Math.max(1, Math.round(config.slidesPerView || 1));
        const gap = Number(config.spaceBetween || 0);

        slider.style.setProperty('--slides-per-view', String(perView));
        slider.style.setProperty('--slide-gap', `${gap}px`);

        const maxStartIndex = Math.max(slides.length - perView, 0);
        pageCount = Math.max(Math.ceil(slides.length / perView), 1);
        activePage = ((index % pageCount) + pageCount) % pageCount;

        const startIndex = Math.min(activePage * perView, maxStartIndex);
        const slideWidth = slides[0].getBoundingClientRect().width;
        const shift = startIndex * (slideWidth + gap);

        wrapper.style.transform = `translate3d(${-shift}px, 0, 0)`;

        slides.forEach((slide, slideIndex) => {
            const isVisible = slideIndex >= startIndex && slideIndex < startIndex + perView;
            slide.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
        });

        updateControls();
    };

    const buildPagination = () => {
        if (!pagination) return;

        const config = resolveSliderConfig(options.breakpoints || { 0: { slidesPerView: 1, spaceBetween: 20 } });
        const perView = Math.max(1, Math.round(config.slidesPerView || 1));
        pageCount = Math.max(Math.ceil(slides.length / perView), 1);

        pagination.innerHTML = '';

        for (let index = 0; index < pageCount; index += 1) {
            const bullet = document.createElement('button');
            bullet.type = 'button';
            bullet.className = 'swiper-pagination-bullet';
            bullet.setAttribute('aria-label', `Go to slide group ${index + 1}`);
            bullet.addEventListener('click', () => {
                stopAutoplay();
                goToPage(index);
            });
            pagination.appendChild(bullet);
        }
    };

    const refresh = () => {
        buildPagination();
        goToPage(activePage);
    };

    const startAutoplay = () => {
        stopAutoplay();

        if (!options.autoplayDelay || prefersReducedMotion || pageCount <= 1) return;

        autoplayTimer = window.setInterval(() => {
            goToPage(activePage + 1);
        }, options.autoplayDelay);
    };

    if (nextButton && !nextButton.dataset.localSliderBound) {
        nextButton.dataset.localSliderBound = 'true';
        nextButton.addEventListener('click', () => {
            stopAutoplay();
            goToPage(activePage + 1);
        });
    }

    if (prevButton && !prevButton.dataset.localSliderBound) {
        prevButton.dataset.localSliderBound = 'true';
        prevButton.addEventListener('click', () => {
            stopAutoplay();
            goToPage(activePage - 1);
        });
    }

    if (shell && !shell.dataset.localSliderHoverBound) {
        shell.dataset.localSliderHoverBound = 'true';
        shell.addEventListener('mouseenter', stopAutoplay);
        shell.addEventListener('mouseleave', startAutoplay);
    }

    let resizeFrame = null;
    window.addEventListener('resize', () => {
        if (resizeFrame) {
            window.cancelAnimationFrame(resizeFrame);
        }

        resizeFrame = window.requestAnimationFrame(() => {
            refresh();
            startAutoplay();
        });
    });

    refresh();
    startAutoplay();
}

function initPlugins() {
    initScrollAnimations();
    initLocalLightbox();

    initSimpleSlider('.testimonialSwiper', {
        paginationSelector: '.swiper-pagination',
        nextSelector: '.swiper-button-next',
        prevSelector: '.swiper-button-prev',
        autoplayDelay: 4000,
        breakpoints: {
            0: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 30 }
        }
    });

    initSimpleSlider('.videoSwiper', {
        paginationSelector: '.video-pagination',
        nextSelector: '.video-next',
        prevSelector: '.video-prev',
        breakpoints: {
            0: { slidesPerView: 1, spaceBetween: 15 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 2, spaceBetween: 30 }
        }
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    // Navbar shrink function
    const navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) return;

        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-scrolled');
        } else {
            navbarCollapsible.classList.add('navbar-scrolled');
        }
    };

    navbarShrink();
    document.addEventListener('scroll', navbarShrink);

    // ScrollSpy
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav && typeof bootstrap !== 'undefined' && bootstrap.ScrollSpy) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    }

    // Collapse responsive navbar
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));

    responsiveNavItems.forEach((responsiveNavItem) => {
        responsiveNavItem.addEventListener('click', () => {
            if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Load Data
    try {
        let data = null;

        if (window.GYMMVPSiteConfig && typeof window.GYMMVPSiteConfig.loadSiteData === 'function') {
            data = await window.GYMMVPSiteConfig.loadSiteData();
        }

        if (!data || !Object.keys(data).length) {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Failed to fetch data');

            data = await response.json();

            try {
                const offerResponse = await fetch('offer.json');
                if (offerResponse.ok) {
                    const offerData = await offerResponse.json();
                    data.offers = offerData;
                    console.log('Using custom offer from offer.json');
                }
            } catch (offerError) {
                console.warn('No external offer.json found or failed to load:', offerError);
            }
        }

        window.GYMMVP_SITE_DATA = data || {};
        applyThemePreset((data && data.theme) || {});
        renderData(data || {});
    } catch (error) {
        console.error('Error loading data.json:', error);
        document.documentElement.classList.add('gymmvp-data-unavailable');
    } finally {
        initPlugins();
        initPremiumExperience();
    }
});
