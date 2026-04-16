# CDN / External Asset Notes

## Localized in this build
- Bootstrap CSS and JS -> `vendor/bootstrap/`
- Font Awesome CSS and webfonts -> `vendor/fontawesome/`
- Google Fonts removed -> replaced with local system font stacks
- Swiper removed -> replaced with lightweight local slider logic in `js/scripts.js`
- AOS removed -> replaced with local scroll animation logic in `js/scripts.js`
- Lightbox removed -> replaced with local gallery overlay logic in `js/scripts.js`
- jQuery removed
- JSONEditor CDN removed -> replaced with a plain textarea JSON editor in `editor.html` + `js/editor.js`

## Still external by design
- YouTube videos in `data.json`
- Google Maps link in `data.json`
- WhatsApp link in `data.json` / widget
- Social profile links in `data.json`

These are not CDN dependencies. They are feature integrations or outgoing links.

## Recommendation
Keep Maps / WhatsApp / social links. They do not slow the initial page much unless clicked.
If you want zero third-party requests, replace YouTube embeds with local video files or preview thumbnails that open YouTube only on click.
