// -------------------- Navbar Scroll & Active Link --------------------
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    // Add blur effect or background if needed
});

// Navbar active menu highlight
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section");

function updateActiveMenu() {
    let currentSection = "";
    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("font-bold", "text-secondary");
        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("font-bold", "text-secondary");
        }
    });
}
window.addEventListener("scroll", updateActiveMenu);
updateActiveMenu();

// -------------------- Hero Slider --------------------
const slides = document.querySelectorAll("#slider .slide");
let currentSlide = 0;
let slideInterval = setInterval(nextSlide, 3000);

function showSlide(index) {
    slides.forEach((slide, i) => slide.style.opacity = i === index ? "1" : "0");
    currentSlide = index;
}

function nextSlide() {
    let nextIndex = currentSlide + 1 >= slides.length ? 0 : currentSlide + 1;
    showSlide(nextIndex);
}

function prevSlideFunc() {
    let prevIndex = currentSlide - 1 < 0 ? slides.length - 1 : currentSlide - 1;
    showSlide(prevIndex);
}

document.getElementById("nextSlide").addEventListener("click", () => {
    nextSlide(); resetInterval();
});
document.getElementById("prevSlide").addEventListener("click", () => {
    prevSlideFunc(); resetInterval();
});

function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 3000);
}
showSlide(currentSlide);

// -------------------- Product Fetch & Display --------------------
const productList = document.getElementById("productList");
const sortSelect = document.getElementById("sortPrice");
const showMoreBtn = document.getElementById("showMoreBtn");

let products = [];
let currentProducts = [];
let showingAll = false;

async function fetchProducts() {
    try {
        const res = await fetch("https://fakestoreapi.com/products");
        products = await res.json();
        currentProducts = [...products];
        displayProducts(currentProducts.slice(0, 6));
    } catch (err) {
        console.error("Failed to fetch products:", err);
        productList.innerHTML = "<p class='col-span-3 text-center text-red-500'>Failed to load products.</p>";
    }
}

function displayProducts(list) {
    productList.innerHTML = list.map(product => `
        <div class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
            <img src="${product.image}" alt="${product.title}" class="h-40 w-full object-contain mb-4"/>
            <h3 class="font-semibold text-lg mb-2">${product.title}</h3>
            <p class="text-secondary font-bold mb-2">${product.price} BDT</p>
            <button 
                class="add-to-cart bg-gradient-to-r from-secondary to-orange-500 text-white px-4 py-2 rounded-md font-semibold hover:opacity-90"
                data-id="${product.id}"
                data-title="${product.title}"
                data-price="${product.price}"
            >
                Add to Cart
            </button>
        </div>
    `).join("");
}

// Sorting
sortSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    currentProducts = [...products];
    if (value === "lowToHigh") currentProducts.sort((a, b) => a.price - b.price);
    else if (value === "highToLow") currentProducts.sort((a, b) => b.price - a.price);
    displayProducts(showingAll ? currentProducts : currentProducts.slice(0, 6));
});

// Show More / Show Less
showMoreBtn.addEventListener("click", () => {
    showingAll = !showingAll;
    if (showingAll) {
        displayProducts(currentProducts);
        showMoreBtn.textContent = "Show Less";
    } else {
        displayProducts(currentProducts.slice(0, 6));
        showMoreBtn.textContent = "Show More";
    }
});
fetchProducts();

// -------------------- Cart Drawer --------------------
const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const closeCartBtn = document.getElementById("closeCartBtn");

function openCart() { cartDrawer.classList.remove("translate-x-full"); cartOverlay.classList.remove("hidden"); }
function closeCart() { cartDrawer.classList.add("translate-x-full"); cartOverlay.classList.add("hidden"); }

cartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// -------------------- User Balance System --------------------
let balance = localStorage.getItem("userBalance") ? parseFloat(localStorage.getItem("userBalance")) : 1000;
const balanceEl = document.getElementById("userBalance");
const addMoneyBtn = document.getElementById("addMoneyBtn");
const resetBalanceBtn = document.getElementById("resetBalanceBtn");
const balanceWarning = document.getElementById("balanceWarning");

function updateBalanceDisplay() {
    balanceEl.textContent = balance.toFixed(2);
}
updateBalanceDisplay();

// Add Money
addMoneyBtn.addEventListener("click", () => {
    balance += 1000;
    localStorage.setItem("userBalance", balance);
    updateBalanceDisplay();
    balanceWarning.classList.add("hidden");
});

// Reset Balance
resetBalanceBtn.addEventListener("click", () => {
    balance = 1000;
    localStorage.setItem("userBalance", balance);
    updateBalanceDisplay();
    balanceWarning.classList.add("hidden");
});

// -------------------- Cart Functionality --------------------
const cartItemsContainer = document.getElementById("cartItems");
const subtotalEl = document.getElementById("subtotal");
const deliveryEl = document.getElementById("delivery");
const shippingEl = document.getElementById("shipping");
const discountEl = document.getElementById("discount");
const totalEl = document.getElementById("total");
const couponInput = document.getElementById("couponInput");
const applyCouponBtn = document.getElementById("applyCouponBtn");

let cart = [];
let discountPercent = 0;

document.addEventListener("click", (e) => {
    // Add to Cart with Balance Check
    if (e.target.classList.contains("add-to-cart")) {
        const id = e.target.dataset.id;
        const title = e.target.dataset.title;
        const price = parseFloat(e.target.dataset.price);

        const potentialSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0) + price;
        if (potentialSubtotal > balance) {
            alert("⚠️ Low balance! You cannot add this product.");
            return;
        }

        const existingItem = cart.find(item => item.id === id);
        if (existingItem) existingItem.qty += 1;
        else cart.push({ id, title, price, qty: 1 });

        updateCart();
        openCart();
    }

    // Remove item
    if (e.target.classList.contains("remove-item")) {
        const id = e.target.dataset.id;
        cart = cart.filter(item => item.id !== id);
        updateCart();
    }
});

// Apply coupon
applyCouponBtn.addEventListener("click", () => {
    const code = couponInput.value.trim().toUpperCase();
    discountPercent = code === "SMART10" ? 10 : 0;
    updateCart();
});

function updateCart() {
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="flex justify-between items-center">
            <div>
                <p class="font-semibold">${item.title}</p>
                <p>Price: ${item.price} x ${item.qty} BDT</p>
            </div>
            <button class="remove-item text-red-500" data-id="${item.id}">&times;</button>
        </div>
    `).join("");

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const delivery = subtotal > 0 ? 10 : 0;
    const shipping = subtotal > 0 ? 5 : 0;
    const discount = subtotal * (discountPercent / 100);
    const total = subtotal + delivery + shipping - discount;

    subtotalEl.textContent = subtotal.toFixed(2);
    deliveryEl.textContent = delivery.toFixed(2);
    shippingEl.textContent = shipping.toFixed(2);
    discountEl.textContent = discount.toFixed(2);
    totalEl.textContent = total.toFixed(2);

    // Show remaining balance
    balanceEl.textContent = (balance - subtotal).toFixed(2);
}

// -------------------- Checkout --------------------
const checkoutBtn = document.getElementById("checkoutBtn");
checkoutBtn.addEventListener("click", () => {
    if (cart.length > 0) {
        alert("Checkout successful! Your order has been placed.");
        cart = [];
        updateCart();
    } else {
        alert("Your cart is empty. Please add items to your cart before checking out.");
    }
});

// -------------------- Contact Form --------------------
document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Message sent successfully! We’ll get back to you soon.");
});
