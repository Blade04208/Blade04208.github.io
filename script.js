const body = document.body;
const topNav = document.querySelector(".top-nav");
const menuToggle = topNav.querySelector(".menu-toggle");
const menuClose = topNav.querySelector(".menu-close");
const menuWrapper = topNav.querySelector(".menu-wrapper");
const topBannerOverlay = document.querySelector(".top-banner-overlay");
const isOpenedClass = "is-opened";
const isMovedClass = "is-moved";
const noTransitionClass = "no-transition";
let resize;

menuToggle.addEventListener("click", () => {
  menuWrapper.classList.toggle(isOpenedClass);
  topBannerOverlay.classList.toggle(isMovedClass);
});

menuClose.addEventListener("click", () => {
  menuWrapper.classList.remove(isOpenedClass);
  topBannerOverlay.classList.remove(isMovedClass);
});

document.addEventListener("keydown", (e) => {
  if (e.key == "Escape" && menuWrapper.classList.contains(isOpenedClass)) {
    menuClose.click();
  }
});

window.addEventListener("resize", () => {
  body.classList.add(noTransitionClass);
  clearTimeout(resize);
  resize = setTimeout(() => {
    body.classList.remove(noTransitionClass);
  }, 500);
});
