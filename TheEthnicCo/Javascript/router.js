// Router for SPA navigation
const Router = {
    routes: {
        'home': 'home.html',
        'categories': 'Categories.html',
        'sherwani': 'sherwani.html',
        'kurta': 'kurta.html',
        'indo-western': 'indo-western.html',
        'jodhpuri': 'jodhpuri.html',
        'kurta-jacket': 'kurta-jacket.html',
        'new-arrivals': 'New_Arrival.html',
        'occasions': 'Occasion.html',
        'sale': 'Sale.html',
        'accessories': 'Accessories.html'
    },

    navigate(page) {
        const route = this.routes[page.toLowerCase().replace(/\s+/g, '-')];
        if (route) {
            window.location.href = route;
        }
    },

    getCurrentPage() {
        const path = window.location.pathname;
        const fileName = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
        return fileName || 'home';
    },

    highlightActiveNav() {
        const currentPage = this.getCurrentPage();
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const linkPage = link.getAttribute('data-page');
            if (linkPage && linkPage.toLowerCase().replace(/\s+/g, '-') === currentPage) {
                link.classList.add('active');
            }
        });
    }
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    Router.highlightActiveNav();
});

        document.addEventListener('mouseleave', () => {
            dot.style.opacity = '0';
            outline.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            dot.style.opacity = '1';
            outline.style.opacity = '1';
        });

        // Handle click effect
        window.addEventListener('mousedown', () => {
            outline.style.transform = 'scale(0.8)';
        });
        window.addEventListener('mouseup', () => {
            outline.style.transform = 'scale(1)';
        });

        // header animation scroll start
window.addEventListener("scroll", function () {
    const header = document.querySelector("header");

    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});
   