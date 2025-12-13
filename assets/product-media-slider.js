let mainSwiper = null;
let thumbsSwiper = null;

const keyActions = {
  select: ["Enter", "Space", " "],
  next: ["ArrowRight", "ArrowDown"],
  prev: ["ArrowLeft", "ArrowUp"]
};

function initializeSlider() {
  const mainEl = document.querySelector(".mainSwiper");
  const thumbEl = document.querySelector(".thumbSwiper");
  if (!mainEl || !thumbEl) return;

  if (thumbsSwiper) {
    thumbsSwiper.destroy(true, true);
    thumbsSwiper = null;
  }
  if (mainSwiper) {
    mainSwiper.destroy(true, true);
    mainSwiper = null;
  }
  thumbsSwiper = new Swiper(thumbEl, {
    spaceBetween: 16,
    slidesPerView: "auto",
    freeMode: true,
    watchSlidesProgress: true,
    keyboard: { enabled: true },
    breakpoints: {
      0: { spaceBetween: 16, direction: "horizontal" },
      768: { spaceBetween: 16, direction: "horizontal" },
      1024: { spaceBetween: 16, direction: "horizontal" },
      1280: { spaceBetween: 24, direction: "vertical", slidesPerView: 5 }
    }
  });

  mainSwiper = new Swiper(mainEl, {
    spaceBetween: 5,
    keyboard: { enabled: true },
    thumbs: { swiper: thumbsSwiper }
  });

  goToInitialMedia();
  enableThumbKeyboardNavigation();
  makeRadioGroupKeyboardNavigable();
}

function goToInitialMedia() {
  if (!mainSwiper) return;
  const initialSlide = document.querySelector('[data-initial-media="true"]');
  if (!initialSlide) return;
  const index = Array.from(mainSwiper.slides).indexOf(initialSlide);
  if (index !== -1) mainSwiper.slideTo(index, 0);
}

function selectVariantThumbnail(variantId) {
  if (!mainSwiper) return;
  const input = document.querySelector(`.color-input[value="${variantId}"]`);
  if (!input) return;

  const mediaId = input.dataset.mediaId;
  if (!mediaId) return;

  const slides = Array.from(mainSwiper.slides);
  const index = slides.findIndex((slide) => slide.dataset.mediaId === mediaId);
  if (index !== -1) mainSwiper.slideTo(index);
}

function makeRadioGroupKeyboardNavigable() {
  const optionGroups = document.querySelectorAll(".product__options-values");

  optionGroups.forEach((group) => {
    const options = Array.from(group.querySelectorAll(".color__option, .size__option"));

    options.forEach((option, index) => {
      option.addEventListener("keydown", (event) => {
        let nextIndex = index;

        if (keyActions.next.includes(event.key)) {
          event.preventDefault();
          nextIndex = (index + 1) % options.length;
          options[nextIndex].focus();
        }

        if (keyActions.prev.includes(event.key)) {
          event.preventDefault();
          nextIndex = (index - 1 + options.length) % options.length;
          options[nextIndex].focus();
        }

        if (keyActions.select.includes(event.key)) {
          event.preventDefault();
          const input = option.closest("label").querySelector('input[type="radio"]');
          if (!input) return;
          input.checked = true;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });
  });
}

function enableThumbKeyboardNavigation() {
  if (!thumbsSwiper || !thumbsSwiper.slides) return;
  thumbsSwiper.slides.forEach((slide) => {
    slide.addEventListener("keydown", (event) => {
      if (["Enter", "Space", " "].includes(event.key)) {
        event.preventDefault();
        const index = Array.from(thumbsSwiper.slides).indexOf(slide);
        thumbsSwiper.slideTo(index);
        mainSwiper.slideTo(index);
        slide.click();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initializeSlider);

window.initializeSlider = initializeSlider;
window.makeRadioGroupKeyboardNavigable = makeRadioGroupKeyboardNavigable;
window.selectVariantThumbnail = selectVariantThumbnail;
