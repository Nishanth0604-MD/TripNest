const TripNest = window.TripNest || {};

TripNest.destinations = [
    {
        id:"bali",
        name:"Bali",
        country:"Indonesia",
        category:"Beach",
        price:45000,
        rating:4.9,
        image:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
        description:"Temple routes, beach clubs, rice terraces, wellness cafes, and warm island stays.",
        lat:-8.3405,
        lng:115.092,
        tags:["Beach","Wellness","Island"],
        attractions:["Uluwatu Temple","Ubud Rice Terraces","Seminyak Beach"]
    },
    {
        id:"paris",
        name:"Paris",
        country:"France",
        category:"Culture",
        price:95000,
        rating:4.8,
        image:"https://images.unsplash.com/photo-1499856871958-5b9627545d1?auto=format&fit=crop&w=900&q=80",
        description:"Museums, cafes, design hotels, river walks, and landmark-rich neighborhoods.",
        lat:48.8566,
        lng:2.3522,
        tags:["Culture","Food","Romance"],
        attractions:["Louvre Museum","Eiffel Tower","Le Marais"]
    },
    {
        id:"tokyo",
        name:"Tokyo",
        country:"Japan",
        category:"City",
        price:80000,
        rating:4.9,
        image:"https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=900&q=80",
        description:"Neon districts, temples, ramen lanes, gardens, shopping streets, and day trips.",
        lat:35.6762,
        lng:139.6503,
        tags:["City","Food","Culture"],
        attractions:["Shibuya Crossing","Senso-ji","Shinjuku Gyoen"]
    },
    {
        id:"dubai",
        name:"Dubai",
        country:"UAE",
        category:"Luxury",
        price:55000,
        rating:4.7,
        image:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
        description:"Skyline hotels, desert safaris, premium shopping, beaches, and family attractions.",
        lat:25.2048,
        lng:55.2708,
        tags:["Luxury","Family","Desert"],
        attractions:["Burj Khalifa","Dubai Marina","Desert Safari"]
    },
    {
        id:"swiss-alps",
        name:"Swiss Alps",
        country:"Switzerland",
        category:"Adventure",
        price:120000,
        rating:4.9,
        image:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
        description:"Mountain trains, lakes, chalet stays, hiking trails, and cinematic viewpoints.",
        lat:46.8182,
        lng:8.2275,
        tags:["Adventure","Nature","Luxury"],
        attractions:["Jungfrau Region","Zermatt","Lake Lucerne"]
    },
    {
        id:"goa",
        name:"Goa",
        country:"India",
        category:"Beach",
        price:35000,
        rating:4.6,
        image:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
        description:"Beach shacks, Portuguese quarters, markets, nightlife, and relaxed coastal stays.",
        lat:15.2993,
        lng:74.124,
        tags:["Beach","Budget","Food"],
        attractions:["Fontainhas","Baga Beach","Dudhsagar Falls"]
    }
];

TripNest.formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

TripNest.getSavedFavorites = () => JSON.parse(localStorage.getItem("tripnest:favorites") || "[]");

TripNest.setSavedFavorites = (favorites) => {
    localStorage.setItem("tripnest:favorites", JSON.stringify(favorites));
};

TripNest.destinationCard = (destination, options = {}) => {
    const favorites = TripNest.getSavedFavorites();
    const isFavorite = favorites.includes(destination.id);
    const detailsButton = options.details === false ? "" : `<button class="btn-soft details-btn" data-id="${destination.id}" type="button">Details</button>`;

    return `
        <article class="destination-card" data-id="${destination.id}" data-animate>
            <div class="destination-image">
                <img src="${destination.image}" alt="${destination.name}, ${destination.country}" loading="lazy">
                <div class="badge-row">
                    <span class="pill"><i class="fa-solid fa-star"></i>${destination.rating}</span>
                    <button class="favorite-btn ${isFavorite ? "active" : ""}" data-favorite="${destination.id}" type="button" aria-label="Save ${destination.name}">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="card-content">
                <h3>${destination.name}, ${destination.country}</h3>
                <p>${destination.description}</p>
                <div class="card-meta">
                    <span class="price">From ${TripNest.formatMoney(destination.price)}</span>
                    ${detailsButton}
                </div>
            </div>
        </article>
    `;
};

