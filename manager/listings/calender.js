// Calendar script extracted from index.html
// Keeps the same behavior: render month grid, navigation, today highlight, and click-to-toggle booked dates (in-memory)
(function () {
  const calendarDays = document.getElementById("calendarDays");
  const monthYearEl = document.getElementById("monthYear");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  if (!calendarDays || !monthYearEl || !prevBtn || !nextBtn) {
    // If the calendar isn't present on the page, silently exit.
    return;
  }

  // Sample booked dates (ISO yyyy-mm-dd). Replace with real data if available.
  const bookedDates = new Set([
    // example: '2025-11-10', '2025-11-15'
  ]);

  // state
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth(); // 0-indexed

  function render() {
    monthYearEl.textContent = new Date(viewYear, viewMonth).toLocaleString(
      undefined,
      { month: "long", year: "numeric" }
    );
    calendarDays.innerHTML = "";

    const firstDay = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // previous month's trailing days (render as inactive placeholders)
    for (let i = 0; i < startWeekday; i++) {
      const el = document.createElement("div");
      el.className = "calendar-day inactive";
      calendarDays.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const iso = date.toISOString().slice(0, 10);
      const dayEl = document.createElement("div");
      dayEl.className = "calendar-day";
      dayEl.textContent = String(d);

      // mark today
      const isToday = date.toDateString() === today.toDateString();
      if (isToday) dayEl.classList.add("today");

      // mark booked/available
      if (bookedDates.has(iso)) {
        dayEl.classList.add("booked");
        dayEl.setAttribute("title", "Booked");
      } else if (
        date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      ) {
        // past days: inactive
        dayEl.classList.add("inactive");
        dayEl.setAttribute("title", "Past date");
      } else {
        dayEl.classList.add("available");
        dayEl.setAttribute("title", "Available — click to toggle");
      }

      // toggle availability on click (in-memory)
      dayEl.addEventListener("click", function () {
        if (dayEl.classList.contains("inactive")) return; // no-op
        if (dayEl.classList.contains("booked")) {
          // unbook
          bookedDates.delete(iso);
          dayEl.classList.remove("booked");
          dayEl.classList.add("available");
          dayEl.setAttribute("title", "Available — click to toggle");
        } else {
          bookedDates.add(iso);
          dayEl.classList.add("booked");
          dayEl.classList.remove("available");
          dayEl.setAttribute("title", "Booked");
        }
      });

      calendarDays.appendChild(dayEl);
    }
  }

  prevBtn.addEventListener("click", function () {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    render();
  });

  nextBtn.addEventListener("click", function () {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    render();
  });

  // initial render
  render();
})();
