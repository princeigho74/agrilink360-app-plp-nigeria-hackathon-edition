// app.js — Marketplace + purchase flow with "3 free purchases" policy

/* ---------- Utilities ---------- */
function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
function currencyFmt(n){ return new Intl.NumberFormat('en-NG', { style:'currency', currency:'NGN' }).format(n); }
const storage = {
  load(key, fallback){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; } },
  save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
};

/* ---------- Demo data ---------- */
const products = storage.load('products', [
  { id: uid('p'), name: "Tomatoes (200kg)", price: 2000, farmer: "Ngozi Agro", location: "Lagos", qty: "200kg", desc: "Fresh tomatoes", sensor: { temp: 26, humidity: 78 } },
  { id: uid('p'), name: "Maize (100kg)", price: 5000, farmer: "Uche Farms", location: "Kano", qty: "100kg", desc: "Yellow maize", sensor: { temp: 28, humidity: 70 } },
  { id: uid('p'), name: "Beans (150kg)", price: 3500, farmer: "Ade Farm", location: "Rivers", qty: "150kg", desc: "White beans", sensor: { temp: 27, humidity: 65 } }
]);

const users = storage.load('users', [
  { id: 'buyer_demo', type: 'buyer', name: 'Demo Buyer', email: 'buyer@demo.com', password: 'buy123' },
  { id: 'farmer_demo', type: 'farmer', name: 'Demo Farmer', email: 'farmer@demo.com', password: 'farm123' }
]);

let orders = storage.load('orders', []); // recorded orders

/* ---------- Purchase policy ---------- */
/*
  - First 3 purchases are free per buyer (count tracked by buyerFreeCounts[buyerId]).
  - Starting from 4th purchase, buyer must pay (Paystack or Flutterwave).
*/
const FREE_PURCHASE_LIMIT = 3;
let buyerFreeCounts = storage.load('buyerFreeCounts', {}); // { buyerId: number }

/* ---------- Payment helpers (demo) ---------- */
// IMPORTANT: These functions use public/test keys in the browser. Always verify payment references server-side in production.

function payWithPaystack(amountNGN, email, onSuccess, onFailure){
  try {
    const handler = PaystackPop.setup({
      key: 'pk_test_xxxxxxxxxxxxxxxxxxxxx', // <-- REPLACE with your Paystack public key
      email: email || 'buyer@example.com',
      amount: amountNGN * 100,
      currency: 'NGN',
      callback: function(response){
        // NOTE: production => call server endpoint to verify the reference before marking order as paid
        onSuccess && onSuccess(response);
      },
      onClose: function(){ onFailure && onFailure({ cancelled: true }); }
    });
    handler.openIframe();
  } catch(err){
    alert('Paystack checkout error: ' + (err.message || err));
    onFailure && onFailure(err);
  }
}

function payWithFlutterwave(amountNGN, email, onSuccess, onFailure){
  try {
    FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxx-X", // <-- REPLACE with your Flutterwave public key
      tx_ref: 'agri_' + Date.now(),
      amount: amountNGN,
      currency: "NGN",
      payment_options: "card,ussd,banktransfer",
      customer: { email: email || 'buyer@example.com', phone_number: "08012345678", name: "Buyer" },
      callback: function(data){ onSuccess && onSuccess(data); },
      onclose: function(){ onFailure && onFailure({ cancelled:true }); }
    });
  } catch(err){
    alert('Flutterwave checkout error: ' + (err.message || err));
    onFailure && onFailure(err);
  }
}

/* ---------- UI rendering ---------- */
function renderProducts(){
  const list = document.getElementById('productList');
  if(!list) return;
  list.innerHTML = '';
  products.forEach(p => {
    const el = document.createElement('div');
    el.className = 'product';
    el.style.cssText = 'border:1px solid #ddd;padding:12px;border-radius:8px;margin:8px;display:inline-block;width:240px;background:#fff;';
    el.innerHTML = `
      <h3 style="margin:0 0 6px">${p.name}</h3>
      <div style="font-size:12px;color:#555">${p.qty} • ${p.location}</div>
      <p style="font-size:13px;color:#333;margin:8px 0">${p.desc}</p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-weight:700">${currencyFmt(p.price)}</div>
        <div>
          <button data-id="${p.id}" class="btn-buy" style="padding:6px 8px;margin-left:6px;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer">Buy</button>
        </div>
      </div>
    `;
    list.appendChild(el);
  });

  // hook buy buttons
  document.querySelectorAll('.btn-buy').forEach(btn => btn.addEventListener('click', handleBuyClick));
}

