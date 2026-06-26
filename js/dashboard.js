function renderDashboard(){
    const favorites = TripNest.getSavedFavorites();
    const favoriteDestinations = TripNest.destinations.filter((item) => favorites.includes(item.id));
    const lastBudget = JSON.parse(localStorage.getItem("tripnest:lastBudget") || "null");
    const lastTrip = JSON.parse(localStorage.getItem("tripnest:lastTrip") || "null");
    const user = JSON.parse(localStorage.getItem("tripnest:user") || "null");

    if (user?.name){
        document.querySelector("#dashboardName").textContent = user.name;
        document.querySelector("#dashboardInitials").textContent = user.name.split(" ").map((part) => part[0]).join("").slice(0,2).toUpperCase();
    }

    const stats = [
        ["Saved trips", lastTrip ? 1 : 0, "fa-route"],
        ["Upcoming trips", 3, "fa-calendar-check"],
        ["Favorites", favorites.length, "fa-heart"],
        ["Budget total", lastBudget ? TripNest.formatMoney(lastBudget.total) : "Rs. 0", "fa-wallet"]
    ];

    document.querySelector("#statsGrid").innerHTML = stats.map(([label,value,icon]) => `
        <article class="dashboard-card">
            <span class="icon-chip"><i class="fa-solid ${icon}"></i></span>
            <h3>${value}</h3>
            <p class="muted">${label}</p>
        </article>
    `).join("");

    // Enhanced upcoming trips with more details
    const upcomingTripsData = [
        { name:"Goa beach recharge", date:"Jul 12 - Jul 16", status:"Confirmed", color:"var(--accent)" },
        { name:"Tokyo culture sprint", date:"Sep 3 - Sep 10", status:"Planned", color:"var(--brand)" },
        { name:"Swiss Alps escape", date:"Dec 18 - Dec 24", status:"Wishlist", color:"var(--sun)" }
    ];
    
    document.querySelector("#upcomingTrips").innerHTML = upcomingTripsData.map(({name,date,status,color}) => `
        <li>
            <span>
                <strong>${name}</strong>
                <p class="muted" style="font-size:12px; margin-top:4px;">${date}</p>
            </span>
            <span style="background:${color}; color:#ffffff; padding:6px 12px; border-radius:999px; font-size:12px; font-weight:700;">${status}</span>
        </li>
    `).join("");

    document.querySelector("#favoriteDestinations").innerHTML = favoriteDestinations.length
        ? favoriteDestinations.map((item) => TripNest.destinationCard(item, { details:false })).join("")
        : `<div class="empty-state" style="grid-column:1/-1;">No favorites yet. <a href="../destinations.html" style="color:var(--brand); font-weight:700;">Explore destinations</a> and save your favorites.</div>`;

    const budgetItems = lastBudget?.values || [
        { label:"Flights", value:30000 },
        { label:"Hotel", value:25000 },
        { label:"Food", value:12000 }
    ];
    document.querySelector("#budgetHistory").innerHTML = budgetItems.map((item) => `
        <li>
            <span><strong>${item.label}</strong></span>
            <strong style="color:var(--brand-dark);">${TripNest.formatMoney(item.value)}</strong>
        </li>
    `).join("");
}

document.addEventListener("DOMContentLoaded", renderDashboard);
