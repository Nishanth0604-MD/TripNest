function showAuthMessage(message, isError = false){
    const target = document.querySelector("#authMessage") || document.querySelector("#profileMessage");
    if (target){
        target.textContent = message;
        target.style.color = isError ? "#ef4444" : "#14b8a6";
    }
}

function validateEmail(email){
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

document.querySelector("#loginForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = document.querySelector("#loginEmail");
    const passwordInput = document.querySelector("#loginPassword");
    const button = event.target.querySelector("button");
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validation
    if (!email || !password){
        showAuthMessage("Please enter both email and password.", true);
        return;
    }
    
    if (!validateEmail(email)){
        showAuthMessage("Please enter a valid email address.", true);
        return;
    }
    
    if (password.length < 6){
        showAuthMessage("Password must be at least 6 characters.", true);
        return;
    }
    
    // Show loading
    button.disabled = true;
    button.textContent = "Logging in...";
    
    setTimeout(() => {
        localStorage.setItem("tripnest:user", JSON.stringify({ name:"TripNest User", email }));
        showAuthMessage("✓ Logged in successfully. Redirecting...");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);
    }, 600);
});

document.querySelector("#signupForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = document.querySelector("#signupName");
    const emailInput = document.querySelector("#signupEmail");
    const passwordInput = document.querySelector("#signupPassword");
    const button = event.target.querySelector("button");
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validation
    if (!name || !email || !password){
        showAuthMessage("Please fill in all fields.", true);
        return;
    }
    
    if (name.length < 2){
        showAuthMessage("Name must be at least 2 characters.", true);
        return;
    }
    
    if (!validateEmail(email)){
        showAuthMessage("Please enter a valid email address.", true);
        return;
    }
    
    if (password.length < 6){
        showAuthMessage("Password must be at least 6 characters.", true);
        return;
    }
    
    // Show loading
    button.disabled = true;
    button.textContent = "Creating account...";
    
    setTimeout(() => {
        const user = { name, email };
        localStorage.setItem("tripnest:user", JSON.stringify(user));
        button.disabled = false;
        button.textContent = "Create account";
        showAuthMessage("✓ Account created! Ready for database integration.");
        event.target.reset();
    }, 600);
});

document.querySelector("#forgotForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = document.querySelector("#resetEmail");
    const button = event.target.querySelector("button");
    const email = emailInput.value.trim();
    
    // Validation
    if (!email){
        showAuthMessage("Please enter your email address.", true);
        return;
    }
    
    if (!validateEmail(email)){
        showAuthMessage("Please enter a valid email address.", true);
        return;
    }
    
    // Show loading
    button.disabled = true;
    button.textContent = "Sending reset link...";
    
    setTimeout(() => {
        button.disabled = false;
        button.textContent = "Send reset link";
        showAuthMessage("✓ Reset link sent to your email. (Mock: Connect to real email service)");
        event.target.reset();
        
        setTimeout(() => {
            showAuthMessage("");
        }, 5000);
    }, 800);
});