function createPaymentModal(product, buyerId, onChoice) {
  // onChoice(method) where method is 'paystack'|'flutterwave'
  // Create simple modal element
  const modal = document.createElement('div');
  modal.id = 'paymentModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:9999';
  modal.innerHTML = `
    <div style="background:#fff;padding:20px;border-radius:10px;max-width:460px;width:100%;">
      <h3 style="margin:0 0 8px">Paid purchase required</h3>
      <p style="margin:0 0 12px;font-size:13px;color:#555">You have used your ${FREE_PURCHASE_LIMIT} free purchases. Choose a payment method to complete this order for <strong>${currencyFmt(product.price)}</strong>.</p>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="paystackBtn" style="padding:8px 12px;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer">Pay with Paystack</button>
        <button id="flutterBtn" style="padding:8px 12px;background:#1e3a8a;color:#fff;border:none;border-radius:6px;cursor:pointer">Pay with Flutterwave</button>
        <button id="cancelPay" style="padding:8px 12px;background:#eee;border:none;border-radius:6px;cursor:pointer">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('paystackBtn').onclick = ()=>{
    onChoice('paystack');
    closePaymentModal();
  };
  document.getElementById('flutterBtn').onclick = ()=>{
    onChoice('flutterwave');
    closePaymentModal();
  };
  document.getElementById('cancelPay').onclick = ()=>{
    closePaymentModal();
  };
}

function closePaymentModal(){
  const m = document.getElementById('paymentModal');
  if(m) m.remove();
}

/* ---------- Purchase flow ---------- */
function handleBuyClick(e){
  const productId = e.currentTarget.getAttribute('data-id');
  const product = products.find(p=>p.id===productId);
  if(!product){ alert('Product not found'); return; }

  // In a real app, user must be signed-in. For demo: assume buyer_demo is the buyer
  const buyerId = 'buyer_demo';
  const buyer = users.find(u => u.id === buyerId) || { id: buyerId, name: 'Demo Buyer', email: 'buyer@demo.com' };

  const currentCount = buyerFreeCounts[buyerId] || 0;

  if(currentCount < FREE_PURCHASE_LIMIT){
    // free purchase flow
    const order = {
      id: uid('o'),
      productId: product.id,
      buyerId,
      amount: 0,
      method: 'free',
      createdAt: Date.now()
    };
    orders.unshift(order);
    buyerFreeCounts[buyerId] = currentCount + 1;
    persistOrdersAndCounts();
    alert(`Free order placed for ${product.name}. (${buyerFreeCounts[buyerId]}/${FREE_PURCHASE_LIMIT} free used)`);
  } else {
    // show modal to choose payment provider
    createPaymentModal(product, buyerId, (method) => {
      // on method chosen, run checkout
      if(method === 'paystack'){
        payWithPaystack(product.price, buyer.email, (resp) => {
          // success callback from Paystack (client-side)
          const paidOrder = { id: uid('o'), productId: product.id, buyerId, amount: product.price, method: 'paystack', reference: resp.reference, createdAt: Date.now() };
          orders.unshift(paidOrder);
          persistOrdersAndCounts();
          alert('Payment successful. Order recorded. Reference: ' + resp.reference);
        }, (err) => {
          alert('Paystack payment cancelled or failed.');
        });
      } else if(method === 'flutterwave'){
        payWithFlutterwave(product.price, buyer.email, (data) => {
          const paidOrder = { id: uid('o'), productId: product.id, buyerId, amount: product.price, method: 'flutterwave', reference: data.tx_ref || data.flw_ref || 'ref', createdAt: Date.now() };
          orders.unshift(paidOrder);
          persistOrdersAndCounts();
          alert('Payment successful. Order recorded.');
        }, (err) => {
          alert('Flutterwave payment cancelled or failed.');
        });
      }
    });
  }
}

/* ---------- Persistence ---------- */
function persistOrdersAndCounts(){
  storage.save('orders', orders);
  storage.save('buyerFreeCounts', buyerFreeCounts);
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', ()=> {
  // render product cards
  renderProducts();

  // write initial persistence
  storage.save('products', products);
  storage.save('users', users);
  storage.save('orders', orders);
  storage.save('buyerFreeCounts', buyerFreeCounts);
});
