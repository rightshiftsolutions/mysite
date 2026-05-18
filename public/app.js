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

const reviewBox =
  document.getElementById("reviewBox");

const reviewText =
  document.getElementById("reviewText");

const successMsg =
  document.getElementById("successMsg");

// ─── GOOGLE REVIEW FLOW ─────────────────────────────────

if (type === "google") {

  gymNameEl.innerText = gymName;

  messageEl.innerText =
    "How was your experience?";

  // HIDE BUTTON INITIALLY

  actionBtn.style.display = "none";

  // CREATE STARS CONTAINER

  const starsContainer =
    document.createElement("div");

  starsContainer.style.display = "flex";
  starsContainer.style.justifyContent = "center";
  starsContainer.style.gap = "10px";
  starsContainer.style.marginTop = "20px";
  starsContainer.style.marginBottom = "20px";

  // CREATE STARS

  for (let i = 1; i <= 5; i++) {

    const star =
      document.createElement("span");

    star.innerHTML = "⭐";

    star.style.fontSize = "40px";

    star.style.cursor = "pointer";

    star.style.opacity = "0.3";

    star.onclick = async () => {

      // HIGHLIGHT STARS

      [...starsContainer.children]
        .forEach((s, index) => {

          s.style.opacity =
            index < i ? "1" : "0.3";

        });

      // GENERATE REVIEW

      let review = "";

      // 5 STAR

      if (i === 5) {

        review =
          `Amazing gym experience. Trainer ${trainerName} sir is extremely supportive and motivating. Highly recommended!`;

      }

      // 4 STAR

      else if (i === 4) {

        review =
          `Very good gym with excellent atmosphere and helpful trainer ${trainerName} sir.`;

      }

      // 3 STAR

      else if (i === 3) {

        review =
          `Gym is decent and trainer ${trainerName} sir is helpful overall.`;

      }

      // 2 STAR

      else if (i === 2) {

        review =
          `Gym needs some improvements but overall experience was okay.`;

      }

      // 1 STAR

      else {

        review =
          `Gym experience was not very satisfying and improvements are needed.`;

      }

      // SHOW REVIEW BOX

      reviewBox.style.display = "block";

      reviewText.value = review;

      // COPY REVIEW

      try {

        await navigator.clipboard.writeText(
          review
        );

        successMsg.style.display = "block";

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

      // SHOW GOOGLE BUTTON

      actionBtn.innerText =
        "OPEN GOOGLE REVIEW";

      actionBtn.style.display = "block";

      actionBtn.onclick = () => {

        window.open(
          googleReviewUrl,
          "_blank"
        );

      };

    };

    starsContainer.appendChild(star);

  }

  // APPEND STARS

  messageEl.after(starsContainer);

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
