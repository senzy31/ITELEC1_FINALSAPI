document.addEventListener("DOMContentLoaded", () => {
  const movie = JSON.parse(localStorage.getItem("selectedMovie"));
  if (movie) {
    document.getElementById("movieTitle").textContent = movie.title || "--";
    document.getElementById("moviePoster").src = movie.poster || movie.image || "";
    document.getElementById("movieTime").textContent = movie.time
      ? `Showtime: ${movie.time}`
      : "Showtime: --";
    document.getElementById("movieCinema").textContent = movie.cinema
      ? `Cinema: ${movie.cinema}`
      : "Cinema: --";
    document.getElementById("basketTitle").textContent = movie.title || "--";
  }

  const basketList = document.getElementById("basketList");
  const totalCostEl = document.getElementById("totalCost");
  const rows = document.querySelectorAll(".ticket-row:not(.header)");
  const basketItems = {};
  const BOOKING_FEE = 30.0;

  // === Handle ticket quantity updates ===
  rows.forEach((row) => {
    const ticketName = row.children[0].textContent.trim();
    const priceText = row.children[1].textContent.replace(/[₱,]/g, "").trim();
    const price = parseFloat(priceText);
    const plus = row.querySelector(".plus");
    const minus = row.querySelector(".minus");
    const qtyEl = row.querySelector(".qty");
    const subtotalEl = row.querySelector(".subtotal");

    let qty = 0;

    function updateSubtotal() {
      const total = qty * price;
      subtotalEl.textContent = `₱${total.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`;

      if (qty > 0) {
        basketItems[ticketName] = { qty, total };
      } else {
        delete basketItems[ticketName];
      }

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

  // === Update basket items list ===
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
      div.innerHTML = `
        <span>${name} (x${item.qty})</span>
        <strong>₱${item.total.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}</strong>
      `;
      basketList.appendChild(div);
    });
  }

  // === Update total ===
  function updateTotal() {
    let total = 0;
    Object.values(basketItems).forEach((item) => (total += item.total));
    totalCostEl.textContent = `₱${total.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
    })}`;
  }

  // === Elements for step navigation ===
  const nextBtn = document.querySelector(".next-btn");
  const ticketSection = document.getElementById("ticketSection");
  const basket = document.getElementById("basketSection");
  const progressSteps = document.querySelectorAll(".step");
  const confirmationContainer = document.getElementById("confirmationSection");
  const backBtn = document.getElementById("backBtn");
  const confirmBtn = document.getElementById("confirmBtn");
  const successContainer = document.getElementById("successSection");

  // === NEXT (to Confirmation) ===
  nextBtn.addEventListener("click", () => {
    if (Object.keys(basketItems).length === 0) {
      alert("Please select at least one ticket before continuing.");
      return;
    }

    // Hide ticket selection and basket
    ticketSection.style.display = "none";
    basket.style.display = "none";
    confirmationContainer.style.display = "block";

    // Progress bar
    progressSteps[0].classList.remove("active");
    progressSteps[1].classList.add("active");

    // Update confirmation info
    document.getElementById("confirmMovieTitle").textContent =
      document.getElementById("movieTitle").textContent;
    document.getElementById("confirmShowtime").textContent =
      document.getElementById("movieTime").textContent.replace("Showtime: ", "");

    // Populate ticket list
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
    document.getElementById("confirmTotalCost").textContent = `₱${grandTotal.toLocaleString(
      "en-PH",
      { minimumFractionDigits: 2 }
    )}`;
  });

  // === BACK (to Ticket selection) ===
  backBtn.addEventListener("click", () => {
    confirmationContainer.style.display = "none";
    ticketSection.style.display = "block";
    basket.style.display = "block";

    progressSteps[1].classList.remove("active");
    progressSteps[0].classList.add("active");
  });

  // === CONFIRM BOOKING (to Success section) ===
  confirmBtn.addEventListener("click", () => {
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!name || !email) {
      alert("Please enter your name and email before confirming.");
      return;
    }

    // Hide confirmation, show success
    confirmationContainer.style.display = "none";
    successContainer.style.display = "block";

    progressSteps[1].classList.remove("active");
    progressSteps[2].classList.add("active");

    // Fill name/email
    document.getElementById("displayName").textContent = name;
    document.getElementById("displayEmail").textContent = email;

    // Fill movie info
    document.getElementById("successMovieTitle").textContent =
      document.getElementById("movieTitle").textContent;
    document.getElementById("successShowtime").textContent =
      document.getElementById("movieTime").textContent;
    document.getElementById("successCinema").textContent =
      document.getElementById("movieCinema").textContent;

    // Populate ticket list
    const ticketList = document.getElementById("successTicketList");
    ticketList.innerHTML = "";
    Object.entries(basketItems).forEach(([name, item]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${name}</td>
        <td>₱${(item.total / item.qty).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}</td>
        <td>${item.qty}</td>
        <td>₱${item.total.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}</td>
      `;
      ticketList.appendChild(tr);
    });

    // Total + booking fee
    const total = Object.values(basketItems).reduce((sum, item) => sum + item.total, 0);
    const grandTotal = total + BOOKING_FEE;
    document.getElementById("successTotal").textContent = `₱${grandTotal.toLocaleString(
      "en-PH",
      { minimumFractionDigits: 2 }
    )}`;
  });
});
