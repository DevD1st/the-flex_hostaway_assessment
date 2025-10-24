import {
  API_BASE_URL,
  showError,
  toggleLoading,
  convertTo12Hour,
  getStarRating,
} from "./utils.js";

(() => {
  /**
   * Render photo gallery
   */
  function renderPhotoGallery(photos) {
    const gallery = document.createElement("div");
    gallery.className = "photo-gallery";

    gallery.innerHTML = `
      <button class="photo-gallery__close">&times;</button>
      <div class="photo-gallery__container">
        ${photos
          .map(
            (photo) => `
          <img 
            class="photo-gallery__image" 
            src="${photo.url}"
            alt="${photo.caption || ""}"
            loading="lazy"
          />
        `
          )
          .join("")}
      </div>
    `;

    document.body.appendChild(gallery);

    // Show with animation
    requestAnimationFrame(() => gallery.classList.add("show"));

    // Close handlers
    const closeBtn = gallery.querySelector(".photo-gallery__close");
    const closeGallery = () => {
      gallery.classList.remove("show");
      setTimeout(() => gallery.remove(), 300);
    };

    closeBtn.addEventListener("click", closeGallery);
    gallery.addEventListener("click", (e) => {
      if (e.target === gallery) closeGallery();
    });
  }

  /**
   * Initialize photo gallery button
   */
  function initializePhotoGallery(listing) {
    const photoBtn = document.querySelector(".top__action");
    if (!photoBtn) return;

    // Update photo count
    const photoCount = listing.listingImages.length;
    photoBtn.textContent = `+${photoCount} Photos`;

    // Add click handler
    photoBtn.addEventListener("click", () => {
      renderPhotoGallery(listing.listingImages);
    });
  }

  /**
   * Render main images grid
   */
  function renderImages(images) {
    const maxImages = 5;
    const imageContainer = document.querySelector(".top__images");
    if (!imageContainer) return;

    // Clear existing images
    imageContainer.innerHTML = "";

    // Add first image
    const firstImage = images[0];
    imageContainer.innerHTML = `
      <div class="top__image-ctn--1st-image">
        <img
          alt="${firstImage.caption || ""}"
          loading="eager"
          decoding="async"
          data-nimg="fill"
          src="${firstImage.url}"
          style="position: absolute; height: 100%; width: 100%; left: 0; top: 0; right: 0; bottom: 0; object-fit: cover; object-position: center; color: transparent;"
        />
      </div>
    `;

    // Add subsequent images (up to maxImages)
    images.slice(1, maxImages).forEach((image) => {
      imageContainer.innerHTML += `
        <div class="top__image-ctn--subsequent-image">
          <img
            alt="${image.caption || ""}"
            loading="eager"
            decoding="async"
            data-nimg="fill"
            src="${image.url}"
            style="position: absolute; height: 100%; width: 100%; left: 0; top: 0; right: 0; bottom: 0; object-fit: cover; object-position: center; color: transparent;"
          />
        </div>
      `;
    });
  }

  /**
   * Render listing details
   */
  function renderListingDetails(listing) {
    // Title
    document.querySelector(".bottom__title").textContent = listing.name;

    // Property details
    const detailsContainer = document.querySelector(
      ".bottom__bed-et-al--ctn-2"
    );
    detailsContainer.innerHTML = `
      <span>${listing.type}</span>
      <span><span class="bed-et-al__dot">·</span>${
        listing.personCapacity
      } guests</span>
      ${
        listing.bedroomsNumber
          ? `<span><span class="bed-et-al__dot">·</span>${listing.bedroomsNumber} Bedrooms</span>`
          : ""
      }
      ${
        listing.bathroomsNumber
          ? `<span><span class="bed-et-al__dot">·</span>${listing.bathroomsNumber} Bathrooms</span>`
          : ""
      }
    `;

    // Ratings - Update both rating sections
    const rating = getStarRating(listing.averageReviewRating);
    document.querySelector(".bottom__ratings-rating").textContent = rating;
    document.querySelector(".bottom__ratings-review").textContent = `${
      listing.reviewCount
    } review${listing.reviewCount === 1 ? "" : "s"}`;

    // Update the reviews title section as well
    const reviewsTitleContainer = document.querySelector(
      ".bottom__reviews-title-ctn"
    );
    if (reviewsTitleContainer) {
      const titleText = document.createElement("div");
      titleText.className = "reviews-header-rating";
      titleText.textContent = `${rating} (${listing.reviewCount})`;

      // Clear any existing rating text and append new one
      Array.from(reviewsTitleContainer.childNodes).forEach((node) => {
        if (
          node.nodeType === Node.TEXT_NODE ||
          node.classList?.contains("reviews-header-rating")
        ) {
          node.remove();
        }
      });
      reviewsTitleContainer.appendChild(titleText);
    }

    // Description
    document.querySelector(".bottom__details").textContent =
      listing.description;

    // Amenities
    const amenitiesContainer = document.querySelector(".bottom__amenities-ctn");
    amenitiesContainer.innerHTML = (listing.listingAmenities || [])
      .map(
        (amenity) => `
      <div class="bottom__amenities-item-ctn">
        <div>
          <div>${amenity}</div>
        </div>
      </div>
    `
      )
      .join("");

    // House rules
    const checkInEnd = listing.checkInTimeEnd
      ? `-${convertTo12Hour(listing.checkInTimeEnd)}`
      : "";
    const leftRulesContainer = document.querySelector(
      ".bottom__rules--left-ctn"
    );
    leftRulesContainer.innerHTML = `
      <div class="bottom__rule">Check-in: ${convertTo12Hour(
        listing.checkInTimeStart
      )}${checkInEnd}</div>
      <div class="bottom__rule">Check-out: ${convertTo12Hour(
        listing.checkOutTimeStart
      )}</div>
    `;

    const rightRulesContainer = document.querySelector(
      ".bottom__rules--right-ctn"
    );
    rightRulesContainer.innerHTML = `
      <div class="bottom__rule">Pets: ${listing.pets}</div>
      <div class="bottom__rule">Smoking inside: ${listing.smokingInside}</div>
    `;

    // Cancellation policy
    document.querySelector(".bottom__policy").textContent =
      listing.cancellationPolicy;
  }

  /**
   * Initialize reviews section and filters
   */
  function initializeReviews(listingId) {
    // Ensure we have the reviews container
    const reviewsContainer = document.querySelector(
      ".bottom__reviews-title-ctn"
    );
    if (!reviewsContainer) return;

    // Add filter controls
    const filterForm = document.createElement("form");
    filterForm.className = "reviews-filter";
    filterForm.innerHTML = `
      <div class="reviews-filter__content">
        <div class="reviews-filter__group">
          <div class="reviews-filter__dates">
            <div class="reviews-filter__field">
              <label for="dateFrom">From</label>
              <input type="date" id="dateFrom" name="from" />
            </div>
            <div class="reviews-filter__field">
              <label for="dateTo">To</label>
              <input type="date" id="dateTo" name="to" />
            </div>
          </div>

          <div class="reviews-filter__field">
            <label for="type">Type</label>
            <select id="type" name="type">
              <option value="">Any</option>
              <option value="guest-to-host">Guest → Host</option>
              <option value="host-to-guest">Host → Guest</option>
            </select>
          </div>

          <div class="reviews-filter__field dropdown-multi" data-name="channels">
            <label>Channels</label>
            <button type="button" class="dropdown-toggle">Select channels <span class="dropdown-badge">0</span></button>
            <div class="dropdown-panel">
              <label><input type="checkbox" value="2018" /> Airbnb Official</label>
              <label><input type="checkbox" value="2002" /> HomeAway</label>
              <label><input type="checkbox" value="2005" /> Booking.com</label>
              <label><input type="checkbox" value="2007" /> Expedia</label>
              <label><input type="checkbox" value="2009" /> HomeAway iCal</label>
              <label><input type="checkbox" value="2010" /> VRBO iCal</label>
              <label><input type="checkbox" value="2000" /> Direct</label>
              <label><input type="checkbox" value="2013" /> Booking Engine</label>
              <label><input type="checkbox" value="2015" /> Custom iCal</label>
              <label><input type="checkbox" value="2016" /> TripAdvisor iCal</label>
              <label><input type="checkbox" value="2017" /> WordPress</label>
              <label><input type="checkbox" value="2019" /> Marriott</label>
              <label><input type="checkbox" value="2020" /> Partner</label>
              <label><input type="checkbox" value="2021" /> GDS</label>
              <label><input type="checkbox" value="2022" /> Google</label>
            </div>
          </div>

          <div class="reviews-filter__field dropdown-multi" data-name="categories">
            <label>Categories</label>
            <button type="button" class="dropdown-toggle">Select categories <span class="dropdown-badge">0</span></button>
            <div class="dropdown-panel">
              <label><input type="checkbox" value="cleanliness" /> Cleanliness</label>
              <label><input type="checkbox" value="communication" /> Communication</label>
              <label><input type="checkbox" value="respect_house_rules" /> Respect House Rules</label>
            </div>
          </div>

          <div class="reviews-filter__field">
            <label for="minRating">Min rating</label>
            <select id="minRating" name="minRating">
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            <small class="reviews-filter__hint">(scale 1–5)</small>
          </div>

          <div class="reviews-filter__field">
            <label for="sortBy">Sort by</label>
            <select id="sortBy" name="sortBy">
              <option value="submittedAt" selected>Date</option>
              <option value="Rating">Rating</option>
            </select>
          </div>

          <div class="reviews-filter__field">
            <label for="sortOrder">Order</label>
            <select id="sortOrder" name="sortOrder">
              <option value="desc" selected>Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>

          <div class="reviews-filter__field reviews-filter__limit">
            <label for="reviewLimit">Show</label>
            <select id="reviewLimit" name="limit">
              <option value="5">5</option>
              <option value="10" selected>10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <div class="reviews-filter__actions">
          <button type="submit" class="reviews-filter__button">Apply Filters</button>
          <div class="reviews-filter__active">Active: <span id="activeFiltersBadge" class="active-badge">0</span></div>
        </div>
      </div>
    `; // Remove any existing placeholder review nodes that were hard-coded in the HTML
    let sibling = reviewsContainer.nextElementSibling;
    while (sibling) {
      const next = sibling.nextElementSibling;
      if (
        sibling.classList &&
        sibling.classList.contains("bottom__review-ctn")
      ) {
        sibling.remove();
      }
      sibling = next;
    }

    // Reviews list container (will hold loading state + reviews)
    const reviewsList = document.createElement("div");
    reviewsList.id = "reviewsList";
    reviewsList.className = "reviews-list";

    // Insert filter form and reviews container after the reviews title container
    reviewsContainer.insertAdjacentElement("afterend", filterForm);
    filterForm.insertAdjacentElement("afterend", reviewsList);

    // Helper to fetch reviews and render into #reviewsList with inline loading state
    async function fetchAndRenderReviews(params) {
      // Show inline loading state using spinner
      reviewsList.innerHTML = `<div class="reviews-loading"><div class="loading-spinner"></div></div>`;

      try {
        const response = await fetch(`${API_BASE_URL}/reviews?${params}`);
        const data = await response.json();

        if (data.name !== "Success") {
          throw new Error(data.message);
        }

        // Only show reviews that include a non-empty publicReview
        const fetched = Array.isArray(data.data && data.data.result)
          ? data.data.result
          : [];
        const filtered = fetched.filter(
          (r) => r && r.publicReview && String(r.publicReview).trim() !== ""
        );

        renderReviews(filtered);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        reviewsList.innerHTML = `<div class="reviews-error">Failed to load reviews</div>`;
        showError(error.message || "Failed to load reviews");
      }
    }

    // Setup dropdown-multi behaviour and active filters badge
    function setupDropdownsAndBadge() {
      const dropdowns = filterForm.querySelectorAll(".dropdown-multi");
      dropdowns.forEach((dd) => {
        const toggle = dd.querySelector(".dropdown-toggle");
        const panel = dd.querySelector(".dropdown-panel");
        const badge = dd.querySelector(".dropdown-badge");

        toggle.addEventListener("click", (ev) => {
          ev.stopPropagation();
          panel.classList.toggle("open");
        });

        panel.addEventListener("change", () => {
          const checked = panel.querySelectorAll(
            'input[type="checkbox"]:checked'
          ).length;
          badge.textContent = String(checked);
          updateActiveBadge();
        });
      });

      // close panels when clicking outside
      document.addEventListener("click", (e) => {
        dropdowns.forEach((dd) => {
          if (!dd.contains(e.target)) {
            const panel = dd.querySelector(".dropdown-panel");
            panel.classList.remove("open");
          }
        });
      });

      // active filters badge
      function updateActiveBadge() {
        const badge = filterForm.querySelector("#activeFiltersBadge");
        if (!badge) return;
        const formData = new FormData(filterForm);
        let count = 0;
        for (const [k, v] of formData.entries()) {
          if (!v) continue;
          if (["limit", "sortBy", "sortOrder"].includes(k)) continue;
          count++;
        }
        // count dropdown groups if any selected
        dropdowns.forEach((dd) => {
          const checked = dd.querySelectorAll(
            'input[type="checkbox"]:checked'
          ).length;
          if (checked) count += 1;
        });
        badge.textContent = String(count);
      }

      // wire form inputs to update badge
      filterForm.addEventListener("input", updateActiveBadge);
      // initial badge
      updateActiveBadge();
    }

    setupDropdownsAndBadge();

    // Handle filter submissions
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      // Build query parameters
      const params = new URLSearchParams();
      params.append("listingId", listingId);

      // Simple fields
      const from = formData.get("from");
      const to = formData.get("to");
      const type = formData.get("type");
      const sortBy = formData.get("sortBy");
      const sortOrder = formData.get("sortOrder");
      const limit = formData.get("limit");
      const minRating = formData.get("minRating");

      if (from) params.append("from", from);
      if (to) params.append("to", to);
      if (type) params.append("type", type);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);
      if (limit) params.append("limit", limit);

      // Convert minRating 1-5 => 1-10 scale
      if (minRating) {
        const n = Number(minRating);
        if (!Number.isNaN(n)) params.append("minRating", String(n * 2));
      }

      // Multi-select from dropdown panels
      const channelsPanel = filterForm.querySelector(
        '.dropdown-multi[data-name="channels"] .dropdown-panel'
      );
      if (channelsPanel) {
        const checked = Array.from(
          channelsPanel.querySelectorAll('input[type="checkbox"]:checked')
        ).map((i) => parseInt(i.value, 10)); // Convert to numbers

        if (checked.length > 0) {
          // Send as a single comma-separated list
          params.append("channels", checked.join(","));
        }
      }

      const categoriesPanel = filterForm.querySelector(
        '.dropdown-multi[data-name="categories"] .dropdown-panel'
      );
      if (categoriesPanel) {
        const checked = Array.from(
          categoriesPanel.querySelectorAll('input[type="checkbox"]:checked')
        ).map((i) => i.value);
        checked.forEach((v) => params.append("categories", v));
      }

      fetchAndRenderReviews(params);
    });

    // Initial reviews load with default params
    const defaultParams = new URLSearchParams();
    defaultParams.append("listingId", listingId);
    defaultParams.append("limit", "10");
    fetchAndRenderReviews(defaultParams);
  }

  /**
   * Render reviews
   */
  function renderReviews(reviews) {
    const reviewsList = document.getElementById("reviewsList");
    if (!reviewsList) return;

    // Render reviews into the container
    if (!Array.isArray(reviews) || reviews.length === 0) {
      reviewsList.innerHTML = `<div class="reviews-empty">No reviews found</div>`;
      return;
    }

    reviewsList.innerHTML = reviews
      .map((review) => {
        const date = new Date(review.submittedAt);
        const rating = getStarRating(review.rating);
        const author = review.guestName || review.guest || "Guest";
        const text = review.publicReview || review.message || "";

        return `
        <div class="bottom__review-ctn">
          <div class="bottom__review-title-ctn">
            <span class="bottom__rating-count">${rating}</span>
            <span class="bottom__ratings-dot">·</span>
            <span class="bottom__review-title-name">${author}</span>
            <span class="bottom__review-title-date">
              <span class="bottom__review-title-month">${date.toLocaleString(
                "default",
                { month: "long" }
              )}</span>
              <span class="bottom__review-title-year">${date.getFullYear()}</span>
            </span>
          </div>
          <div class="bottom-review">${text}</div>
        </div>
      `;
      })
      .join("");
  }

  /**
   * Initialize the page
   */
  async function initialize() {
    // Get listing ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get("id");

    if (!listingId) {
      showError("No listing ID provided");
      return;
    }

    try {
      toggleLoading(true);

      // Fetch listing details
      const response = await fetch(`${API_BASE_URL}/listings/${listingId}`);
      const data = await response.json();

      if (data.name !== "Success") {
        throw new Error(data.message);
      }

      const listing = data.data.result;

      // Update page
      document.title = `${listing.name} — Customer`;
      renderImages(listing.listingImages);
      initializePhotoGallery(listing);
      renderListingDetails(listing);
      initializeReviews(listingId);
    } catch (error) {
      console.error("Error loading listing:", error);
      showError(error.message || "Failed to load listing");
    } finally {
      toggleLoading(false);
    }
  }

  // Initialize when DOM is loaded
  document.addEventListener("DOMContentLoaded", initialize);
})();
