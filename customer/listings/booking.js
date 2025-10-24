(function () {
  // Small booking inputs helper: set sensible defaults and validate.
  const checkIn = document.getElementById("checkIn");
  const checkOut = document.getElementById("checkOut");
  const guests = document.getElementById("guests");
  const calcBtn = document.getElementById("calculatePrice");
  const summary = document.getElementById("bookingSummary");

  if (!checkIn || !checkOut || !guests || !calcBtn || !summary) return;

  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const toISODate = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // defaults: check-in today, check-out tomorrow
  checkIn.value = toISODate(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  checkOut.value = toISODate(tomorrow);

  calcBtn.addEventListener("click", function () {
    const inDate = new Date(checkIn.value);
    const outDate = new Date(checkOut.value);
    if (isNaN(inDate) || isNaN(outDate)) {
      summary.textContent = "Please select valid dates.";
      return;
    }
    if (outDate <= inDate) {
      summary.textContent = "Check-out must be after check-in.";
      return;
    }
    const msPerDay = 24 * 60 * 60 * 1000;
    const nights = Math.round((outDate - inDate) / msPerDay);
    summary.textContent = `${nights} night${nights > 1 ? "s" : ""} · ${
      guests.value
    } guest${guests.value > 1 ? "s" : ""}`;
  });
})();
