const keyActions = {
  select: ["Enter", "Space", " "],
  next: ["ArrowRight", "ArrowDown"],
  prev: ["ArrowLeft", "ArrowUp"]
};

const makeRadioGroupKeyboardNavigable = (labelSelector) => {
  const labels = Array.from(document.querySelectorAll(labelSelector));

  labels.forEach((label, index) => {
    const radio = label.querySelector('input[type="radio"]');

    label.addEventListener("keydown", (event) => {
      const { key, code } = event;

      if (keyActions.select.includes(key) || keyActions.select.includes(code)) {
        event.preventDefault();
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }

      let newIndex = null;
      if (keyActions.next.includes(key)) {
        newIndex = (index + 1) % labels.length;
      } else if (keyActions.prev.includes(key)) {
        newIndex = (index - 1 + labels.length) % labels.length;
      }

      if (newIndex !== null) {
        event.preventDefault();
        const newLabel = labels[newIndex];
        const newRadio = newLabel.querySelector('input[type="radio"]');
        newRadio.checked = true;
        newRadio.dispatchEvent(new Event("change", { bubbles: true }));
        newLabel.focus();
      }
    });
  });
};

function enableThumbKeyboardNavigation(swiper) {
  if (!swiper || !swiper.slides) return;

  swiper.slides.forEach((slide) => {
    slide.addEventListener("keydown", (event) => {
      const { key, code } = event;
      const visibleSlides = swiper.slides.filter((s) => !s.classList.contains("hidden"));
      const index = visibleSlides.indexOf(slide);
      if (index === -1) return;

      if (keyActions.select.includes(key) || keyActions.select.includes(code)) {
        event.preventDefault();
        swiper.slideTo(swiper.slides.indexOf(slide));
        slide.click();
        return;
      }

      if (keyActions.next.includes(key)) {
        event.preventDefault();
        const next = visibleSlides[index + 1] || visibleSlides[0];
        next.focus();
      } else if (keyActions.prev.includes(key)) {
        event.preventDefault();
        const prev = visibleSlides[index - 1] || visibleSlides[visibleSlides.length - 1];
        prev.focus();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const thumbsSwiperEl = document.querySelector(".thumbSwiper");
  const mainSwiperEl = document.querySelector(".mainSwiper");
  const colorSelect = document.querySelector("#color-select");
  const variantInput = document.querySelector("#selected-variant-id");
  const variantContainer = document.querySelector("#variant-data");
  const addToCartBtn = document.querySelector(".add-to-cart-button");
  const messageBox = document.querySelector(".form-message");

  const sizeRadios = document.querySelectorAll(".size-input");

  if (!thumbsSwiperEl || !mainSwiperEl || !variantContainer) return;

  const allThumbSlides = Array.from(document.querySelectorAll(".thumbSwiper .swiper-slide"));
  const mainSlides = Array.from(document.querySelectorAll(".mainSwiper .swiper-slide"));
  const colorRadios = document.querySelectorAll(".color-input");

  const colorIndex = parseInt(variantContainer.dataset.colorIndex);
  const sizeIndex = parseInt(variantContainer.dataset.sizeIndex);

  const variants = Array.from(variantContainer.querySelectorAll("span")).map((el) => ({
    id: el.dataset.id,
    option1: el.dataset.option1,
    option2: el.dataset.option2,
    option3: el.dataset.option3,
    mediaId: el.dataset.mediaId,
    available: el.dataset.available === "true"
  }));

  function findVariant(color, size) {
    return variants.find((v) => {
      const colorVal = colorIndex >= 0 ? v[`option${colorIndex + 1}`] : null;
      const sizeVal = sizeIndex >= 0 ? v[`option${sizeIndex + 1}`] : null;
      const colorMatch = color ? colorVal === color : true;
      const sizeMatch = size ? sizeVal === size : true;

      return colorMatch && sizeMatch;
    });
  }

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
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    },
    keyboard: true,
    thumbs: { swiper: thumbsSwiper }
  });

  window.addEventListener("resize", () => {
    thumbsSwiper.update();
    mainSwiper.update();
  });

  enableThumbKeyboardNavigation(thumbsSwiper);

  function updateMainImage(mediaId) {
    if (!mediaId) return;
    const index = mainSlides.findIndex((s) => s.dataset.mediaId === mediaId);
    if (index >= 0 && mainSwiper) mainSwiper.slideTo(index);
  }

  function updateThumbnailsForColor(variant) {
    if (!variant) return;
    const featuredMediaId = variant.mediaId;
    allThumbSlides.forEach((slide) => {
      const mediaId = slide.dataset.mediaId;
      const shouldShow = String(mediaId) === String(featuredMediaId);

      slide.classList.toggle("hidden", !shouldShow);
      slide.setAttribute("tabindex", shouldShow ? "0" : "-1");
    });

    thumbsSwiper.update();

    updateMainImage(featuredMediaId);
  }

  if (colorRadios.length && colorSelect) {
    colorRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        colorSelect.value = e.target.value;
        colorSelect.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }

  function getSelectedSize() {
    const checked = document.querySelector('input[name="size"]:checked');
    return checked ? checked.value : null;
  }

  makeRadioGroupKeyboardNavigable(".color-label");
  makeRadioGroupKeyboardNavigable(".size-label");

  let currentMessageType = null;
  function showMessage(text, type = "error") {
    if (!messageBox) return;

    messageBox.textContent = text;
    messageBox.classList.remove("text-red-500", "text-green-500", "opacity-0", "invisible", "pointer-events-none");
    messageBox.classList.add(type === "error" ? "text-red-500" : "text-green-500");
    messageBox.classList.add("opacity-100");
    messageBox.classList.remove("invisible", "pointer-events-none");

    currentMessageType = type;
  }

  function hideErrorMessage() {
    if (!messageBox || currentMessageType !== "error") return;
    messageBox.classList.remove("opacity-100", "text-red-500");
    messageBox.classList.add("opacity-0", "invisible", "pointer-events-none");
    currentMessageType = null;
  }
  let hasInteracted = false;

  const visibleText = addToCartBtn.querySelector('[aria-hidden="true"]');
  const srText = addToCartBtn.querySelector(".sr-only");

  function updateVariant() {
    const color = colorSelect?.value;
    const size = getSelectedSize();
    const variant = findVariant(color, size);

    if (!variant) return;

    variantInput.value = variant.id;

    updateMainImage(variant.mediaId);
    updateThumbnailsForColor(variant);

    if (variant && history.replaceState) {
      const url = new URL(window.location);
      url.searchParams.set("variant", variant.id);
      window.history.replaceState({}, "", url);
    }

    if (variant.available) {
      addToCartBtn.disabled = false;
      visibleText.textContent = addToCartBtn.dataset.addToBagText;
      srText.textContent = addToCartBtn.dataset.addToBagText;
      hideErrorMessage();
    } else {
      addToCartBtn.disabled = true;
      visibleText.textContent = addToCartBtn.dataset.soldOutText;
      srText.textContent = addToCartBtn.dataset.soldOutText;
      if (hasInteracted && color && size) {
        showMessage(`Variant ${size}/${color} is currently unavailable.`, "error");
      }
    }
  }

  colorSelect?.addEventListener("change", () => {
    hasInteracted = true;
    updateVariant();
  });

  document.querySelectorAll('input[name="size"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      hasInteracted = true;
      updateVariant();
    });
  });
  updateVariant();

  addToCartBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const variantId = variantInput.value;

    if (!variantId || addToCartBtn.disabled) {
      showMessage("Cannot add this variant to cart.");
      return;
    }

    addToCartBtn.disabled = true;

    try {
      const addResponse = await fetch(window.Shopify.routes.root + "cart/add.js", {
        method: "POST",
        body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] }),
        headers: { "Content-Type": "application/json" }
      });

      if (!addResponse.ok) throw new Error("Add to cart failed");
      await addResponse.json();
      showMessage(`Added to cart!`, "success");
      const cartResponse = await fetch(window.Shopify.routes.root + "cart.js");

      if (!cartResponse.ok) throw new Error("Fetch cart failed");
      const cart = await cartResponse.json();

      const cartCountBubble = document.querySelector(".cart-count-bubble sup:first-child");
      if (cartCountBubble) cartCountBubble.textContent = cart.item_count;
    } catch (err) {
      console.error(err);
      showMessage("Network error. Please try again.", "error");
    } finally {
      addToCartBtn.disabled = false;
      visibleText.textContent = addToCartBtn.dataset.addToBagText;
      srText.textContent = addToCartBtn.dataset.addToBagText;
      updateVariant();
    }
  });

  thumbsSwiperEl.addEventListener("click", (e) => {
    const slide = e.target.closest(".swiper-slide");
    if (!slide) return;
    const mediaId = slide.dataset.mediaId;
    if (!mediaId) return;
    updateMainImage(mediaId);
  });
});
