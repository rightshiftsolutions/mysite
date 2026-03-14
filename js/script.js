document.addEventListener("DOMContentLoaded", function () {

    fetch("data/26fitness.json")
        .then(response => response.json())
        .then(data => {

            // brand name 
            const brand = document.querySelector('[data-bind="brand.text"]');
            if (brand) {
                brand.textContent = data.brand.text;
            }

            // hero video 
            const videoSource = document.querySelector('[data-bind="banner.VideoSrc"]');
            if (videoSource) {
                videoSource.src = data.banner.VideoSrc;

                // reload video so browser updates source
                videoSource.parentElement.load();
            }

            // About Us left image
            const aboutImage = document.querySelector('[data-bind="aboutUs.Imagesrc"]');
            if (aboutImage) {
                aboutImage.src = data.aboutUs.Imagesrc;
            }

            // About Us text fields (excluding "Your Fitness, Our Passion")
            const aboutFields = [
                "TitleLeft",
                "ParaLeft",
                "ExpNum",
                "YearExperience",
                "ActiveMemberCount",
                "ActiveMemberText",
                "ExpertTrainerCount",
                "ExpertTrainerText",
                "ClassesCount",
                "ClassText"
            ];

            aboutFields.forEach(field => {
                const el = document.querySelector(`[data-bind="aboutUs.${field}"]`);
                if (el) el.textContent = data.aboutUs[field];
            });

            // Clasees images and the head and desc section 
            const classItems = document.querySelectorAll('[data-collection="Classes"] [data-item]');
            if (classItems.length && data.classes) {
                classItems.forEach((item, index) => {
                    const classData = data.classes[index];
                    if (!classData) return;

                    // Image
                    const imgEl = item.querySelector('[data-bind="Imagesrc"]');
                    if (imgEl) imgEl.src = classData.Imagesrc;

                    // Title (h5)
                    const titleEl = item.querySelector('[data-bind="Title"]');
                    if (titleEl) titleEl.textContent = classData.Title;

                    // Description (p after h5)
                    const descEl = item.querySelector('[data-bind="Description"]');
                    if (descEl) descEl.textContent = classData.Description;
                });
            }

            // Programs Section: Only h5, duration, and description
            const programItems = document.querySelectorAll('[data-collection="Programs"] [data-item]');
            if (programItems.length && data.programs) {
                programItems.forEach((item, index) => {
                    const programData = data.programs[index];
                    if (!programData) return;

                    // LevelName (h5)
                    const levelEl = item.querySelector('h5[data-bind="LevelName"]');
                    if (levelEl) levelEl.textContent = programData.LevelName;

                    // Duration (div)
                    const durationEl = item.querySelector('div[data-bind="Duration"]');
                    if (durationEl) durationEl.textContent = programData.Duration;

                    // Description (p)
                    const descEl = item.querySelector('p[data-bind="Description"]');
                    if (descEl) descEl.textContent = programData.Description;
                });
            }

            // Carousel / Testimonials Section
            const carouselItems = document.querySelectorAll('[data-collection="Carousel"] [data-item]');
            if (carouselItems.length && data.carousel) {
                carouselItems.forEach((item, index) => {
                    const testimonial = data.carousel[index];
                    if (!testimonial) return;

                    // Testimonial text (p)
                    const descEl = item.querySelector('p[data-bind="Description"]');
                    if (descEl) descEl.textContent = testimonial.Description;

                    // Client name (strong)
                    const nameEl = item.querySelector('strong[data-bind="clientName"]');
                    if (nameEl) nameEl.textContent = testimonial.clientName;
                });
            }


            // Trainers Section: Only img, h4, and p
            const trainerItems = document.querySelectorAll('[data-collection="Trainers"] [data-item]');
            if (trainerItems.length && data.trainers) {
                trainerItems.forEach((item, index) => {
                    const trainer = data.trainers[index];
                    if (!trainer) return;

                    // Image
                    const imgEl = item.querySelector('img[data-bind="TrainerImg"]');
                    if (imgEl) imgEl.src = trainer.TrainerImg;

                    // Name (h4)
                    const nameEl = item.querySelector('h4[data-bind="TrainerName"]');
                    if (nameEl) nameEl.textContent = trainer.TrainerName;

                    // Description (p)
                    const descEl = item.querySelector('p[data-bind="TrainerDesc"]');
                    if (descEl) descEl.textContent = trainer.TrainerDesc;
                });
            }

            // Gallery Section: Only images
            const galleryItems = document.querySelectorAll('[data-collection="Gallery"] [data-item]');
            if (galleryItems.length && data.gallery) {
                galleryItems.forEach((item, index) => {
                    const gallery = data.gallery[index];
                    if (!gallery) return;

                    const imgEl = item.querySelector('img[data-bind="Imagesrc"]');
                    if (imgEl) imgEl.src = gallery.Imagesrc;
                });
            }

            // CSS Background img 
            const heroBgs = document.querySelectorAll('.hero-bg-half-1, .hero-bg-half-2');

            heroBgs.forEach(bg => {
                if (data.banner.HeroBg) {
                    bg.style.backgroundImage = `url(${data.banner.HeroBg})`;
                }
            });


            // Fitness Goal Image
            const goalImage = document.querySelector('[data-bind="FitnessGoalImage"]');
            if (goalImage && data.fitnessGoal.FitnessGoalImage) {
                goalImage.src = data.fitnessGoal.FitnessGoalImage;
            }



            // ------------------ complete footer section ------------------
            const brandName = document.querySelector('[data-bind="brandname"]');
            if (brandName) brandName.textContent = data.footer.brand.brandname;

            const brandSubName = document.querySelector('[data-bind="brandsubname"]');
            if (brandSubName) brandSubName.textContent = data.footer.brand.brandsubname;

            const brandDesc = document.querySelector('[data-bind="branddesc"]');
            if (brandDesc) brandDesc.textContent = data.footer.brand.branddesc;

            // ------------------ Opening Hours ------------------
            const status = document.querySelector('[data-bind="status"]');
            if (status) status.textContent = data.footer.hours.status;

            const daystatus = document.querySelector('[data-bind="daystatus"]');
            if (daystatus) daystatus.textContent = data.footer.hours.daystatus;

            const timestatus = document.querySelector('[data-bind="timestatus"]');
            if (timestatus) timestatus.textContent = data.footer.hours.timestatus;

            const weekend = document.querySelector('[data-bind="weekend"]');
            if (weekend) weekend.textContent = data.footer.hours.weekend;

            const weekendtime = document.querySelector('[data-bind="weekendtime"]');
            if (weekendtime) weekendtime.textContent = data.footer.hours.weekendtime;

            const weekendstatus = document.querySelector('[data-bind="weekendstatus"]');
            if (weekendstatus) weekendstatus.textContent = data.footer.hours.weekendstatus;

            const closed = document.querySelector('[data-bind="closed"]');
            if (closed) closed.textContent = data.footer.hours.closed;

            // ------------------ Contact Section ------------------
            const locationStatus = document.querySelector('[data-bind="Locationstatus"]');
            if (locationStatus) locationStatus.textContent = data.footer.contact.Locationstatus;

            const location = document.querySelector('[data-bind="Location"]');
            if (location) location.textContent = data.footer.contact.Location;

            const phnNum = document.querySelector('[data-bind="phnNum"]');
            if (phnNum) phnNum.textContent = data.footer.contact.phnNum;

            const email = document.querySelector('[data-bind="Email"]');
            if (email) email.textContent = data.footer.contact.Email;

            // ------------------ Gallery Section ------------------
            for (let i = 1; i <= 6; i++) {
                const imgDiv = document.querySelector(`[data-bind="imagesrc${i}"] img`);
                if (imgDiv) imgDiv.src = data.footer.gallery[`imagesrc${i}`];
            }


        })
        .catch(error => console.error("JSON Load Error:", error));


    // 1. Navbar Smooth Scroll
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // 2. Owl Carousel Initialization
    if (typeof $ !== 'undefined' && $('.header-carousel').length) {
        $('.header-carousel').owlCarousel({
            items: 1,
            loop: true,
            autoplay: true,
            autoplayTimeout: 2000,
            autoplayHoverPause: true,
            nav: true,
            dots: false,
            smartSpeed: 1000
        });
    }

    // 3. Scroll-Trigger Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'gallery' || entry.target.id === 'trainers') {
                    entry.target.querySelectorAll('.animate-image').forEach(el => el.classList.add('active'));
                }
                else if (entry.target.id === 'fitness-goal') {
                    entry.target.querySelectorAll('.goal-animate-left, .goal-animate-top').forEach(el => el.classList.add('active'));
                }
                else {
                    entry.target.classList.add('visible');
                }
            } else {
                if (entry.target.id === 'gallery' || entry.target.id === 'trainers') {
                    entry.target.querySelectorAll('.animate-image').forEach(el => el.classList.remove('active'));
                }
                else if (entry.target.id === 'fitness-goal') {
                    entry.target.querySelectorAll('.goal-animate-left, .goal-animate-top').forEach(el => el.classList.remove('active'));
                }
                else {
                    entry.target.classList.remove('visible');
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => scrollObserver.observe(el));
    ['gallery', 'fitness-goal', 'trainers'].forEach(id => {
        const section = document.getElementById(id);
        if (section) scrollObserver.observe(section);
    });

    // 4. Stagger Effect Logic
    document.querySelectorAll('#gallery .animate-image, #trainers .animate-image, #fitness-goal .goal-animate-left').forEach((el, index) => {
        el.style.transitionDelay = `${(index % 4) * 0.2}s`;
    });

    // 5. Parallax Effect on Scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.card-image-container img');
        parallaxElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const speed = 0.05;
                el.style.transform = `scale(1.15) translateY(${(scrolled - rect.top) * speed}px)`;
            }
        });
    });

    // 6. Open Existing WhatsApp Chat from "Join Now"
    const joinBtn = document.getElementById("joinBtn");
    const whatsappChat = document.getElementById("whatsappChat");

    if (joinBtn && whatsappChat) {
        joinBtn.addEventListener("click", function (e) {
            e.preventDefault();

            // Open chat box
            whatsappChat.classList.add("active");

            // Optional: Auto-fill message
            const input = document.getElementById("waMessage");
            if (input) {
                input.value = "Hi, I want to join the gym and register for the 2 days free trial.";
                input.focus();
            }
        });
    }

});


