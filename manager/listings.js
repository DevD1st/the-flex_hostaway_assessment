(() => {
  // Configuration
  const API_BASE_URL = "http://localhost:3000";

  // Helper Functions
  function convertTo12Hour(hour) {
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}${period}`;
  }

  function getStarRating(rating) {
    return (rating / 2).toFixed(2);
  }

  function showError(message) {
    const popup = document.createElement("div");
    popup.className = "error-popup";
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.classList.add("hide");
      setTimeout(() => popup.remove(), 300);
    }, 3000);
  }

  function toggleLoading(show) {
    const existingOverlay = document.querySelector(".loading-overlay");
    if (show && !existingOverlay) {
      const overlay = document.createElement("div");
      overlay.className = "loading-overlay";
      overlay.innerHTML = '<div class="loading-spinner"></div>';
      document.body.appendChild(overlay);
    } else if (!show && existingOverlay) {
      existingOverlay.remove();
    }
  }

  function createListingHTML(listing) {
    const firstImage = listing.listingImages[0];
    const rating = listing.averageReviewRating
      ? getStarRating(listing.averageReviewRating)
      : "N/A";

    return `
      <li class="board">
        <a class="board__link" href="/listings/?id=${listing.id}">
          <div>
            <ul class="board__top">
              <li class="board__images">
                <img
                  alt=""
                  loading="lazy"
                  decoding="async"
                  data-nimg="fill"
                  class="board__image"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  src="${firstImage.url}"
                  style="position: absolute; height: 100%; width: 100%; inset: 0px; color: transparent;"
                />
                <div class="board__top-info">
                  <div class="board__top-info--listing">
                    <span color="#CC1F1F">All listings</span>
                  </div>
                  <div class="board__top-info--rating">${rating}</div>
                </div>
              </li>
            </ul>
          </div>

          <div class="board__bottom">
            <h4 class="bottom-header">${listing.name}</h4>

            <ul class="bottom-bed-et-el">
              <li class="bottom-bed-et-el--item">${
                listing.personCapacity
              } guests</li>
              ${
                listing.bedroomsNumber
                  ? `<li class="bottom-bed-et-el--item">${listing.bedroomsNumber} bedrooms</li>`
                  : ""
              }
              ${
                listing.bathroomsNumber
                  ? `<li class="bottom-bed-et-el--item">${listing.bathroomsNumber} baths</li>`
                  : ""
              }
            </ul>

            <ul class="bottom-amenities">
              ${(listing.listingAmenities || [])
                .slice(0, 3)
                .map((amenity) => `<li class="bottom-amenity">${amenity}</li>`)
                .join("")}
            </ul>
          </div>
        </a>
      </li>
    `;
  }

  async function fetchListings() {
    try {
      toggleLoading(true);

      const response = await fetch(`${API_BASE_URL}/listings`, {
        headers: {
          Authorization: "Bearer admin",
        },
      });
      const data = await response.json();

      if (data.name !== "Success") {
        throw new Error(data.message);
      }

      const listings = data.data.result;
      const mainBoard = document.querySelector(".main-board");
      mainBoard.innerHTML = listings
        .map((listing) => createListingHTML(listing))
        .join("");
    } catch (error) {
      console.error("Error fetching listings:", error);
      showError(error.message || "Failed to load listings");
    } finally {
      toggleLoading(false);
    }
  }

  // Initialize when DOM is loaded
  document.addEventListener("DOMContentLoaded", fetchListings);
})();
