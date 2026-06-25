function showAuthMessage(message){
    const target = document.querySelector("#authMessage") || document.querySelector("#profileMessage");
    if (target){
        target.textContent = message;
    }
}

document.querySelector("#loginForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.querySelector("#loginEmail").value;
    localStorage.setItem("tripnest:user", JSON.stringify({ name:"TripNest User", email }));
    showAuthMessage("Logged in locally. Redirecting to dashboard...");
    window.setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 700);
});

document.querySelector("#signupForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const user = {
        name:document.querySelector("#signupName").value,
        email:document.querySelector("#signupEmail").value
    };
    localStorage.setItem("tripnest:user", JSON.stringify(user));
    showAuthMessage("Account created locally. Firebase or Supabase can replace this store.");
});

document.querySelector("#forgotForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    event.target.reset();
    showAuthMessage("Password reset link simulated. Connect your auth provider to send real email.");
});
