/* ========================== Loading Page ======================= */

window.addEventListener("load", function () {
  let loader = document.querySelector(".loading");
  // Prevent scrolling
  document.body.style.overflow = "hidden";
  setTimeout(() => {
    // Prevent scrolling
    document.body.style.overflow = "auto";
    loader.style.display = "none";
  }, 2000);
})

/* ========================== Floating Button ======================= */

let floatBtn = document.getElementById("floating_btn");

window.onscroll = function () {
  if (window.scrollY > 600) {
    floatBtn.classList.add("show");
  } else {
    floatBtn.classList.remove("show");
  }
};

floatBtn.onclick = function () {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth"
  });
};

/* ==================== Show Products Data In Page ==================== */
let products = document.getElementById("products");
let notFound = document.querySelector(".not_found_data");
let itemsCount = document.getElementById("items_count");
let itemsCart = document.querySelector(".items_cart");
let cartUl = document.querySelector(".items_cart ul");
let orderTotal = document.getElementById("order_total");
let noItems = document.querySelector(".no_items");
let confirmOrder = document.getElementById("confirm_order");
let productsArr = [];

if (window.localStorage.getItem("cartProducts")) {
  productsArr = JSON.parse(window.localStorage.getItem("cartProducts"));
  totalPriceAndProductsCount(productsArr);
}

// Fetch Products Data From JSON
async function productData() {
  try {
    let data = await fetch("../json/products.json");
    let result = await data.json();
    createLayoutProducts(result);

    // Click On Product Button (Add to cart)
    addToCartBtn(result);
  } catch (error) {
    notFound.style.display = "block";
    console.log(error);
  }
}
productData();

function createLayoutProducts(result) {
  for (let i = 0; i < result.length; i++) {
    if (products) {
      let productDiv = document.createElement("div");
      productDiv.classList.add("product");
      productDiv.setAttribute("data-id", i);

      let imageDiv = document.createElement("div");
      imageDiv.classList.add("image");

      let productImage = document.createElement("img");
      productImage.setAttribute("src", `../assets/${result[i].imgSrc}.jpg`);
      productImage.setAttribute("alt", result[i].alt);
      productImage.setAttribute("loading", "lazy");
      imageDiv.appendChild(productImage);

      let addToCartButton = document.createElement("button");
      addToCartButton.classList.add("flexCenter");
      addToCartButton.setAttribute("id", "addToCart");

      let cartIcon = document.createElement("i");
      cartIcon.classList.add("fa-solid", "fa-cart-shopping");
      addToCartButton.appendChild(cartIcon);

      let buttonText = document.createElement("span");
      buttonText.textContent = "Add to Cart";
      addToCartButton.appendChild(buttonText);

      imageDiv.appendChild(addToCartButton);

      productDiv.appendChild(imageDiv);

      let infoDiv = document.createElement("div");
      infoDiv.classList.add("info");

      let briefTitle = document.createElement("p");
      briefTitle.textContent = result[i].priefTitle;
      infoDiv.appendChild(briefTitle);

      let title = document.createElement("h2");
      title.textContent = result[i].title;
      infoDiv.appendChild(title);

      let priceSpan = document.createElement("span");
      priceSpan.setAttribute("id", "price");
      priceSpan.textContent = `$${result[i].price}`;
      infoDiv.appendChild(priceSpan);

      productDiv.appendChild(infoDiv);

      products.appendChild(productDiv);
    }
  }
}

// Add Product
function addToCartBtn(result) {
  let addProdBtn = document.querySelectorAll(".product button");
  addProdBtn.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      let currentProduct = e.currentTarget.closest('.product').getAttribute('data-id');
      // Add Products To Array
      addProductsToArray(result[currentProduct]);
      notOrderDone();
    })
  })
}
// Create Notification Order Done Message
function notOrderDone() {
  let orderDone = document.createElement("div");
  orderDone.classList.add("order_done", "flexCenterBetween");

  let orderDoneIcon = document.createElement("i");
  orderDoneIcon.classList.add("fas", "fa-check");

  let orderDoneMsg = document.createElement("p");
  orderDoneMsg.textContent = "Done !";

  orderDone.appendChild(orderDoneIcon);
  orderDone.appendChild(orderDoneMsg);

  document.body.appendChild(orderDone);

  // Show Notification Order Done Message
  orderDone.classList.add("show");
  setTimeout(() => {
    orderDone.classList.remove("show");
    orderDone.classList.add("hide");
  }, 2000);

  // After 2 seconds, hide is removed to be ready to appear next time.
  setTimeout(() => {
    orderDone.classList.remove("hide");
  }, 500);
}

