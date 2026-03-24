// Fallback data for file:// protocol (mirrors data.json exactly)
// Edit data.json for server deployments; edit this file for local file:// use.
const DATA = {
  ribbon:
    "\u2696\uFE0F Bar Council of Rajasthan \u2022 Election Campaign \u2022 Your Vote Matters",

  nav: {
    name: "Nidhi Khandelwal",
    sub: "Advocate \u00B7 Rajasthan High Court",
    enrollBadge: "Enroll. R/3505/2005",
  },

  hero: {
    slides: [
      {
        eyebrow:
          "\uD83D\uDDF3\uFE0F Bar Council of Rajasthan \u2014 Election 2025",
        firstName: "Nidhi",
        lastName: "Khandelwal",
        titleLine: "Advocate \u00B7 Rajasthan High Court, Jaipur",
        pills: ["Enrollment No. R/3505/2005", "Since 23 Dec 2005"],
        ctaLabel: "\uD83D\uDCDE  +91-9887298872",
        ctaHref: "tel:+919887298872",
        ctaOutlineLabel: "View Campaign \u2193",
        ctaOutlineHref: "#election",
        visual: "photo",
      },
      {
        eyebrow: "\uD83D\uDCA1 Vision for 2025",
        firstName: "Empowering",
        lastName: "Legal Fraternity",
        titleLine: "Digital Transformation & Advocate Welfare",
        pills: ["Insurance for All", "Digital Library Access"],
        ctaLabel: "View Manifesto",
        ctaHref: "#election",
        ctaOutlineLabel: "Know More \u2193",
        ctaOutlineHref: "#details",
        visual: "vision",
        visualIcon: "\uD83D\uDCA1",
        visualPoints: [
          "Free Legal Aid",
          "Digital Court Access",
          "Advocate Insurance",
          "Welfare Fund",
        ],
      },
      {
        eyebrow: "\uD83E\uDD1D Integrity & Trust",
        firstName: "Commitment",
        lastName: "To Justice",
        titleLine: "Ensuring Transparency in Bar Administration",
        pills: ["Fair Representation", "Member Support 24/7"],
        ctaLabel: "Join the Movement",
        ctaHref: "#election",
        ctaOutlineLabel: "Contact Us \u2193",
        ctaOutlineHref: "#consultation",
        visual: "commitment",
        visualIcon: "\u2696\uFE0F",
        visualPoints: [
          "Transparent Elections",
          "Equal Opportunity",
          "Strong Bar Council",
          "Member Welfare",
        ],
      },
    ],
  },

  election: {
    badge: "\uD83D\uDDF3\uFE0F  Official Election Campaign",
    heading:
      "Contesting for <strong>Member</strong>,<br/>Bar Council of Rajasthan",
    voteLine:
      "Humbly seeking your <em>First Preference / Best Preference Vote</em>",
    primaryBtn: {
      label: "\uD83D\uDCDE  Call to Support",
      href: "tel:+919887298872",
    },
    outlineBtn: { label: "View Profile", href: "#details" },
  },

  profile: {
    name: "Nidhi Khandelwal",
    title: "Advocate \u00B7 R/3505/2005",
    rows: [
      { icon: "\uD83D\uDCCB", label: "Enrollment No.", value: "R/3505/2005" },
      {
        icon: "\uD83D\uDCC5",
        label: "Enrollment Date",
        value: "23 December 2005",
      },
      {
        icon: "\uD83D\uDCF1",
        label: "Mobile",
        value: "+91-9887298872",
        link: "tel:+919887298872",
      },
      {
        icon: "\uD83C\uDFE2",
        label: "Chamber",
        value: "No. 219, E-Block<br/>Rajasthan High Court",
      },
    ],
  },

  infoCards: [
    {
      icon: "\u2696\uFE0F",
      label: "Contesting For",
      value: "Member",
      sub: "Bar Council of Rajasthan",
    },
    {
      icon: "\uD83C\uDFDB\uFE0F",
      label: "Court",
      value: "Rajasthan High Court",
      sub: "Jaipur, Rajasthan",
    },
    {
      icon: "\uD83D\uDCCB",
      label: "Enrollment Number",
      value: "R/3505/2005",
      sub: "Bar Council of Rajasthan",
    },
    {
      icon: "\uD83D\uDCC5",
      label: "Enrollment Date",
      value: "23 December 2005",
      sub: "20+ Years of Practice",
    },
    {
      icon: "\uD83D\uDCF1",
      label: "Mobile",
      value: "+91-9887298872",
      sub: "Available for consultation",
      link: "tel:+919887298872",
    },
    {
      icon: "\uD83C\uDFE2",
      label: "Chamber Address",
      value: "Chamber No. 219, E-Block",
      sub: "Rajasthan High Court, Jaipur",
    },
  ],

  contactCards: [
    {
      icon: "\uD83D\uDCF1",
      label: "Mobile",
      value: "+91-9887298872",
      link: "tel:+919887298872",
    },
    {
      icon: "\uD83C\uDFE2",
      label: "Chamber Address",
      value: "Chamber No. 219, E-Block,<br/>Rajasthan High Court, Jaipur",
    },
    {
      icon: "\uD83D\uDCCB",
      label: "Enrollment",
      value: "R/3505/2005<br/>Enrolled: 23/12/2005",
    },
  ],

  consultation: {
    badge: "Private & Confidential",
    heading: "Free Legal Consultation",
    subtext:
      "Discuss your legal matter confidentially with Advocate Nidhi Khandelwal.",
    whatsappNumber: "919887298872",
    fields: {
      fullName: { label: "Full Name", placeholder: "Enter your full name" },
      phone: { label: "Phone Number", prefix: "+91 " },
      email: { label: "Email Address", placeholder: "mail@example.com" },
      message: {
        label: "Describe Your Case",
        placeholder: "Briefly describe your legal requirement...",
      },
    },
    consentText:
      "I agree to receive communications regarding my inquiry via WhatsApp and Email in accordance with the <strong>Privacy Policy</strong>.",
    submitLabel: "Book Consultation",
    confidentialNote: "Your information is 100% confidential",
    footerNote: "Advocate Nidhi Khandelwal",
    successHeading: "Request Prepared!",
    successText: "Opening WhatsApp to connect you with our legal team...",
  },

  footer: {
    about: {
      name: "Nidhi Khandelwal",
      role: "Advocate",
      tagline:
        "Practicing at Rajasthan High Court, Jaipur with over 20 years of experience.",
    },
    quickLinks: [
      { label: "Home", href: "#" },
      { label: "Profile", href: "#details" },
      { label: "Contact", href: "#consultation" },
      { label: "Election Campaign", href: "#election" },
    ],
    contact: {
      phone: { display: "+91-9887298872", href: "tel:+919887298872" },
      address: "Chamber No. 219, E-Block,<br>Rajasthan High Court, Jaipur",
      mapsUrl: "https://maps.google.com/?q=Rajasthan+High+Court+Jaipur",
    },
    whatsapp: "https://wa.me/919887298872",
    copyright: "\u00A9 2025 Nidhi Khandelwal. All Rights Reserved.",
    campaignNote: "Authorized Election Campaign Material",
  },
};
