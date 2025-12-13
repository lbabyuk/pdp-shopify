document.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.querySelector(".open-size-guide");
  const popup = document.getElementById("sizeGuideModal");
  const closeBtn = popup.querySelector(".close-modal");

  if (openBtn && popup && closeBtn) {
    openBtn.addEventListener("click", () => {
      popup.style.display = "flex";
      document.body.style.overflow = "hidden";
    });

    openBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        popup.style.display = "flex";
        document.body.style.overflow = "hidden";
      }
    });

    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
      document.body.style.overflow = "";
    });

    window.addEventListener("click", (e) => {
      if (e.target === popup) {
        popup.style.display = "none";
        document.body.style.overflow = "";
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && popup.style.display === "flex") {
        popup.style.display = "none";
        document.body.style.overflow = "";
      }
    });
  }
});
