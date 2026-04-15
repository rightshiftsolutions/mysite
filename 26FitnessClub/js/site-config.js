(function () {
    const STORAGE_KEY = 'gymmvp-site-data-cache-v1';
    const PRESET_KEY = 'gymmvp-theme-preset-cache-v1';

    const THEME_PRESETS = {
        'obsidian-gold': { themeColor: '#050608' },
        'arctic-silver': { themeColor: '#060a12' },
        'emerald-elite': { themeColor: '#06100c' },
        'electric-cyan': { themeColor: '#040c10' },
        'crimson-luxe': { themeColor: '#12070a' },
        'royal-amethyst': { themeColor: '#090712' },
        'sunset-ember': { themeColor: '#130907' }
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
        orange: 'sunset-ember'
    };

    function normalizeThemePreset(value) {
        const raw = String(value || '').trim().toLowerCase().replace(/[_\s]+/g, '-');
        if (THEME_PRESETS[raw]) {
            return raw;
        }
        return THEME_PRESET_ALIASES[raw] || 'obsidian-gold';
    }

    function savePreset(preset) {
        try {
            localStorage.setItem(PRESET_KEY, preset);
        } catch (error) {
            // Ignore storage errors.
        }
    }

    function readPreset() {
        try {
            const preset = localStorage.getItem(PRESET_KEY);
            return normalizeThemePreset(preset || '');
        } catch (error) {
            return 'obsidian-gold';
        }
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
        } catch (error) {
            // Ignore storage errors.
        }
    }

    function readCachedData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    function applyThemePreset(theme) {
        const preset = normalizeThemePreset(theme && (theme.preset || theme.themePreset || theme.name) || '');
        const meta = THEME_PRESETS[preset] || THEME_PRESETS['obsidian-gold'];

        document.documentElement.setAttribute('data-site-preset', preset);
        document.documentElement.setAttribute('data-premium-theme', preset);

        const applyToBody = function () {
            if (document.body) {
                document.body.dataset.theme = preset;
            }
        };

        if (document.body) {
            applyToBody();
        } else {
            document.addEventListener('DOMContentLoaded', applyToBody, { once: true });
        }

        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta && meta && meta.themeColor) {
            themeColorMeta.setAttribute('content', meta.themeColor);
        }

        savePreset(preset);
        return preset;
    }

    async function fetchJson(url) {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Failed to load ' + url);
        }
        return response.json();
    }

    async function loadSiteData() {
        if (window.GYMMVP_SITE_DATA_PROMISE) {
            return window.GYMMVP_SITE_DATA_PROMISE;
        }

        window.GYMMVP_SITE_DATA_PROMISE = (async function () {
            const cachedData = readCachedData();
            const cachedTheme = cachedData && cachedData.theme ? cachedData.theme : { preset: readPreset() };

            if (Object.keys(cachedTheme || {}).length) {
                applyThemePreset(cachedTheme);
            }

            try {
                const data = await fetchJson('data.json');

                try {
                    const offerData = await fetchJson('offer.json');
                    if (offerData && typeof offerData === 'object') {
                        data.offers = offerData;
                    }
                } catch (offerError) {
                    // offer.json is optional.
                }

                window.GYMMVP_SITE_DATA = data;
                applyThemePreset(data.theme || cachedTheme || {});
                saveData(data);

                document.dispatchEvent(new CustomEvent('gymmvp:site-data', {
                    detail: { data: data }
                }));

                return data;
            } catch (error) {
                const fallbackData = Object.keys(cachedData).length ? cachedData : {};
                window.GYMMVP_SITE_DATA = fallbackData;
                applyThemePreset((fallbackData && fallbackData.theme) || cachedTheme || { preset: 'obsidian-gold' });

                document.dispatchEvent(new CustomEvent('gymmvp:site-data-error', {
                    detail: { error: error, data: fallbackData }
                }));

                return fallbackData;
            }
        })();

        return window.GYMMVP_SITE_DATA_PROMISE;
    }

    window.GYMMVPSiteConfig = {
        loadSiteData: loadSiteData,
        applyThemePreset: applyThemePreset,
        normalizeThemePreset: normalizeThemePreset
    };

    const initialPreset = readPreset();
    if (initialPreset) {
        applyThemePreset({ preset: initialPreset });
    }

    loadSiteData().catch(function () {
        // Theme fallback is already applied above.
    });
})();