// Add Products To Array
function addProductsToArray(currentProduct) {
  // Check if the product exists in the array using the id or other unique property (such as id)
  let existingProduct = productsArr.find(item => item.id === currentProduct.id);

  // If the product is already in the cart, increase the quantity.
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    // If the product does not exist in the cart, add it with quantity = 1
    currentProduct.quantity = 1;
    productsArr.push(currentProduct);
  }

  // Update total price and number of products
  totalPriceAndProductsCount(productsArr);

  // Update: Add Products To LocalStorage
  addProductsToLocalStorage(productsArr);

  // Update: Display The Cart Products To Cart
  fillProductToCart(productsArr);
}

// Add Products To LocalStorage
function addProductsToLocalStorage(productsArr) {
  window.localStorage.setItem("cartProducts", JSON.stringify(productsArr));
}

// Display The Cart Products To Cart
function fillProductToCart(productsArr) {
  // Empty the cart before adding items
  cartUl.innerHTML = "";

  if (productsArr.length === 0) {
    // No products found, show "No products found" message and hide cart
    itemsCart.style.display = "none";
    noItems.style.display = "block";
  } else {
    // To Show the scroll in a consistently
    if (productsArr.length >= 5) {
      cartUl.style.paddingRight = "20px";
    } else {
      cartUl.style.paddingRight = "0";
    }

    // There are products, show cart and hide message
    itemsCart.style.display = "block";
    noItems.style.display = "none";
    productsArr.forEach((product) => {
      createLayoutCartProducts(product);
    });
  }

  // Updatr Total Price And Products Count
  totalPriceAndProductsCount(productsArr);

  let deleteBtn = document.querySelectorAll(".items_cart ul .del");
  deleteBtn.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      if (e.currentTarget.classList.contains("del")) {
        let productId = e.currentTarget.parentElement.getAttribute("data-id");
        let currentTarget = e.currentTarget.parentElement;
        deleteProductWith(productId, currentTarget);
      };
    });
  });

  // Confirm Order Popup
  createLayoutAndShowPopup(productsArr);
};

function createLayoutCartProducts(product) {
  // Create a new <li> element
  let listItem = document.createElement("li");
  listItem.classList.add("item", "flexCenterBetween");
  listItem.setAttribute("data-id", product.id);

  // Create the div inside the li
  let productDiv = document.createElement("div");

  // Add product title
  let title = document.createElement("h4");
  title.textContent = product.title;
  productDiv.appendChild(title);

  // Add additional information (quantity and price)
  let priceDiv = document.createElement("div");
  priceDiv.classList.add("flex");

  let quantitySpan = document.createElement("span");
  quantitySpan.id = "count";
  quantitySpan.textContent = `${product.quantity}x`;
  priceDiv.appendChild(quantitySpan);

  let priceSpan = document.createElement("span");
  priceSpan.id = "price";
  priceSpan.innerHTML = `<span>@</span> $${product.price}`;
  priceDiv.appendChild(priceSpan);

  let totalPriceSpan = document.createElement("span");
  totalPriceSpan.id = "total_price_item";
  totalPriceSpan.textContent = `$${product.price * product.quantity}`;
  priceDiv.appendChild(totalPriceSpan);

  productDiv.appendChild(priceDiv);

  // Add the div to the <li> element
  listItem.appendChild(productDiv);

  // Create the button to delete the product
  let deleteBtn = document.createElement("button");
  deleteBtn.classList.add("flexCenter", "del");

  // Add icon to delete product
  let icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-close");
  deleteBtn.appendChild(icon);

  listItem.appendChild(deleteBtn);

  // Add li to ul
  cartUl.appendChild(listItem);
}

