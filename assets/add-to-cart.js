document.addEventListener("DOMContentLoaded", function () {
  const addToCartBtn = document.querySelector(".add-to-cart-button");
  const messageBox = document.querySelector(".form-message");
  const variantInput = document.querySelector("#selected-variant-id");
  const productDataEl = document.querySelector("#product-data");
  const variants = JSON.parse(productDataEl.dataset.variants);
  const visibleText = addToCartBtn.querySelector('[aria-hidden="true"]');
  const srText = addToCartBtn.querySelector(".sr-only");

  function getSelectedVariant() {
    const selectedId = Number(variantInput.value);
    return variants.find((v) => v.id === selectedId);
  }

  function showMessage(text, type = "error") {
    if (!messageBox) return;

    messageBox.textContent = text;
    messageBox.classList.remove("text-red-500", "text-green-500", "opacity-0", "invisible", "pointer-events-none");
    messageBox.classList.add(type === "error" ? "text-red-500" : "text-green-500");
    messageBox.classList.add("opacity-100");
    messageBox.classList.remove("invisible", "pointer-events-none");
  }

  function hideMessage() {
    if (!messageBox) return;

    messageBox.classList.remove("opacity-100", "text-red-500", "text-green-500");
    messageBox.classList.add("opacity-0", "invisible", "pointer-events-none");
  }

  function updateVariant() {
    const variant = getSelectedVariant();
    if (!variant) return;

    console.log("Selected Variant:", variant);

    if (variant.available && variant.inventory_quantity > 0) {
      addToCartBtn.disabled = false;
      visibleText.textContent = addToCartBtn.dataset.addToBagText;
      srText.textContent = addToCartBtn.dataset.addToBagText;
      hideMessage();
    } else {
      addToCartBtn.disabled = true;
      visibleText.textContent = addToCartBtn.dataset.soldOutText;
      srText.textContent = addToCartBtn.dataset.soldOutText;
      showMessage("Variant is currently unavailable.", "error");
    }
  }

  updateVariant();

  variantInput.addEventListener("change", updateVariant);
  addToCartBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const variantId = variantInput.value;
    const sectionId = productDataEl.dataset.sectionId;
    const quantityInput = document.querySelector(`#Quantity-${sectionId}`);
    const quantity = +quantityInput.value;

    if (!variantId || addToCartBtn.disabled) {
      updateVariant();
      showMessage("Cannot add this variant to cart.");
      return;
    }

    addToCartBtn.disabled = true;

    try {
      const addResponse = await fetch(window.Shopify.routes.root + "cart/add.js", {
        method: "POST",
        body: JSON.stringify({ items: [{ id: variantId, quantity }] }),
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
});
