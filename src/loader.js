document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const mainContent = document.querySelector("main");

  setTimeout(() => {
    loader.classList.add("hidden");
    mainContent.classList.add("visible");
  }, 1000); // 1 segundo
});