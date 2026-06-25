const tripForm = document.querySelector("#tripForm");
let currentPrompt = "";

const itineraryIdeas = {
    Luxury:["Private transfer and landmark check-in","Fine dining reservation and spa time","Boutique shopping with rooftop drinks","Scenic day trip with premium guide"],
    Budget:["Free walking tour and local market","Public transport route with street food stops","Museum pass and sunset viewpoint","Affordable neighborhood cafe crawl"],
    Family:["Easy landmark visit and park break","Interactive museum and early dinner","Low-stress day trip with snack stops","Photo-friendly activity and relaxed evening"],
    Adventure:["Outdoor activity and hidden viewpoint","Trail or bike route with local lunch","Water sport or climbing session","Night market and live local scene"],
    Solo:["Cafe planning session and city walk","Museum, bookstore, and food lane","Small-group experience and sunset spot","Flexible day trip with journaling time"]
};

function dayCount(startDate, endDate){
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / 86400000) + 1;
    return Number.isFinite(diff) && diff > 0 ? diff : 1;
}

function buildPrompt(data){
    const focus = document.querySelector("#promptFocus")?.value || "balanced";
    return `Create a ${data.days}-day ${data.style} itinerary for ${data.travelers} traveler(s) in ${data.destination}. Budget: ${TripNest.formatMoney(data.budget)}. Focus: ${focus}. Include morning, afternoon, evening plans, weather-aware suggestions, food ideas, map-friendly neighborhoods, and cost notes.`;
}

function renderPlan(data){
    const ideas = itineraryIdeas[data.style] || itineraryIdeas.Adventure;
    const dailyBudget = Math.round(data.budget / data.days);
    const items = Array.from({ length:data.days }, (_, index) => {
        const idea = ideas[index % ideas.length];
        return `
            <li>
                <strong>Day ${index + 1}: ${idea}</strong><br>
                Morning: explore a signature area in ${data.destination}. Afternoon: add one bookable experience. Evening: choose food and a viewpoint that fits ${data.style.toLowerCase()} travel.<br>
                Estimated daily spend: ${TripNest.formatMoney(dailyBudget)}
            </li>
        `;
    }).join("");

    document.querySelector("#planResult").innerHTML = `
        <h2>${data.days}-day ${data.destination} itinerary</h2>
        <p class="muted">${data.travelers} traveler(s), ${data.style} style, ${TripNest.formatMoney(data.budget)} budget.</p>
        <ul class="itinerary-list">${items}</ul>
    `;
}

function initPlannerMap(){
    const mapEl = document.querySelector("#plannerMap");
    if (!mapEl || typeof L === "undefined"){
        return;
    }

    const destination = TripNest.destinations[2];
    const map = L.map(mapEl).setView([destination.lat,destination.lng], 12);
    let markers = [];
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom:19,
        attribution:"&copy; OpenStreetMap"
    }).addTo(map);

    const markerSets = {
        attraction:destination.attractions,
        hotel:["Boutique stay district","Station hotel cluster","Waterfront hotel zone"],
        restaurant:["Ramen lane","Market food court","Chef-led dinner block"]
    };

    const renderMarkers = (category) => {
        markers.forEach((marker) => marker.remove());
        markers = markerSets[category].map((item, index) => {
            const latOffset = category === "hotel" ? .014 : category === "restaurant" ? -.014 : 0;
            return L.marker([destination.lat + latOffset + (index * .012), destination.lng + (index * .014)])
                .addTo(map)
                .bindPopup(`<strong>${item}</strong><br>${category}<br><a target="_blank" rel="noreferrer" href="https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}">Directions</a>`);
        });
    };

    renderMarkers("attraction");

    document.querySelectorAll("[data-map-category]").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll("[data-map-category]").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            renderMarkers(button.dataset.mapCategory);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initPlannerMap();

    tripForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = {
            destination:document.querySelector("#destination").value.trim(),
            startDate:document.querySelector("#startDate").value,
            endDate:document.querySelector("#endDate").value,
            travelers:Number(document.querySelector("#travelers").value || 1),
            budget:Number(document.querySelector("#budget").value || 0),
            style:document.querySelector("#style").value
        };
        data.days = dayCount(data.startDate, data.endDate);
        currentPrompt = buildPrompt(data);

        renderPlan(data);
        document.querySelector("#promptPreview").textContent = currentPrompt;
        document.querySelector("#weatherCity").value = data.destination;
        localStorage.setItem("tripnest:lastTrip", JSON.stringify(data));
    });

    document.querySelector("#promptFocus")?.addEventListener("change", () => {
        const lastTrip = JSON.parse(localStorage.getItem("tripnest:lastTrip") || "null");
        if (lastTrip){
            currentPrompt = buildPrompt(lastTrip);
            document.querySelector("#promptPreview").textContent = currentPrompt;
        }
    });

    document.querySelector("#aiPreviewBtn")?.addEventListener("click", () => {
        const response = document.querySelector("#aiResponse");
        response.innerHTML = `<span class="loading-dots"><span></span><span></span><span></span></span> Building AI-style itinerary...`;
        window.setTimeout(() => {
            response.innerHTML = `<strong>Placeholder AI response:</strong> ${currentPrompt || "Generate a personalized itinerary after entering trip details."} This section is ready to call an AI API endpoint and replace this simulated response.`;
        }, 900);
    });
});
