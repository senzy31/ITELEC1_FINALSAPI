document.addEventListener("DOMContentLoaded", () => {
  // === LOAD SELECTED MOVIE ===
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
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.margin = "4px 0";
      div.innerHTML = `
        <span>${name} (x${item.qty})</span>
        <strong>₱${item.total.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}</strong>
      `;
      basketList.appendChild(div);
    });
  }

  function updateTotal() {
    let total = 0;
    Object.values(basketItems).forEach((item) => (total += item.total));
    totalCostEl.textContent = `₱${total.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
    })}`;
  }
});
