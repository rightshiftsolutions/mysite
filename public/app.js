// URL PARAMS

const params = new URLSearchParams(window.location.search);

const type = params.get("type") || "google";

const token = params.get("token") || "";

// TOKEN DECODE

let gymId = 0;

let memberId = 0;

try {

  const decoded = atob(token);

  const tokenParams = new URLSearchParams(decoded);

  gymId = tokenParams.get("gymId");

  memberId = tokenParams.get("memberId");

} catch (e) {

  console.log("Invalid token");

}

// ELEMENTS

const gymNameEl = document.getElementById("gymName");

const messageEl = document.getElementById("message");

const actionBtn = document.getElementById("actionBtn");

// GLOBAL DATA

let gymData = {};

// LOAD GYM DETAILS

async function loadGymDetails() {

  try {

    const res = await fetch(
      `https://www.api.gymgurus.in/gym/public-profile?gymId=${gymId}`
    );

    const data = await res.json();

    gymData = data;

    gymNameEl.innerText = data.name || "Gym";

    setupPage();

  } catch (e) {

    console.log(e);

    messageEl.innerText = "Unable to load gym details";

  }

}

// SETUP PAGE

function setupPage() {

  const social = gymData.socialMediaLinks || {};

  // GOOGLE REVIEW

  if (type === "google") {

    messageEl.innerText =
      "Please give your valuable Google review ❤️";

    actionBtn.innerText = "OPEN GOOGLE REVIEW";

    actionBtn.style.display = "block";

    actionBtn.onclick = () => {

      const placeId = social.googleReview;

      const reviewUrl =
        `https://search.google.com/local/writereview?placeid=${placeId}`;

      window.open(reviewUrl, "_blank");

      updateStatus(1);

    };

  }

  // INSTAGRAM

  else if (type === "instagram") {

    messageEl.innerText =
      "Follow us on Instagram 🔥";

    actionBtn.innerText = "OPEN INSTAGRAM";

    actionBtn.style.display = "block";

    actionBtn.onclick = () => {

      window.location.href = social.instagram;

    };

  }

  // YOUTUBE

  else if (type === "youtube") {

    messageEl.innerText =
      "Subscribe our YouTube channel 🎥";

    actionBtn.innerText = "OPEN YOUTUBE";

    actionBtn.style.display = "block";

    actionBtn.onclick = () => {

      window.location.href = social.youtube;

    };

  }

  // TELEGRAM

  else if (type === "telegram") {

    messageEl.innerText =
      "Join our Telegram community 🚀";

    actionBtn.innerText = "OPEN TELEGRAM";

    actionBtn.style.display = "block";

    actionBtn.onclick = () => {

      window.location.href = social.telegram;

    };

  }

  // WHATSAPP

  else if (type === "whatsapp") {

    messageEl.innerText =
      "Join our WhatsApp community 💬";

    actionBtn.innerText = "OPEN WHATSAPP";

    actionBtn.style.display = "block";

    actionBtn.onclick = () => {

      window.location.href = social.whatsapp;

    };

  }

}

// UPDATE STATUS

async function updateStatus(status) {

  try {

    await fetch(
      `https://www.api.gymgurus.in/member/update-social-status?memberId=${memberId}&gymId=${gymId}&googleReview=${status}`,
      {
        method: "PUT"
      }
    );

  } catch (e) {

    console.log(e);

  }

}

// START

loadGymDetails();