// ================= WHATSAPP CHAT FUNCTIONS =================
function toggleWhatsApp() {
    const chat = document.getElementById('whatsappChat');
    chat.classList.toggle('active');
}

function sendWAMessage() {
    const msgInput = document.getElementById('waMessage');
    const chatBody = document.getElementById('waChatBody');
    const message = msgInput.value.trim();
    
    const gymPhoneNumber = "917597572392"; 

    if (message) {
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'message-sent';
        userMsgDiv.innerHTML = `<p class="mb-0">${message}</p><small class="text-muted" style="font-size: 0.7rem; opacity: 0.7;">Just now</small>`;
        chatBody.appendChild(userMsgDiv);

        msgInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
            const replyDiv = document.createElement('div');
            replyDiv.className = 'message-received';
            replyDiv.innerHTML = `<p class="mb-0">Connecting you to our official WhatsApp to securely send your message...</p><small class="text-muted" style="font-size: 0.7rem; opacity: 0.7;">System</small>`;
            chatBody.appendChild(replyDiv);
            chatBody.scrollTop = chatBody.scrollHeight;

            setTimeout(() => {
                const whatsappUrl = `https://wa.me/${gymPhoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                toggleWhatsApp(); 
            }, 1500);
        }, 800);
    }
}

function handleWAKey(event) {
    if (event.key === 'Enter') {
        sendWAMessage();
    }
}

