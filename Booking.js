document.addEventListener("DOMContentLoaded", () => {
  const movie = JSON.parse(localStorage.getItem("selectedMovie"));
  if (movie) {
    document.getElementById("movieTitle").textContent = movie.title || "--";
    document.getElementById("moviePoster").src = movie.poster || movie.image || "";
    document.getElementById("movieTime").textContent = movie.time
      ? `Showtime: ${movie.time}`
      : "Showtime: --";
    document.getElementById("basketTitle").textContent = movie.title || "--";
  }

  const basketList = document.getElementById("basketList");
  const totalCostEl = document.getElementById("totalCost");
  const rows = document.querySelectorAll(".ticket-row:not(.header)");
  const basketItems = {};
  const BOOKING_FEE = 30.0;

  rows.forEach((row) => {
    const ticketName = row.children[0].textContent.trim();
    const price = parseFloat(row.children[1].textContent.replace(/[₱,]/g, "").trim());
    const plus = row.querySelector(".plus");
    const minus = row.querySelector(".minus");
    const qtyEl = row.querySelector(".qty");
    const subtotalEl = row.querySelector(".subtotal");

    let qty = 0;

    function updateSubtotal() {
      const total = qty * price;
      subtotalEl.textContent = `₱${total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
      if (qty > 0) basketItems[ticketName] = { qty, total };
      else delete basketItems[ticketName];
      updateBasket();
      updateTotal();
    }

    plus.addEventListener("click", () => {
      if (qty < 8) {
        qty++;
        qtyEl.textContent = qty;
        updateSubtotal();
      }
    });

    minus.addEventListener("click", () => {
      if (qty > 0) {
        qty--;
        qtyEl.textContent = qty;
        updateSubtotal();
      }
    });
  });

  function updateBasket() {
    basketList.innerHTML = "";
    const entries = Object.entries(basketItems);
    if (entries.length === 0) {
      basketList.innerHTML = `<p style="color:gray;">No tickets selected yet.</p>`;
      return;
    }
    entries.forEach(([name, item]) => {
      const div = document.createElement("div");
      div.classList.add("basket-item");
      div.innerHTML = `<span>${name} (x${item.qty})</span><strong>₱${item.total.toLocaleString(
        "en-PH",
        { minimumFractionDigits: 2 }
      )}</strong>`;
      basketList.appendChild(div);
    });
  }

  function updateTotal() {
    let total = 0;
    Object.values(basketItems).forEach((item) => (total += item.total));
    totalCostEl.textContent = `₱${total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  }

  const nextBtn = document.querySelector(".next-btn");
  const ticketSection = document.querySelector(".ticket-section");
  const basket = document.querySelector(".basket");
  const progressSteps = document.querySelectorAll(".step");
  const confirmationContainer = document.querySelector(".confirmation-container");
  const backBtn = document.getElementById("backBtn");
  const confirmBtn = document.getElementById("confirmBtn");

  nextBtn.addEventListener("click", () => {
    if (Object.keys(basketItems).length === 0) {
      alert("Please select at least one ticket before continuing.");
      return;
    }

    ticketSection.style.display = "none";
    basket.style.display = "none";
    confirmationContainer.style.display = "block";

    progressSteps[0].classList.remove("active");
    progressSteps[1].classList.add("active");

    document.getElementById("confirmMovieTitle").textContent =
      document.getElementById("movieTitle").textContent;
    document.getElementById("confirmShowtime").textContent =
      document.getElementById("movieTime").textContent.replace("Showtime: ", "");

    const confirmList = document.getElementById("confirmTicketList");
    confirmList.innerHTML = "";
    let totalTicketCost = 0;

    Object.entries(basketItems).forEach(([name, item]) => {
      const div = document.createElement("div");
      div.innerHTML = `${name} (x${item.qty}) - ₱${item.total.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`;
      confirmList.appendChild(div);
      totalTicketCost += item.total;
    });

    const bookingFeeDiv = document.createElement("div");
    bookingFeeDiv.innerHTML = `BOOKING FEE - ₱${BOOKING_FEE.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
    })}`;
    confirmList.appendChild(bookingFeeDiv);

    const grandTotal = totalTicketCost + BOOKING_FEE;
    document.getElementById(
      "confirmTotalCost"
    ).textContent = `₱${grandTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  });

  backBtn.addEventListener("click", () => {
    confirmationContainer.style.display = "none";
    ticketSection.style.display = "block";
    basket.style.display = "block";
    progressSteps[1].classList.remove("active");
    progressSteps[0].classList.add("active");
  });

  confirmBtn.addEventListener("click", () => {
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!name || !email) {
      alert("Please enter your name and email before confirming.");
      return;
    }

    alert(`Thank you ${name}! Your booking confirmation will be sent to ${email}.`);
  });
});
