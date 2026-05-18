// URL PARAMS

const params = new URLSearchParams(window.location.search);

const type = params.get("type") || "";

// SOCIAL VALUES

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

// ELEMENTS

const gymNameEl =
  document.getElementById("gymName");

const messageEl =
  document.getElementById("message");

const actionBtn =
  document.getElementById("actionBtn");

// STATIC TITLE

gymNameEl.innerText = "Gym Gurus";

// GOOGLE REVIEW

if (type === "google") {

  messageEl.innerText =
    "Please give your valuable Google review ❤️";

  actionBtn.innerText =
    "OPEN GOOGLE REVIEW";

  actionBtn.style.display = "block";

  actionBtn.onclick = () => {

    const reviewUrl =
      `https://search.google.com/local/writereview?placeid=${placeId}`;

    window.open(reviewUrl, "_blank");

  };

}

// INSTAGRAM

else if (type === "instagram") {

  messageEl.innerText =
    "Follow us on Instagram 🔥";

  actionBtn.innerText =
    "OPEN INSTAGRAM";

  actionBtn.style.display = "block";

  actionBtn.onclick = () => {

    window.location.href =
      `https://instagram.com/${instagram}`;

  };

}

// YOUTUBE

else if (type === "youtube") {

  messageEl.innerText =
    "Subscribe our YouTube channel 🎥";

  actionBtn.innerText =
    "OPEN YOUTUBE";

  actionBtn.style.display = "block";

  actionBtn.onclick = () => {

    window.location.href =
      `https://youtube.com/@${youtube}`;

  };

}

// TELEGRAM

else if (type === "telegram") {

  messageEl.innerText =
    "Join our Telegram community 🚀";

  actionBtn.innerText =
    "OPEN TELEGRAM";

  actionBtn.style.display = "block";

  actionBtn.onclick = () => {

    window.location.href =
      `https://t.me/${telegram}`;

  };

}

// WHATSAPP

else if (type === "whatsapp") {

  messageEl.innerText =
    "Chat with us on WhatsApp 💬";

  actionBtn.innerText =
    "OPEN WHATSAPP";

  actionBtn.style.display = "block";

  actionBtn.onclick = () => {

    window.location.href =
      `https://wa.me/${whatsapp}`;

  };

}

// INVALID TYPE

else {

  messageEl.innerText =
    "Invalid social type";

}
