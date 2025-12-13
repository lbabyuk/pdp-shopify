let mainSwiper;
let thumbsSwiper;

const allThumbSlides = Array.from(document.querySelectorAll(".thumbSwiper .swiper-slide"));
const mainSlides = Array.from(document.querySelectorAll(".mainSwiper .swiper-slide"));
const colorRadios = document.querySelectorAll(".color-input");

function initializeSlider() {
  const mainSlides = Array.from(document.querySelectorAll(".mainSwiper .swiper-slide"));

  const thumbsSwiper = new Swiper(".thumbSwiper", {
    spaceBetween: 16,
    slidesPerView: "auto",
    loop: false,
    freeMode: true,
    watchSlidesProgress: true,
    keyboard: {
      enabled: true
    },
    breakpoints: {
      0: { spaceBetween: 16, direction: "horizontal" },
      768: { spaceBetween: 16, direction: "horizontal" },
      1024: { spaceBetween: 16, direction: "horizontal" },
      1280: { spaceBetween: 24, direction: "vertical", slidesPerView: 5 }
    }
  });

  const mainSwiper = new Swiper(".mainSwiper", {
    loop: mainSlides.length > 1,
    spaceBetween: 5,

    keyboard: true,
    thumbs: { swiper: thumbsSwiper }
  });

  window.addEventListener("resize", () => {
    thumbsSwiper.update();
    mainSwiper.update();
  });

  enableThumbKeyboardNavigation(thumbsSwiper);
}
function selectVariantThumbnail(variantId) {
  if (!thumbsSwiper || !mainSwiper) return;

  const mainSlides = Array.from(document.querySelectorAll(".mainSwiper .swiper-slide"));
  let targetIndex = 0;

  const variantInput = document.querySelector(`input[value="${variantId}"]`);
  if (!variantInput) return;

  const variantMediaIds = variantInput.dataset.mediaIds ? variantInput.dataset.mediaIds.split(",") : [];

  mainSlides.forEach((slide, index) => {
    const mediaId = slide.dataset.mediaId;
    if (variantMediaIds.includes(mediaId)) {
      targetIndex = index;
    }
  });

  mainSwiper.slideTo(targetIndex);
}

window.initializeSlider = initializeSlider;
window.selectVariantThumbnail = selectVariantThumbnail;
function enableThumbKeyboardNavigation(swiper) {
  if (!swiper || !swiper.slides) return;
  swiper.slides.forEach((slide) => {
    slide.addEventListener("keydown", (event) => {
      if (["Enter", "Space", " "].includes(event.key)) {
        event.preventDefault();
        swiper.slideTo(swiper.slides.indexOf(slide));
        slide.click();
      }
    });
  });
}
window.initializeSlider = initializeSlider;

document.addEventListener("DOMContentLoaded", initializeSlider);