// Confirm Order Popup
function createLayoutAndShowPopup(productsArr) {
  if (confirmOrder) {
    confirmOrder.onclick = function () {
      // Container Div To Wrappering Content
      let containerDiv = document.createElement("div");
      containerDiv.classList.add("container");

      let confirmPopup = document.createElement("div");
      confirmPopup.classList.add("confirm_popup");

      let popUp = document.createElement("div");
      popUp.classList.add("popup");

      let checkIcon = document.createElement("i");
      checkIcon.classList.add("fas", "fa-check", "flexCenter");

      let popUpTitle = document.createElement("div");
      popUpTitle.classList.add("title");

      let h2 = document.createElement("h2");
      h2.appendChild(document.createTextNode("Order Confirmed"));

      let p = document.createElement("p");
      p.appendChild(document.createTextNode("We hope you enjoy your food!"));

      popUpTitle.appendChild(h2);
      popUpTitle.appendChild(p);

      let confirmedItems = document.createElement("div");
      confirmedItems.classList.add("confirmed_items");

      let ul = document.createElement("ul");

      for (let i = 0; i < productsArr.length; i++) {
        // Create a new <li> element
        let listItem = document.createElement("li");
        listItem.classList.add("item", "flexEndBetween");
        listItem.setAttribute("data-id", productsArr[i].id);

        // Create the div inside the li
        let productDiv = document.createElement("div");
        productDiv.classList.add("flexAlignCenter");

        // Add product image
        let productImg = document.createElement("img");
        productImg.src = `../assets/${productsArr[i].imgSrc}.jpg`;
        productImg.alt = productsArr[i].alt;
        productDiv.appendChild(productImg);

        let infoDiv = document.createElement("div");

        // Add product title
        let title = document.createElement("h4");
        title.textContent = productsArr[i].title;
        infoDiv.appendChild(title);

        // Add additional information (quantity and price)
        let priceDiv = document.createElement("div");
        priceDiv.classList.add("flex");

        let quantitySpan = document.createElement("span");
        quantitySpan.id = "count";
        quantitySpan.textContent = `${productsArr[i].quantity}x`;
        priceDiv.appendChild(quantitySpan);

        let priceSpan = document.createElement("span");
        priceSpan.id = "price";
        priceSpan.innerHTML = `<span>@</span> $${productsArr[i].price}`;
        priceDiv.appendChild(priceSpan);

        let totalPriceSpan = document.createElement("span");
        totalPriceSpan.id = "total_price_item";
        totalPriceSpan.textContent = `$${productsArr[i].price * productsArr[i].quantity}`;

        infoDiv.appendChild(priceDiv);
        productDiv.appendChild(infoDiv);

        // Add the div to the <li> element
        listItem.appendChild(productDiv);

        // Add Total Price to the <li> element
        listItem.appendChild(totalPriceSpan);

        // Add <li> to the ul
        ul.appendChild(listItem);
      }

      let totalPrice = document.createElement("div");
      totalPrice.classList.add("total_price", "flexCenterBetween");
      totalPrice.id = "total_price";

      let orderTotalPara = document.createElement("p");
      orderTotalPara.textContent = "Order Total";

      let orderTotal = document.createElement("h3");
      orderTotal.id = "order_total";

      // The process of collecting the order Total
      let sum = 0;
      productsArr.forEach(product => {
        sum += product.price * product.quantity;
      });
      orderTotal.innerHTML = `$${sum}`;

      totalPrice.appendChild(orderTotalPara);
      totalPrice.appendChild(orderTotal);

      let newOrder = document.createElement("button");
      newOrder.id = "new_order";
      newOrder.textContent = "Start New Order";

      confirmedItems.appendChild(ul);
      confirmedItems.appendChild(totalPrice);

      popUp.appendChild(checkIcon);
      popUp.appendChild(popUpTitle);
      popUp.appendChild(confirmedItems);
      popUp.appendChild(newOrder);

      containerDiv.appendChild(popUp);
      confirmPopup.appendChild(containerDiv);
      document.body.appendChild(confirmPopup);

      // Prevent scrolling
      document.body.style.overflow = "hidden";

      // Hide Popup
      newOrder.addEventListener("click", () => {
        // Re-enable page scrolling and hide popup
        document.body.style.overflow = "auto";
        // Hide Popup
        confirmPopup.style.display = "none";

        // Clear all products from localStorage
        window.localStorage.removeItem("cartProducts");
        
        // Clear products array
        productsArr = [];

        // Update In LocalStorage
        addProductsToLocalStorage(productsArr);

        // Update the shopping cart view to show "No products found"
        fillProductToCart(productsArr);
      })
    }
  }
}

function getProductsFromLocalStorage() {
  let data = window.localStorage.getItem("cartProducts");
  if (data) {
    let products = JSON.parse(data);
    if (products.length > 0) {
      // If products are present, they are displayed in the cart.
      fillProductToCart(products);
    } else {
      // If the array is empty, the default message is displayed.
      fillProductToCart([]);
    }
  } else {
    // If there is no data in localStorage, the default message is displayed.
    fillProductToCart([]);
  }
}
// Trigger Get Products From localStorage Fucntion
getProductsFromLocalStorage();

function deleteProductWith(productId, currentTarget) {
  let product = productsArr.find((item) => item.id === +productId);

  // If quantity is greater than 1, decrease quantity
  if (product && product.quantity > 1) {
    product.quantity -= 1;
  } else {
    // If quantity equals 1, remove product from cart
    productsArr = productsArr.filter((item) => item.id != productId);
    currentTarget.remove();
  }

  // Update total price and number of products
  totalPriceAndProductsCount(productsArr);

  // Update In LocalStorage
  addProductsToLocalStorage(productsArr);

  // Update Fill Product To Cart (Very Important)
  fillProductToCart(productsArr);
}

// Number of Cart Products & Order Total
function totalPriceAndProductsCount(productsArr) {
  // The process of collecting the order Total
  let sum = 0;
  productsArr.forEach(product => {
    sum += product.price * product.quantity;
  });
  orderTotal.innerHTML = `$${sum}`;
  // number Of Cart Products
  itemsCount.innerHTML = productsArr.length;
}