const destinationGrid = document.querySelector("#destinationGrid");
const filters = document.querySelector("#destinationFilters");
const modal = document.querySelector("#destinationModal");
const modalContent = document.querySelector("#modalContent");
let destinationMap;
let mapMarkers = [];

function populateFilters(){
    const categories = [...new Set(TripNest.destinations.flatMap((item) => item.tags.concat(item.category)))].sort();
    const countries = [...new Set(TripNest.destinations.map((item) => item.country))].sort();
    const categoryFilter = document.querySelector("#categoryFilter");
    const countryFilter = document.querySelector("#countryFilter");

    if (categoryFilter){
        categoryFilter.innerHTML += categories.map((category) => `<option value="${category}">${category}</option>`).join("");
    }

    if (countryFilter){
        countryFilter.innerHTML += countries.map((country) => `<option value="${country}">${country}</option>`).join("");
    }
}

function matchesFilters(destination){
    const search = document.querySelector("#destinationSearch")?.value.toLowerCase() || "";
    const category = document.querySelector("#categoryFilter")?.value || "";
    const country = document.querySelector("#countryFilter")?.value || "";
    const maxPrice = Number(document.querySelector("#priceFilter")?.value || 0);
    const haystack = `${destination.name} ${destination.country} ${destination.category} ${destination.tags.join(" ")} ${destination.description}`.toLowerCase();

    return (!search || haystack.includes(search)) &&
        (!category || destination.category === category || destination.tags.includes(category)) &&
        (!country || destination.country === country) &&
        (!maxPrice || destination.price <= maxPrice);
}

function renderDestinations(){
    if (!destinationGrid){
        return;
    }

    const results = TripNest.destinations.filter(matchesFilters);
    destinationGrid.innerHTML = results.length ? results.map((item) => TripNest.destinationCard(item)).join("") : `<div class="empty-state">No destinations match those filters yet.</div>`;
    document.querySelector("#resultCount").textContent = results.length;
    updateWishlistCount();
}

function updateWishlistCount(){
    const count = TripNest.getSavedFavorites().length;
    const target = document.querySelector("#wishlistCount");
    if (target){
        target.textContent = count;
    }
}

function toggleFavorite(id){
    const favorites = TripNest.getSavedFavorites();
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : favorites.concat(id);
    TripNest.setSavedFavorites(next);
    renderDestinations();
}

function openDestinationModal(id){
    const destination = TripNest.destinations.find((item) => item.id === id);
    if (!destination || !modalContent || !modal){
        return;
    }

    modalContent.innerHTML = `
        <div class="modal-image"><img src="${destination.image}" alt="${destination.name}, ${destination.country}"></div>
        <div class="modal-body">
            <span class="eyebrow">${destination.category} escape</span>
            <h2 id="modalTitle">${destination.name}, ${destination.country}</h2>
            <p class="muted">${destination.description}</p>
            <div class="modal-grid">
                <div><strong>Rating</strong><p>${destination.rating} / 5</p></div>
                <div><strong>Starting price</strong><p>${TripNest.formatMoney(destination.price)}</p></div>
                <div><strong>Best for</strong><p>${destination.tags.join(", ")}</p></div>
                <div><strong>Coordinates</strong><p>${destination.lat}, ${destination.lng}</p></div>
            </div>
            <h3>Nearby highlights</h3>
            <ul class="itinerary-list">${destination.attractions.map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
    `;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
}

function closeDestinationModal(){
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden","true");
}

function initDestinationMap(){
    const mapEl = document.querySelector("#destinationMap") || document.querySelector("#plannerMap");
    if (!mapEl || typeof L === "undefined"){
        return;
    }

    const start = TripNest.destinations[0];
    destinationMap = L.map(mapEl).setView([start.lat,start.lng], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom:19,
        attribution:"&copy; OpenStreetMap"
    }).addTo(destinationMap);
    renderMapMarkers("attraction");
}

function renderMapMarkers(category){
    if (!destinationMap || typeof L === "undefined"){
        return;
    }

    mapMarkers.forEach((marker) => marker.remove());
    mapMarkers = TripNest.destinations.slice(0,4).map((destination, index) => {
        const offset = category === "hotel" ? .035 : category === "restaurant" ? -.035 : 0;
        const marker = L.marker([destination.lat + offset,destination.lng + (index * .015)])
            .addTo(destinationMap)
            .bindPopup(`<strong>${destination.name}</strong><br>${category}: ${destination.attractions[0]}<br><a target="_blank" rel="noreferrer" href="https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}">Directions</a>`);
        return marker;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (!destinationGrid && !document.querySelector("#plannerMap")){
        return;
    }

    populateFilters();

    const params = new URLSearchParams(window.location.search);
    if (params.get("search")){
        document.querySelector("#destinationSearch").value = params.get("search");
    }
    if (params.get("category") && document.querySelector("#categoryFilter")){
        document.querySelector("#categoryFilter").value = params.get("category");
    }

    renderDestinations();
    initDestinationMap();

    filters?.addEventListener("input", renderDestinations);
    filters?.addEventListener("change", renderDestinations);

    document.addEventListener("click", (event) => {
        const favorite = event.target.closest("[data-favorite]");
        const details = event.target.closest(".details-btn");
        const mapCategory = event.target.closest("[data-map-category]");

        if (favorite){
            toggleFavorite(favorite.dataset.favorite);
        }

        if (details){
            openDestinationModal(details.dataset.id);
        }

        if (mapCategory){
            document.querySelectorAll("[data-map-category]").forEach((button) => button.classList.remove("active"));
            mapCategory.classList.add("active");
            renderMapMarkers(mapCategory.dataset.mapCategory);
        }
    });

    document.querySelector(".modal-close")?.addEventListener("click", closeDestinationModal);
    modal?.addEventListener("click", (event) => {
        if (event.target === modal){
            closeDestinationModal();
        }
    });
});
