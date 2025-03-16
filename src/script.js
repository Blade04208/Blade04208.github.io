window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
      header.classList.add("scrolled"); // Add class when scrolled
    } else {
      header.classList.remove("scrolled"); // Remove class when at top
    }
  });
  