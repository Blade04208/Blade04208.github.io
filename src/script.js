function showSection(id) {
    // Hide all sections
    document.querySelectorAll("#content section").forEach((section) => {
        section.classList.remove("active");
    });

    // Show selected section
    const target = document.getElementById(id);
    if (target) {
        target.classList.add("active");
    }

    // Slide profile section away
    const profile = document.querySelector(".profile-section");
    profile.classList.add("slide-left");
}


