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

    document.querySelector("#upcomingTrips").innerHTML = [
        ["Goa recharge","Jul 12 - Jul 16"],
        ["Tokyo culture sprint","Sep 3 - Sep 10"],
        ["Swiss Alps escape","Dec 18 - Dec 24"]
    ].map(([name,date]) => `<li><span>${name}</span><strong>${date}</strong></li>`).join("");

    document.querySelector("#favoriteDestinations").innerHTML = favoriteDestinations.length
        ? favoriteDestinations.map((item) => TripNest.destinationCard(item, { details:false })).join("")
        : `<div class="empty-state">No favorites yet. Save destinations from the explorer.</div>`;

    const budgetItems = lastBudget?.values || [
        { label:"Flights", value:30000 },
        { label:"Hotel", value:25000 },
        { label:"Food", value:12000 }
    ];
    document.querySelector("#budgetHistory").innerHTML = budgetItems.map((item) => `<li><span>${item.label}</span><strong>${TripNest.formatMoney(item.value)}</strong></li>`).join("");
}

document.addEventListener("DOMContentLoaded", renderDashboard);
