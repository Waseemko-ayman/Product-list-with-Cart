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
    })
  })
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
    itemsCart.style.display = "none";
    noItems.style.display = "block";
  } else {
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
  if (confirmOrder) {
    confirmOrder.onclick = function () {
      console.log(productsArr, productsArr.length)
      let confirmPopup = document.createElement("div");
      confirmPopup.classList.add("confirm_popup");

      let popUp = document.createElement("div");
      popUp.classList.add("popup");

      let closeIcon = document.createElement("i");
      closeIcon.classList = "fa-solid fa-close flexCenter";

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
        listItem.classList.add("item", "flexCenterBetween");
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

      let orderTotalH3 = document.createElement("h3");
      orderTotalH3.id = "order_total";

      totalPrice.appendChild(orderTotalPara);
      totalPrice.appendChild(orderTotalH3);

      let newOrder = document.createElement("button");
      newOrder.id = "new_order";
      newOrder.textContent = "Start New Order";

      confirmedItems.appendChild(ul);
      confirmedItems.appendChild(totalPrice);

      popUp.appendChild(closeIcon);
      popUp.appendChild(popUpTitle);
      popUp.appendChild(confirmedItems);
      popUp.appendChild(newOrder);

      confirmPopup.appendChild(popUp);
      document.body.appendChild(confirmPopup);

      // Hide Popup
      newOrder.addEventListener("click", function () {
        confirmPopup.style.display = "none";
      })
    }
  }
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

function getProductsFromLocalStorage() {
  let data = window.localStorage.getItem("cartProducts");
  if (data) {
    let products = JSON.parse(data);
    fillProductToCart(products);
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
  let sum = 0;
  productsArr.forEach(product => {
    sum += product.price * product.quantity;
  });
  orderTotal.innerHTML = `$${sum}`;
  // number Of Cart Products
  itemsCount.innerHTML = productsArr.length;
}