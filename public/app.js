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

    window.open(
      `https://search.google.com/local/writereview?placeid=${placeId}`,
      "_blank"
    );

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

    window.open(
      `https://instagram.com/${instagram}`,
      "_blank"
    );

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

    window.open(
      `https://youtube.com/@${youtube}`,
      "_blank"
    );

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

    window.open(
      `https://t.me/${telegram}`,
      "_blank"
    );

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

    window.open(
      `https://wa.me/${whatsapp}`,
      "_blank"
    );

  };

}

// INVALID TYPE

else {

  messageEl.innerText =
    "Invalid social type";

}
