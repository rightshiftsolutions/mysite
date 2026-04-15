/**
 * 26fitnessClub - Offer Designer Logic
 */

const presets = {
    diwali: {
        badgeText: "Diwali Special",
        title: "Festival of",
        titleAccent: "Lights",
        titleSuffix: "Offer",
        discount: "Get 4 Months ",
        discountAccent: "FREE",
        description: "Celebrate this Diwali with a transformation! Join our Elite plan and get 4 months free plus a complimentary 26fitnessClub gym kit.",
        whatsappMessage: "Hi! I want to claim the Diwali Festival of Lights Offer at 26fitnessClub."
    },
    holi: {
        badgeText: "Holi Dhamaka",
        title: "Festival of",
        titleAccent: "Colors",
        titleSuffix: "Sale",
        discount: "Flat 40% ",
        discountAccent: "OFF",
        description: "Add some color to your fitness journey! Enjoy a flat 40% discount on all annual memberships during our Holi celebration.",
        whatsappMessage: "Hi! I'm interested in the Holi Festival of Colors Offer at 26fitnessClub."
    },
    garba: {
        badgeText: "Navratri Special",
        title: "Garba",
        titleAccent: "Nights",
        titleSuffix: "Offer",
        discount: "9 Days ",
        discountAccent: "FREE",
        description: "Get ready for the dance floor! Sign up for 6 months and get 9 extra days free to celebrate the spirit of Navratri. Stay fit, stay active!",
        whatsappMessage: "Hey! Tell me more about the Garba Nights Navratri Offer at 26fitnessClub."
    },
    couple: {
        badgeText: "Better Together",
        title: "Couple",
        titleAccent: "Fitness",
        titleSuffix: "Deal",
        discount: "Join 1 Get ",
        discountAccent: "50% OFF",
        description: "Double the motivation, double the results! Sign up with your partner and get a massive 50% discount on the second membership.",
        whatsappMessage: "Hi! We're interested in the Couple Fitness Deal at 26fitnessClub."
    },
    referral: {
        badgeText: "Refer & Earn",
        title: "Member",
        titleAccent: "Get",
        titleSuffix: "Member",
        discount: "GET 1 MONTH ",
        discountAccent: "FREE",
        description: "Bring your squad! For every friend you refer who joins on an annual plan, you both get an entire month added to your current membership.",
        whatsappMessage: "Hi! I want to refer a friend to 26fitnessClub and claim my free month."
    },
    student: {
        badgeText: "Fuel Your Future",
        title: "Student",
        titleAccent: "Power",
        titleSuffix: "Plan",
        discount: "Flat 25% ",
        discountAccent: "OFF",
        description: "Focus on your books AND your bench press! Show your valid student ID and enjoy a 25% discount on all monthly and quarterly memberships.",
        whatsappMessage: "Hey! I'm a student and I want to claim the Student Power Plan discount."
    },
    corporate: {
        badgeText: "Desk to Deadlift",
        title: "Corporate",
        titleAccent: "Wellness",
        titleSuffix: "Offer",
        discount: "Group ",
        discountAccent: "DISCOUNTS",
        description: "Take your team's health to the next level. Special discounted rates for groups of 5+ from the same organization. Boost productivity with fitness!",
        whatsappMessage: "Hi! I'm inquiring about a Corporate Wellness discount for my team at 26fitnessClub."
    },
    anniversary: {
        badgeText: "Anniversary Bash",
        title: "Celebrating",
        titleAccent: "X",
        titleSuffix: "Years",
        discount: "UNBEATABLE ",
        discountAccent: "PRICES",
        description: "It's our birthday but you get the gifts! Our biggest sale of the year is here. Join today for our special anniversary rates, limited to the first 100 members.",
        whatsappMessage: "Congratulations on your Anniversary! I want to claim the special anniversary bash pricing."
    },
    newyear: {
        badgeText: "New Year 2026",
        title: "New Year",
        titleAccent: "New",
        titleSuffix: "You",
        discount: "Start for only ",
        discountAccent: "Rs.1",
        description: "Smash your 2026 goals! Start your fitness journey today for just Rs.1 for the first month. No joining fees, no excuses.",
        whatsappMessage: "Hi! Help me start my New Year Resolution with the Rs.1 offer at 26fitnessClub."
    },
    christmas: {
        badgeText: "Season's Greetings",
        title: "Xmas",
        titleAccent: "Gift",
        titleSuffix: "Voucher",
        discount: "GET Rs.50 ",
        discountAccent: "CREDIT",
        description: "The perfect gift for yourself! Sign up this December and receive a Rs.50 credit towards personal training or gym merchandise.",
        whatsappMessage: "Hi! I'd like to claim my Rs.50 Christmas Gift credit at 26fitnessClub."
    },
    id: {
        badgeText: "Eid Special",
        title: "Eid",
        titleAccent: "Mubarak",
        titleSuffix: "Offer",
        discount: "Get 2 Months ",
        discountAccent: "FREE",
        description: "Wishing you a healthy Eid! Join the 26fitnessClub family during this festive season and get 2 months additional access on us.",
        whatsappMessage: "Hi! I'm interested in the Eid Mubarak Special Offer at 26fitnessClub."
    },
    independence: {
        badgeText: "Freedom Sale",
        title: "Independence",
        titleAccent: "Day",
        titleSuffix: "Special",
        discount: "Get 15% ",
        discountAccent: "OFF",
        description: "Celebrate freedom with fitness! Enjoy a special 15% discount on all our membership plans. Power to the people!",
        whatsappMessage: "Hi! I want to claim the Independence Day Special discount at 26fitnessClub."
    },
    summer: {
        badgeText: "Limited Time",
        title: "Summer",
        titleAccent: "Shred",
        titleSuffix: "Offer",
        discount: "Get 3 Months ",
        discountAccent: "FREE",
        description: "Sign up for an annual Elite Membership today and get your first 3 months completely free, plus 2 complimentary personal training sessions.",
        whatsappMessage: "Hi! I'm interested in the Summer Shred Offer from 26fitnessClub."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('offer-form');
    const presetSelect = document.getElementById('preset-select');
    // Form inputs
    const inputs = {
        badgeText: document.getElementById('badgeText'),
        title: document.getElementById('title'),
        titleAccent: document.getElementById('titleAccent'),
        titleSuffix: document.getElementById('titleSuffix'),
        discount: document.getElementById('discount'),
        discountAccent: document.getElementById('discountAccent'),
        description: document.getElementById('description'),
        whatsappMessage: document.getElementById('whatsappMessage')
    };

    // Live preview elements
    const previews = {
        badgeText: document.getElementById('prev-badge'),
        title: document.getElementById('prev-title'),
        titleAccent: document.getElementById('prev-titleAccent'),
        titleSuffix: document.getElementById('prev-titleSuffix'),
        discount: document.getElementById('prev-discount'),
        discountAccent: document.getElementById('prev-discountAccent'),
        description: document.getElementById('prev-description')
    };

    // Initialize with default (Summer)
    loadPreset('summer');

    // Listen for preset changes
    presetSelect.addEventListener('change', (e) => {
        if (e.target.value && presets[e.target.value]) {
            loadPreset(e.target.value);
        }
    });

    // Listen for manual input changes
    Object.keys(inputs).forEach(key => {
        inputs[key].addEventListener('input', () => {
            updatePreview(key, inputs[key].value);
        });
    });

    // Function to load a preset
    function loadPreset(key) {
        const data = presets[key];
        Object.keys(data).forEach(field => {
            if (inputs[field]) inputs[field].value = data[field];
            if (previews[field]) previews[field].textContent = data[field];
        });
    }

    // Function to update preview
    function updatePreview(key, value) {
        if (previews[key]) {
            previews[key].textContent = value;
        }
    }

    // Handle WhatsApp Send
    const whatsappBtn = document.getElementById('btn-whatsapp');
    whatsappBtn.addEventListener('click', () => {
        const offerData = generateOfferData();
        const jsonString = JSON.stringify(offerData, null, 2);
        
        // WhatsApp link construction
        const phoneNumber = '919205535096'; // India country code +91
        const messageText = `update offer\n\n${jsonString}`;
        const encodedMessage = encodeURIComponent(messageText);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
    });

    // Helper to collect form data
    function generateOfferData() {
        const offerData = {};
        Object.keys(inputs).forEach(key => {
            offerData[key] = inputs[key].value;
        });
        return offerData;
    }
});
