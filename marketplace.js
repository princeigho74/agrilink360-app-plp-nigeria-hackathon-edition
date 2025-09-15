// marketplace.js

let currentUser = null;

// Simulate localStorage for this demo
if(!localStorage.users) {
    localStorage.users = JSON.stringify([
        {id:'u1',name:'Farmer John',email:'farmer@example.com',password:'123456',role:'farmer',freeTrialCount:0},
        {id:'u2',name:'Buyer Jane',email:'buyer@example.com',password:'123456',role:'buyer',freeTrialCount:0}
    ]);
}

function getUsers(){ return JSON.parse(localStorage.users); }
function saveUsers(users){ localStorage.users = JSON.stringify(users); }

// ---------- Landing / Login ----------
const loginForm = document.getElementById('loginForm');
if(loginForm){
    loginForm.onsubmit = (e)=>{
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const user = getUsers().find(u=>u.email===email && u.password===password && u.role===role);
        const err = document.getElementById('loginError');
        if(user){
            currentUser = user;
            localStorage.currentUser = JSON.stringify(user);
            if(role==='farmer') window.location='farmer-dashboard.html';
            else window.location='buyer-dashboard.html';
        }else{
            err.textContent='Invalid credentials!';
            err.classList.remove('hidden');
        }
    }
}

// ---------- Logout ----------
function logout(){
    localStorage.removeItem('currentUser');
    window.location='index.html';
}

// ---------- Farmer Dashboard ----------
if(window.location.href.includes('farmer-dashboard.html')){
    currentUser = JSON.parse(localStorage.currentUser);

    const addProductForm = document.getElementById('addProductForm');
    const productMsg = document.getElementById('productMsg');
    addProductForm.onsubmit = (e)=>{
        e.preventDefault();
        const crop = document.getElementById('crop').value;
        const quantity = document.getElementById('quantity').value;
        const location = document.getElementById('location').value;
        const price = document.getElementById('price').value;
        const desc = document.getElementById('desc').value;

        if(currentUser.freeTrialCount < 3){
            currentUser.freeTrialCount++;
            updateUser(currentUser);
            productMsg.textContent=`Product "${crop}" added for free! (${currentUser.freeTrialCount}/3 free)`;
        } else {
            productMsg.textContent=`Free trial over! Please pay to add more products.`;
            alert('Open payment modal here (Paystack/Flutterwave integration)');
        }
    }

    function updateUser(user){
        const users = getUsers();
        const idx = users.findIndex(u=>u.id===user.id);
        users[idx]=user;
        saveUsers(users);
        localStorage.currentUser = JSON.stringify(user);
    }

    // IoT Spoilage Alerts simulation
    function simulateAlert(){
        const alertsContainer = document.getElementById('alertsContainer');
        const alertDiv = document.createElement('div');
        alertDiv.className='bg-yellow-100 p-2 rounded';
        alertDiv.textContent=`⚠️ ${['Maize','Tomatoes','Beans'][Math.floor(Math.random()*3)]} at risk of spoilage!`;
        alertsContainer.prepend(alertDiv);
    }

    window.simulateAlert = simulateAlert;
}

// ---------- Buyer Dashboard ----------
if(window.location.href.includes('buyer-dashboard.html')){
    currentUser = JSON.parse(localStorage.currentUser);

    // Sample products
    let products = [
        {id:'p1',crop:'Maize',quantity:'100kg',location:'Lagos',price:50,desc:'Freshly harvested yellow maize'},
        {id:'p2',crop:'Tomatoes',quantity:'200kg',location:'Abuja',price:80,desc:'Ripe tomatoes'},
        {id:'p3',crop:'Beans',quantity:'150kg',location:'Kano',price:65,desc:'Well-dried beans'}
    ];

    const productList = document.getElementById('productList');
    products.forEach(p=>{
        const card = document.createElement('div');
        card.className='bg-white p-3 rounded shadow';
        card.innerHTML=`
            <h3 class="font-bold">${p.crop}</h3>
            <p class="text-sm text-gray-600">${p.desc}</p>
            <p class="text-sm">Quantity: ${p.quantity}</p>
            <p class="text-sm">Location: ${p.location}</p>
            <p class="text-sm">Price: $${p.price}</p>
            <button class="mt-2 px-3 py-1 bg-green-600 text-white rounded" onclick="buyProduct('${p.id}')">Buy</button>
        `;
        productList.appendChild(card);
    });

    window.buyProduct = (productId)=>{
        if(currentUser.freeTrialCount < 3){
            currentUser.freeTrialCount++;
            updateUser(currentUser);
            alert(`Product purchased for free! (${currentUser.freeTrialCount}/3 free)`);
        } else {
            alert('Free trial over! Please pay to purchase. Open payment modal here.');
        }
    }

    function updateUser(user){
        const users = getUsers();
        const idx = users.findIndex(u=>u.id===user.id);
        users[idx]=user;
        saveUsers(users);
        localStorage.currentUser = JSON.stringify(user);
    }
}

