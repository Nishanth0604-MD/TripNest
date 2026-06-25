document.addEventListener("DOMContentLoaded", () => {
    const animatedItems = document.querySelectorAll("[data-animate]");

    if (!("IntersectionObserver" in window)){
        animatedItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting){
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold:.14 });

    animatedItems.forEach((item) => observer.observe(item));
});
