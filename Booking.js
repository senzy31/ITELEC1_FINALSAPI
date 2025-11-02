document.addEventListener("DOMContentLoaded", function () {
  const ticketRows = document.querySelectorAll(".ticket-row:not(.header)");
  const totalDisplay = document.querySelector(".total h2");
  const basketItemPrice = document.querySelector(".basket-item span:last-child");

  ticketRows.forEach((row) => {
    const plusBtn = row.querySelector(".plus");
    const minusBtn = row.querySelector(".minus");
    const qtyDisplay = row.querySelector(".qty");
    const subtotalDisplay = row.querySelectorAll("span")[3]; // 4th span is subtotal
    const priceText = row.querySelectorAll("span")[1].innerText.replace(/[₱,]/g, "");
    const price = parseFloat(priceText);

    let qty = 0;

    function updateSubtotal() {
      const subtotal = qty * price;
      subtotalDisplay.textContent = `₱${subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
      updateTotal();
    }

    function updateTotal() {
      let total = 0;
      ticketRows.forEach((r) => {
        const sub = r.querySelectorAll("span")[3].innerText.replace(/[₱,]/g, "");
        total += parseFloat(sub) || 0;
      });
      totalDisplay.textContent = `₱${total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
      basketItemPrice.textContent = totalDisplay.textContent;
    }

    plusBtn.addEventListener("click", () => {
      if (qty < 8) {
        qty++;
        qtyDisplay.textContent = qty;
        updateSubtotal();
      }
    });

    minusBtn.addEventListener("click", () => {
      if (qty > 0) {
        qty--;
        qtyDisplay.textContent = qty;
        updateSubtotal();
      }
    });
  });
});

