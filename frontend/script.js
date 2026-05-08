const foodDatabase = [
    { name:"Apfel", serving:"1 Stück (150g)", calories:78, protein:0, carbs:21, fat:0 },
    { name:"Apfel", serving:"100g", calories:52, protein:0, carbs:14, fat:0 },
    { name:"Banane", serving:"1 Stück (120g)", calories:107, protein:1, carbs:27, fat:0 },
    { name:"Haferflocken", serving:"100g", calories:372, protein:13, carbs:59, fat:7 },
    { name:"Reis gekocht", serving:"100g", calories:130, protein:3, carbs:28, fat:0 },
    { name:"Hähnchenbrust", serving:"100g", calories:165, protein:31, carbs:0, fat:4 },
    { name:"Ei", serving:"1 Stück", calories:78, protein:6, carbs:1, fat:5 },
    { name:"Lachs", serving:"100g", calories:208, protein:20, carbs:0, fat:13 },
    { name:"Joghurt", serving:"100g", calories:61, protein:4, carbs:5, fat:3 },
    { name:"Avocado", serving:"100g", calories:160, protein:2, carbs:9, fat:15 }
];

let products = [];

const dict = {
    de:{
        start:"Start",
        calories:"Kalorien",
        meals:"Mahlzeiten",
        training:"Training",
        shop:"Shop",
        team:"Team",
        login:"Login",
        cart:"Warenkorb",
        buy:"Kaufen",
        added:"Produkt wurde in den Warenkorb gelegt.",
        empty:"Dein Warenkorb ist leer.",
        checkout:"Zur Kasse",
        demo:"Demo-Shop: Checkout ist als Frontend-Prototyp umgesetzt.",
        search:"Produkte suchen..."
    },

    en:{
        start:"Home",
        calories:"Calories",
        meals:"Meals",
        training:"Training",
        shop:"Shop",
        team:"Team",
        login:"Login",
        cart:"Cart",
        buy:"Buy",
        added:"Product added to cart.",
        empty:"Your cart is empty.",
        checkout:"Checkout",
        demo:"Demo shop: checkout is implemented as a frontend prototype.",
        search:"Search products..."
    },

    tr:{
        start:"Ana sayfa",
        calories:"Kalori",
        meals:"Yemekler",
        training:"Antrenman",
        shop:"Mağaza",
        team:"Ekip",
        login:"Giriş",
        cart:"Sepet",
        buy:"Satın al",
        added:"Ürün sepete eklendi.",
        empty:"Sepetin boş.",
        checkout:"Ödeme",
        demo:"Demo mağaza: ödeme frontend prototipi olarak hazırlandı.",
        search:"Ürün ara..."
    }
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let trackedFoods = [];

let cart = JSON.parse(localStorage.getItem("fittrackCart") || "[]");

let lang = localStorage.getItem("fittrackLang") || "de";

function initNav(){

    const p = location.pathname.split('/').pop() || 'index.html';

    $$('nav a').forEach(a => {
        if(a.getAttribute('href') === p){
            a.classList.add('active');
        }
    });

    const sel = $('#languageSelect');

    if(sel){

        sel.value = lang;

        sel.addEventListener('change', e => {

            lang = e.target.value;

            localStorage.setItem('fittrackLang', lang);

            applyLang();

            renderProducts();

            renderCart();

        });

    }

    applyLang();

    updateCartCount();

}

function applyLang(){

    const t = dict[lang] || dict.de;

    $$('[data-i18n]').forEach(el => {

        const key = el.dataset.i18n;

        if(t[key]){
            el.textContent = t[key];
        }

    });

    const search = $('#productSearch');

    if(search){
        search.placeholder = t.search;
    }

}

function showSuggestions(query){

    const suggestions = $('#suggestions');

    if(!suggestions) return;

    suggestions.innerHTML = "";

    const clean = query.trim().toLowerCase();

    if(!clean){

        suggestions.innerHTML = "<p class='lead'>Tipp: Gib z. B. Apfel, Banane, Reis oder Hähnchen ein.</p>";

        return;

    }

    const results = foodDatabase.filter(f =>
        f.name.toLowerCase().includes(clean)
    );

    if(!results.length){

        suggestions.innerHTML = "<p class='lead'>Keine Vorschläge gefunden.</p>";

        return;

    }

    results.forEach(food => {

        const item = document.createElement('div');

        item.className = 'suggestion';

        item.innerHTML = `
            <div>
                <strong>${food.name}</strong><br>
                <span>${food.serving} · ${food.calories} kcal</span>
            </div>

            <button type="button">Hinzufügen</button>
        `;

        item.addEventListener('click', () => addFood(food));

        suggestions.appendChild(item);

    });

}

function addFood(food){

    trackedFoods.push({...food});

    renderFoods();

}

function removeFood(index){

    trackedFoods.splice(index,1);

    renderFoods();

}

window.removeFood = removeFood;

function renderFoods(){

    const foodList = $('#foodList');

    if(!foodList) return;

    foodList.innerHTML = "";

    if(!trackedFoods.length){

        foodList.innerHTML = "<p class='lead'>Noch keine Lebensmittel eingetragen.</p>";

    }

    let calories = 0;

    trackedFoods.forEach((food,i) => {

        calories += food.calories;

        const item = document.createElement('div');

        item.className = 'food-item';

        item.innerHTML = `
            <div>
                <strong>${food.name}</strong><br>
                <span>${food.calories} kcal</span>
            </div>

            <button class="remove-btn" onclick="removeFood(${i})">
                Löschen
            </button>
        `;

        foodList.appendChild(item);

    });

    if($('#totalCalories')){
        $('#totalCalories').textContent = calories;
    }

}

function initCalories(){

    const search = $('#foodSearch');

    if(search){

        showSuggestions('');

        search.addEventListener('input', e =>
            showSuggestions(e.target.value)
        );

    }

    renderFoods();

}

function saveCart(){

    localStorage.setItem('fittrackCart', JSON.stringify(cart));

    updateCartCount();

}

function updateCartCount(){

    const n = cart.reduce((s,i)=>s+i.qty,0);

    $$('[data-cart-count]').forEach(e => e.textContent = n);

}

function addToCart(id){

    const product = products.find(p => p.id === id);

    const item = cart.find(i => i.id === id);

    if(item){
        item.qty++;
    } else {
        cart.push({...product, qty:1});
    }

    saveCart();

    renderCart();

}

window.addToCart = addToCart;

function removeFromCart(id){

    cart = cart.filter(i => i.id !== id);

    saveCart();

    renderCart();

}

window.removeFromCart = removeFromCart;

function renderProducts(){

    const wrap = $('#productGrid');

    if(!wrap) return;

    wrap.innerHTML = '';

    products.forEach(p => {

        const card = document.createElement('article');

        card.className = 'box col-3 product-card';

        card.innerHTML = `
            <div class="product-media">${p.icon}</div>

            <div class="product-content">

                <span class="tag">${p.cat}</span>

                <h3>${p.name}</h3>

                <p>${p.desc}</p>

                <div class="rating">${p.rating}</div>

                <div class="buy-row">

                    <span class="price">€${p.price.toFixed(2)}</span>

                    <button onclick="addToCart(${p.id})">
                        ${(dict[lang]||dict.de).buy}
                    </button>

                </div>

            </div>
        `;

        wrap.appendChild(card);

    });

}

function renderCart(){

    const list = $('#cartItems');

    if(!list) return;

    list.innerHTML = '';

    if(!cart.length){

        list.innerHTML = `<p class="lead">${(dict[lang]||dict.de).empty}</p>`;

    }

    let sum = 0;

    cart.forEach(item => {

        sum += item.price * item.qty;

        const row = document.createElement('div');

        row.className = 'cart-item';

        row.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <span>${item.qty} × €${item.price.toFixed(2)}</span>
            </div>

            <button class="remove-btn" onclick="removeFromCart(${item.id})">
                ×
            </button>
        `;

        list.appendChild(row);

    });

    if($('#cartTotal')){
        $('#cartTotal').textContent = `€${sum.toFixed(2)}`;
    }

}

async function initShop(){

    try {

        const response = await fetch("http://localhost:3000/products");

        products = await response.json();

        renderProducts();

        renderCart();

    } catch(error){

        console.error("Fehler beim Laden:", error);

    }

    $('#productSearch')?.addEventListener('input',renderProducts);

    $('#categoryFilter')?.addEventListener('change',renderProducts);

}

function initLogin(){

    const loginTab = $('#loginTab');
    const registerTab = $('#registerTab');
    const title = $('#authTitle');
    const btn = $('#authSubmit');
    const nameInput = $('#authName');
    const form = $('#authForm');

    let mode = "login";

    function setMode(newMode){
        mode = newMode;

        loginTab?.classList.toggle("active", mode === "login");
        registerTab?.classList.toggle("active", mode === "register");

        if(title){
            title.textContent = mode === "login" ? "Einloggen" : "Account erstellen";
        }

        if(btn){
            btn.textContent = mode === "login" ? "Einloggen" : "Registrieren";
        }

        if(nameInput){
            nameInput.style.display = mode === "login" ? "none" : "block";
        }
    }

    loginTab?.addEventListener("click", () => setMode("login"));
    registerTab?.addEventListener("click", () => setMode("register"));

    form?.addEventListener("submit", async e => {
        e.preventDefault();

        const username = $('#authName')?.value || "User";
        const email = $('#authEmail').value.trim();
        const password = $('#authPassword').value.trim();

        const endpoint = mode === "login" ? "login" : "register";

        try {
            const response = await fetch(`http://localhost:3000/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const data = await response.json();

            alert(data.message);

            if(response.ok && mode === "login"){
                localStorage.setItem("fittrackUser", JSON.stringify(data.user));
            }

        } catch(error) {
            alert("Fehler beim Verbinden mit dem Backend.");
        }
    });

    setMode("login");
}

document.addEventListener('DOMContentLoaded', () => {

    initNav();

    initCalories();

    initShop();

    initLogin();

});