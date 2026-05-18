// ─── URL PARAMS ─────────────────────────────────────────

const params = new URLSearchParams(window.location.search);

const type =
  params.get("type") || "google";

// ─── TOKEN ──────────────────────────────────────────────

let gymId = '0',
    memberId = '0';

try {

  const token =
    params.get('token') || '';

  if (token) {

    const decoded = atob(token);

    const tp =
      new URLSearchParams(decoded);

    gymId =
      tp.get('gymId') || '0';

    memberId =
      tp.get('memberId') || '0';

  }

} catch(e) {

  console.warn('Invalid token');

}

// ─── SOCIAL VALUES ──────────────────────────────────────

const placeId =
  params.get("placeId") || "";

const instagram =
  params.get("instagram") || "";

const youtube =
  params.get("youtube") || "";

const telegram =
  params.get("telegram") || "";

const whatsapp =
  params.get("whatsapp") || "";

// ─── USER VALUES ────────────────────────────────────────

const gymName =
  params.get("gymName") || "Gym Gurus";

const trainerName =
  params.get("trainerName") || "Trainer";

const memberName =
  params.get("memberName") || "Member";

// ─── GOOGLE REVIEW URL ──────────────────────────────────

const googleReviewUrl =
  `https://search.google.com/local/writereview?placeid=${placeId}`;

// ─── ELEMENTS ───────────────────────────────────────────

const gymNameEl =
  document.getElementById("gymName");

const messageEl =
  document.getElementById("message");

const actionBtn =
  document.getElementById("actionBtn");

// ─── GOOGLE REVIEW FLOW ─────────────────────────────────

if (type === "google") {

  gymNameEl.innerText = gymName;

  messageEl.innerText =
    "Please give your valuable Google review ❤️";

  actionBtn.innerText =
    "START REVIEW";

  actionBtn.style.display = "block";

  actionBtn.onclick = async () => {

    // RANDOM REVIEW

    const reviews = [

      `Best gym experience ever. Trainer ${trainerName} sir is very supportive and motivating.`,

      `Amazing atmosphere and excellent training by ${trainerName} sir.`,

      `Very clean gym with quality equipment. Highly recommended.`,

      `Great gym with positive vibes and knowledgeable trainers.`,

      `One of the best fitness clubs. Really enjoying workouts here.`

    ];

    const review =
      reviews[
        Math.floor(Math.random() * reviews.length)
      ];

    // COPY REVIEW

    try {

      await navigator.clipboard.writeText(
        review
      );

      alert(
        "Review copied successfully!"
      );

    } catch (e) {

      console.log(e);

    }

    // STATUS UPDATE API

    try {

      await fetch(
        `https://www.api.gymgurus.in/member/update-social-status?memberId=${memberId}&gymId=${gymId}&googleReview=1`,
        {
          method: "PUT"
        }
      );

    } catch (e) {

      console.log(e);

    }

    // OPEN GOOGLE REVIEW

    window.open(
      googleReviewUrl,
      "_blank"
    );

  };

}

// ─── INSTAGRAM ──────────────────────────────────────────

else if (type === "instagram") {

  gymNameEl.innerText = "Instagram";

  messageEl.innerText =
    "Follow us on Instagram 🔥";

  actionBtn.innerText =
    "OPEN INSTAGRAM";

  actionBtn.style.display = "block";

  actionBtn.onclick = () => {

    window.open(
      `https://instagram.com/${instagram}`,
      "_blank"
    );

  };

}

// ─── YOUTUBE ────────────────────────────────────────────

else if (type === "youtube") {

  gymNameEl.innerText = "YouTube";

  messageEl.innerText =
    "Subscribe our YouTube channel 🎥";

  actionBtn.innerText =
    "OPEN YOUTUBE";

  actionBtn.style.display = "block";

  actionBtn.onclick = () => {

    window.open(
      `https://youtube.com/@${youtube}`,
      "_blank"
    );

  };

}

// ─── TELEGRAM ───────────────────────────────────────────

else if (type === "telegram") {

  gymNameEl.innerText = "Telegram";

  messageEl.innerText =
    "Join our Telegram community 🚀";

  actionBtn.innerText =
    "OPEN TELEGRAM";

  actionBtn.style.display = "block";

  actionBtn.onclick = () => {

    window.open(
      `https://t.me/${telegram}`,
      "_blank"
    );

  };

}

// ─── WHATSAPP ───────────────────────────────────────────

else if (type === "whatsapp") {

  gymNameEl.innerText = "WhatsApp";

  messageEl.innerText =
    "Chat with us on WhatsApp 💬";

  actionBtn.innerText =
    "OPEN WHATSAPP";

  actionBtn.style.display = "block";

  actionBtn.onclick = () => {

    window.open(
      `https://wa.me/${whatsapp}`,
      "_blank"
    );

  };

}

// ─── INVALID TYPE ───────────────────────────────────────

else {

  messageEl.innerText =
    "Invalid social type";

}