TripNest.initNavigation = () => {
    const navbar = document.querySelector(".navbar");
    const toggle = document.querySelector(".menu-toggle");
    const current = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".navbar ul a").forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (href.endsWith(current)){
            link.classList.add("active");
        }
    });

    toggle?.addEventListener("click", () => {
        navbar?.classList.toggle("nav-open");
    });
};

TripNest.initHome = () => {
    const homeGrid = document.querySelector("#homeDestinations");
    if (homeGrid){
        homeGrid.innerHTML = TripNest.destinations.slice(0,3).map((destination) => TripNest.destinationCard(destination, { details:false })).join("");
    }

    document.querySelector("#heroSearchBtn")?.addEventListener("click", TripNest.runHeroSearch);
    document.querySelector("#heroDestination")?.addEventListener("keydown", (event) => {
        if (event.key === "Enter"){
            TripNest.runHeroSearch();
        }
    });

    document.querySelector("#newsletterForm")?.addEventListener("submit", (event) => {
        event.preventDefault();
        event.target.reset();
        document.querySelector("#newsletterMessage").textContent = "Subscribed. Your next travel idea is already warming up.";
    });
};

TripNest.runHeroSearch = () => {
    const destination = document.querySelector("#heroDestination")?.value.trim() || "";
    const style = document.querySelector("#heroStyle")?.value || "";
    const params = new URLSearchParams();

    if (destination){
        params.set("search", destination);
    }

    if (style){
        params.set("category", style);
    }

    window.location.href = `destinations.html${params.toString() ? `?${params}` : ""}`;
};

TripNest.initBudget = () => {
    const form = document.querySelector("#budgetForm");
    if (!form){
        return;
    }

    const fields = ["flights","hotel","food","transport","activities","shopping","emergency"];
    const labels = {
        flights:"Flights",
        hotel:"Hotel",
        food:"Food",
        transport:"Local transport",
        activities:"Activities",
        shopping:"Shopping",
        emergency:"Emergency fund"
    };

    const renderBudget = () => {
        const values = fields.map((id) => ({
            id,
            label:labels[id],
            value:Number(document.querySelector(`#${id}`).value || 0)
        }));
        const total = values.reduce((sum, item) => sum + item.value, 0);
        const chart = values.map((item) => {
            const percent = total ? Math.round((item.value / total) * 100) : 0;
            return `<div class="budget-row"><span>${item.label}</span><strong>${TripNest.formatMoney(item.value)}</strong><div><i style="width:${percent}%"></i></div><small>${percent}%</small></div>`;
        }).join("");

        document.querySelector("#budgetResult").innerHTML = `
            <h2>Total estimate</h2>
            <p class="total-cost">${TripNest.formatMoney(total)}</p>
            <p class="muted">Recommended trip buffer: ${TripNest.formatMoney(Math.round(total * .1))}</p>
            <div class="budget-chart">${chart}</div>
        `;

        localStorage.setItem("tripnest:lastBudget", JSON.stringify({ total, values }));
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        renderBudget();
    });

    form.querySelectorAll("input").forEach((input) => input.addEventListener("input", renderBudget));
    renderBudget();
};

TripNest.initContact = () => {
    document.querySelector("#contactForm")?.addEventListener("submit", (event) => {
        event.preventDefault();
        event.target.reset();
        document.querySelector("#contactMessage").textContent = "Message received. TripNest will respond soon.";
    });
};

TripNest.initProfile = () => {
    document.querySelector("#profileForm")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const profile = {
            name:document.querySelector("#profileName").value,
            email:document.querySelector("#profileEmail").value,
            airport:document.querySelector("#profileAirport").value,
            style:document.querySelector("#profileStyle").value
        };
        localStorage.setItem("tripnest:user", JSON.stringify(profile));
        document.querySelector("#profileMessage").textContent = "Profile saved locally. Ready for database sync later.";
    });
};

document.addEventListener("DOMContentLoaded", () => {
    TripNest.initNavigation();
    TripNest.initHome();
    TripNest.initBudget();
    TripNest.initContact();
    TripNest.initProfile();
});

window.TripNest = TripNest;
