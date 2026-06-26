const tripForm = document.querySelector("#tripForm");
let currentPrompt = "";

const itineraryIdeas = {
    Luxury:["Private transfer and 5-star landmark check-in","Michelin-rated fine dining and spa wellness","Boutique designer shopping with rooftop cocktails","Scenic private tour with premium local guide"],
    Budget:["Free walking tour and vibrant local market","Public metro route with street food adventures","Museum pass and scenic sunset viewpoint","Affordable neighborhood cafe crawl and bookstores"],
    Family:["Easy landmark visit with kid-friendly breaks","Interactive hands-on museum and early dinner","Low-stress day trip with snack stops throughout","Photo-friendly activity and relaxed evening play"],
    Adventure:["Thrilling outdoor activity and hidden viewpoint","Mountain trail or bike route with local lunch","Water sport, rock climbing, or extreme session","Night market exploration and live local music scene"],
    Solo:["Solo cafe planning session and city walk","Museum, independent bookstore, and food lane","Small-group experience and peaceful sunset spot","Flexible day trip with journaling and reflection time"]
};

const mealIdeas = {
    Luxury:["Fine dining with seasonal tasting menu","Michelin-starred restaurant reservation","Private chef experience","Rooftop restaurant with city views"],
    Budget:["Street food market exploration","Local family-run restaurant","Food court with regional specialties","Market-to-table casual dining"],
    Family:["Pizza or noodles at family-friendly spot","Theme park or casual restaurant","Kids menu with healthy options","Rooftop or riverside casual eatery"],
    Adventure:["Adventure guide cafe or mountain lodge","Local hikers' favorite spot","Authentic regional cuisine","Beachside or nature-themed restaurant"],
    Solo:["Cozy cafe with work-friendly vibes","Solo traveler-friendly group dining","Cooking class or food tour","Street food discovery walk"]
};

const eveningActivities = {
    Luxury:["Theater or opera performance","Wine tasting at historic venue","Evening yacht or sunset cruise","Upscale nightclub or lounge"],
    Budget:["Live music at local venue","Night market exploration","Walking tour of lit-up neighborhoods","Local pub or casual bar"],
    Family:["Night market and light show","Family-friendly cultural performance","Sunset picnic and stargazing","Recreational sports or family games"],
    Adventure:["Night hiking or stargazing adventure","Live music at adventure bar","Bonfire on beach or in nature","Nighttime water sports or activity"],
    Solo:["Live music or comedy show","Solo-friendly bar or cafe","Night photography walk","Reflective sunset or evening journaling"]
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
    const meals = mealIdeas[data.style] || mealIdeas.Adventure;
    const evenings = eveningActivities[data.style] || eveningActivities.Adventure;
    const dailyBudget = Math.round(data.budget / data.days);
    
    const items = Array.from({ length:data.days }, (_, index) => {
        const dayNum = index + 1;
        const idea = ideas[index % ideas.length];
        const meal = meals[index % meals.length];
        const evening = evenings[index % evenings.length];
        const morningTime = `${7 + (index % 3)}:00 AM`;
        const morningActivity = idea.split(" and ")[0];
        const afternoonActivity = idea.split(" and ")[1] || "Explore and relax";
        
        return `
            <li>
                <strong>Day ${dayNum}: ${idea}</strong>
                <div style="margin-top:10px; padding-top:10px; border-top:1px solid #dbe7f3;">
                    <p><strong>Morning (${morningTime}):</strong> ${morningActivity} in ${data.destination}. Start your day with coffee or tea at a local spot.</p>
                    <p><strong>Lunch:</strong> ${meal}</p>
                    <p><strong>Afternoon:</strong> ${afternoonActivity}. Take time to explore, photograph, and experience the local culture.</p>
                    <p><strong>Evening:</strong> ${evening}</p>
                    <p><strong>Daily budget estimate:</strong> ${TripNest.formatMoney(dailyBudget)}</p>
                </div>
            </li>
        `;
    }).join("");

    document.querySelector("#planResult").innerHTML = `
        <h2>${data.days}-day ${data.destination} itinerary</h2>
        <p class="muted">${data.travelers} traveler(s) • ${data.style} style • ${TripNest.formatMoney(data.budget)} budget</p>
        <p style="margin-top:8px; color:#0ea5e9; font-size:14px;"><strong>💡 Tip:</strong> This is a suggested itinerary. Adjust timing, meals, and activities based on your preferences and local availability.</p>
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
