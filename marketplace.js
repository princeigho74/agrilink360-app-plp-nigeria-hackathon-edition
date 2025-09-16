/* marketplace.js
   React (in-browser) app. Keep this file as-is.
   NOTE: This is a demo/prototype. Replace payment keys and add backend verification in production.
*/

const { useState, useEffect, useRef } = React;

/* ---------- Utilities ---------- */
function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
function currencyFmt(n = 0){ return new Intl.NumberFormat('en-NG', { style:'currency', currency:'NGN' }).format(n); }

const storage = {
  load(key, fallback){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch{ return fallback; } },
  save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
};

/* ---------- Nigerian states -> sample cities ----------
   This contains 36 states + FCT and a few example cities each.
   You can extend further as needed.
*/
const STATES_AND_CITIES = {
  "Abia":["Aba","Umuahia","Ohafia"],
  "Adamawa":["Yola","Mubi","Ganye"],
  "Akwa Ibom":["Uyo","Eket","Ikot Ekpene"],
  "Anambra":["Awka","Onitsha","Nnewi"],
  "Bauchi":["Bauchi","Azare","Misau"],
  "Bayelsa":["Yenagoa","Brass","Ogbia"],
  "Benue":["Makurdi","Gboko","Otukpo"],
  "Borno":["Maiduguri","Bama","Damboa"],
  "Cross River":["Calabar","Ikom","Ogoja"],
  "Delta":["Asaba","Warri","Sapele"],
  "Ebonyi":["Abakaliki","Afikpo","Onicha"],
  "Edo":["Benin City","Auchi","Ekpoma"],
  "Ekiti":["Ado-Ekiti","Ikere","Ikole"],
  "Enugu":["Enugu","Nsukka","Agbani"],
  "FCT":["Abuja","Gwagwalada","Kuje"],
  "Gombe":["Gombe","Kumo","Balanga"],
  "Imo":["Owerri","Orlu","Okigwe"],
  "Jigawa":["Dutse","Hadejia","Kiyawa"],
  "Kaduna":["Kaduna","Zaria","Kachia"],
  "Kano":["Kano","Wudil","Bichi"],
  "Katsina":["Katsina","Funtua","Kankia"],
  "Kebbi":["Birnin Kebbi","Argungu","Yauri"],
  "Kogi":["Lokoja","Ajaokuta","Okene"],
  "Kwara":["Ilorin","Offa","Ilorin East"],
  "Lagos":["Ikeja","Lagos Island","Ikorodu"],
  "Nasarawa":["Lafia","Akwanga","Keffi"],
  "Niger":["Minna","Suleja","Kontagora"],
  "Ogun":["Abeokuta","Ijebu-Ode","Sagamu"],
  "Ondo":["Akure","Owo","Ondo"],
  "Osun":["Osogbo","Ile-Ife","Ilesa"],
  "Oyo":["Ibadan","Ogbomoso","Oyo"],
  "Plateau":["Jos","Bukuru","Pankshin"],
  "Rivers":["Port Harcourt","Bonny","Opobo"],
  "Sokoto":["Sokoto","Gwadabawa","Tambuwal"],
  "Taraba":["Jalingo","Sardauna","Bali"],
  "Yobe":["Damaturu","Gashua","Potiskum"],
  "Zamfara":["Gusau","Talata-Mafara","Kaura Namoda"]
};

/* ---------- Initial demo products ----------
   Link products to different city,state pairs.
*/
const DEFAULT_PRODUCTS = [
  { id: uid('p'), name: "Yellow Maize (100kg)", qty: "100kg", location: "Ikeja, Lagos", price: 50000, desc: "Freshly harvested yellow maize", farmerId: "demo_farmer", sensor:{ temp:28, humidity:70 }},
  { id: uid('p'), name: "Tomatoes (200kg)", qty: "200kg", location: "Kano, Kano", price: 35000, desc: "Ripe tomatoes from local farms", farmerId: "ngozi_farm", sensor:{ temp:26, humidity:78 }},
  { id: uid('p'), name: "Beans (150kg)", qty: "150kg", location: "Kaduna, Kaduna", price: 42000, desc: "Protein-rich beans, well-dried", farmerId: "ade_agro", sensor:{ temp:27, humidity:65 }},
  { id: uid('p'), name: "Rice (50kg)", qty: "50kg", location: "Lafia, Nasarawa", price: 42000, desc: "Clean destoned local rice", farmerId: "rice_farm", sensor:{ temp:25, humidity:60 }},
  { id: uid('p'), name: "Pepper (crate)", qty: "1 crate", location: "Abeokuta, Ogun", price: 15000, desc: "Hot red peppers", farmerId: "pepper_farm", sensor:{ temp:27, humidity:70 }},
  { id: uid('p'), name: "Bottled Water (box)", qty: "12 x 500ml", location: "Ikeja, Lagos", price: 5000, desc: "Clean bottled water", farmerId: "water_co", sensor:{ temp:24, humidity:55 }},
  { id: uid('p'), name: "Onions (50kg)", qty: "50kg", location: "Sokoto, Sokoto", price: 18000, desc: "Fresh purple onions", farmerId: "onion_farm", sensor:{ temp:25, humidity:60 }},
  { id: uid('p'), name: "Garri (25kg)", qty: "25kg", location: "Warri, Delta", price: 25000, desc: "Ijebu garri", farmerId: "garri_maker", sensor:{ temp:26, humidity:65 }},
  { id: uid('p'), name: "Cassava (100kg)", qty: "100kg", location: "Ado-Ekiti, Ekiti", price: 22000, desc: "High-yield cassava tubers", farmerId: "cassava_farm", sensor:{ temp:26, humidity:68 }},
  { id: uid('p'), name: "Fish (per kg)", qty: "1kg", location: "Port Harcourt, Rivers", price: 3500, desc: "Fresh catfish", farmerId: "fish_vendor", sensor:{ temp:5, humidity:80 }},
  { id: uid('p'), name: "Bush Meat (pack)", qty: "varies", location: "Calabar, Cross River", price: 50000, desc: "Smoked bush meat (local)", farmerId: "bush_hunter", sensor:{ temp:28, humidity:75 }},
];

/* ---------- Demo users (persisted) ---------- */
const DEFAULT_USERS = [
  { id: "demo_farmer", type: "farmer", name: "Uche Farms", email: "uche@demo.com", password: "farm123" },
  { id: "buyer_demo", type: "buyer", name: "Market Buyer", email: "buyer@demo.com", password: "buy123" }
];

/* ---------- Payments (demo wrappers) ---------- */
function payWithPaystack(amountNGN, email, onSuccess, onFailure){
  try {
    const handler = PaystackPop.setup({
      key: 'pk_test_xxxxxxxxxxxxxxxxxxxxx', // TODO: replace with real key
      email: email || 'buyer@example.com',
      amount: amountNGN * 100,
      currency: 'NGN',
      callback: function(response){ onSuccess && onSuccess(response); },
      onClose: function(){ onFailure && onFailure({ cancelled:true }); }
    });
    handler.openIframe();
  } catch(e){
    alert('Paystack not reachable. Simulating success.');
    onSuccess && onSuccess({ reference: 'demo_ps_' + Date.now() });
  }
}
function payWithFlutterwave(amountNGN, email, onSuccess, onFailure){
  try {
    FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxx-X",
      tx_ref: 'agri_' + Date.now(),
      amount: amountNGN,
      currency: "NGN",
      payment_options: "card,ussd,banktransfer",
      customer: { email: email || 'buyer@example.com', phone_number: "08000000000", name: "Agri Buyer" },
      callback: function(data){ onSuccess && onSuccess(data); },
      onclose: function(){ onFailure && onFailure({ cancelled:true }); }
    });
  } catch(e){
    alert('Flutterwave not reachable. Simulating success.');
    onSuccess && onSuccess({ tx_ref: 'demo_fw_' + Date.now() });
  }
}

/* ---------- UI: Toast ---------- */
function ToastArea({ toasts, remove }) {
  return (
    <div className="fixed right-4 bottom-4 w-96 space-y-2 z-50">
      {toasts.map(t => (
        <div key={t.id} className="card border-l-4" style={{ borderColor: '#f59e0b' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-gray-600">{t.msg}</div>
            </div>
            <div>
              <button className="text-sm text-gray-500" onClick={()=>remove(t.id)}>✕</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Header ---------- */
function Header({ current, setCurrent, user, signout }) {
  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
      <div className="container-max mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-green-600 text-white flex items-center justify-center font-bold">A</div>
          <div>
            <div className="font-bold">AgriLink360</div>
            <div className="text-xs text-gray-500">Farm → Market • IoT spoilage demo</div>
          </div>
        </div>

        <nav className="flex items-center gap-2 text-sm">
          <button className={`px-3 py-2 rounded ${current==='market'?'bg-green-50':''}`} onClick={()=>setCurrent('market')}>Marketplace</button>
          <button className={`px-3 py-2 rounded ${current==='iot'?'bg-green-50':''}`} onClick={()=>setCurrent('iot')}>IoT Monitor</button>
          <button className={`px-3 py-2 rounded ${current==='dashboard'?'bg-green-50':''}`} onClick={()=>setCurrent('dashboard')}>Dashboard</button>
          <button className={`px-3 py-2 rounded ${current==='applicants'?'bg-green-50':''}`} onClick={()=>setCurrent('applicants')}>Applicant Selection</button>

          { user ? (
            <div className="flex items-center gap-2 ml-3">
              <div className="text-sm text-gray-700">{user.name}</div>
              <button className="px-3 py-1 border rounded text-sm" onClick={signout}>Sign out</button>
            </div>
          ) : (
            <button className="px-3 py-1 border rounded" onClick={()=>setCurrent('auth')}>Sign in / Register</button>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ---------- Auth (register/login) ---------- */
function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); // login | register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [type, setType] = useState('farmer');

  function register(e){
    e.preventDefault();
    if(!name || !email || !pw){ alert('Fill all fields'); return; }
    const users = storage.load('users', DEFAULT_USERS);
    if(users.find(u=>u.email===email)){ alert('Account exists; please login'); return; }
    const id = uid(type);
    const u = { id, type, name, email, password: pw };
    users.push(u);
    storage.save('users', users);
    onLogin(u);
  }

  function login(e){
    e.preventDefault();
    const users = storage.load('users', DEFAULT_USERS);
    const u = users.find(x=>x.email===email && x.password===pw);
    if(!u){ alert('Invalid login'); return; }
    onLogin(u);
  }

  return (
    <div className="container-max mx-auto p-6">
      <div className="card max-w-md mx-auto">
        <h3 className="font-semibold mb-3">{mode==='login' ? 'Sign In' : 'Register'}</h3>
        <form onSubmit={mode==='login'?login:register} className="space-y-3">
          {mode==='register' && (
            <div>
              <label className="text-xs text-gray-600">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-600">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="text-xs text-gray-600">Password</label>
            <input value={pw} onChange={e=>setPw(e.target.value)} type="password" className="w-full p-2 border rounded" />
          </div>

          {mode==='register' && (
            <div>
              <label className="text-xs text-gray-600">Account type</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full p-2 border rounded">
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{mode==='login' ? 'Sign In' : 'Create Account'}</button>
            <button type="button" className="text-sm text-gray-600 underline" onClick={()=>setMode(mode==='login'?'register':'login')}>
              {mode==='login' ? 'Need an account?' : 'Have an account?'}
            </button>
          </div>
        </form>
        <div className="text-xs text-gray-500 mt-3">Demo: farmer: uche@demo.com/farm123 • buyer: buyer@demo.com/buy123</div>
      </div>
    </div>
  );
}

/* ---------- Marketplace ---------- */
function Marketplace({ products, onBuy, query, setQuery, filters, setFilters }) {
  const uniqueLocations = [...new Set(products.map(p=>p.location))];

  const filtered = products.filter(p => {
    const q = (query || '').trim().toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.desc?.toLowerCase().includes(q) || p.qty?.toLowerCase().includes(q);
    const matchLoc = !filters.location || p.location === filters.location;
    return matchQ && matchLoc;
  });

  return (
    <div className="container-max mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Marketplace</h2>
        <div className="text-sm text-gray-600">Find local harvests & suppliers</div>
      </div>

      <div className="flex gap-3 mb-6 stack-sm">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search product, description or qty" className="flex-1 p-2 border rounded" />
        <select value={filters.location||''} onChange={e=>setFilters(f=>({ ...f, location: e.target.value || null }))} className="p-2 border rounded">
          <option value="">All locations</option>
          {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(p => (
          <div key={p.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-lg">{p.name}</div>
                <div className="text-xs text-gray-500">{p.qty} • {p.location}</div>
              </div>
              {p.spoilage && <div className="text-red-600 font-semibold">⚠ Spoilage</div>}
            </div>
            <p className="text-sm text-gray-700 mt-2">{p.desc}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="font-bold text-lg">{currencyFmt(p.price)}</div>
              <div className="flex gap-2">
                <button onClick={()=>onBuy(p)} className="px-3 py-1 bg-green-600 text-white rounded">Buy</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center text-gray-500 p-8 bg-white rounded">No products found</div>}
      </div>
    </div>
  );
}

/* ---------- Farmer Dashboard ---------- */
function DashboardArea({ user, products, onAddProduct, onSimulateSensor, analytics }) {
  const myProducts = products.filter(p => p.farmerId === user?.id);

  return (
    <div className="container-max mx-auto p-6 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-semibold mb-3">My Products</h2>
        <div className="space-y-3">
          {myProducts.length === 0 && <div className="text-gray-500 p-4 bg-white rounded">No products yet — add one below.</div>}
          {myProducts.map(p=>(
            <div key={p.id} className={`card ${p.spoilage ? 'border-l-4 border-red-400' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.qty} • {p.location}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{currencyFmt(p.price)}</div>
                  {p.spoilage && <div className="text-red-600 text-sm">Spoilage risk</div>}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{p.desc}</p>
              <div className="mt-3 flex gap-2">
                <button className="px-2 py-1 border rounded text-sm" onClick={()=>onSimulateSensor(p.id)}>Simulate Sensor</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Add new product</h3>
          <ProductForm onAdd={onAddProduct} farmer={user}/>
        </div>
      </div>

      <aside className="bg-white rounded shadow p-4">
        <h3 className="font-semibold">Analytics</h3>
        <div className="text-sm text-gray-600 mt-2">
          <div>Products listed: <strong>{myProducts.length}</strong></div>
          <div>Platform views: <strong>{analytics.views}</strong></div>
          <div>Matches (demo): <strong>{analytics.matches}</strong></div>
          <div className="text-xs text-gray-400 mt-3">Tip: Use the IoT Monitor to test spoilage alerts.</div>
        </div>
      </aside>
    </div>
  );
}

/* ---------- Product Form with State -> City dropdown ---------- */
function ProductForm({ onAdd, farmer }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [tempThreshold, setTempThreshold] = useState(30);
  const [humidityThreshold, setHumidityThreshold] = useState(80);

  function submit(e){
    e.preventDefault();
    if(!name || !qty || !state || !city || !price){ alert('Please fill required fields'); return; }
    const newP = {
      id: uid('p'),
      name,
      qty,
      location: `${city}, ${state}`,
      price: Number(price),
      desc,
      farmerId: farmer.id,
      sensor: { temp: Number(tempThreshold), humidity: Number(humidityThreshold) }
    };
    onAdd(newP);
    setName(''); setQty(''); setState(''); setCity(''); setPrice(''); setDesc('');
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <div>
        <label className="text-xs text-gray-600">Product name</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600">Quantity</label>
          <input value={qty} onChange={e=>setQty(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Price (NGN)</label>
          <input value={price} onChange={e=>setPrice(e.target.value)} type="number" className="w-full p-2 border rounded" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600">State</label>
          <select value={state} onChange={e=>{ setState(e.target.value); setCity(''); }} className="w-full p-2 border rounded">
            <option value="">Select state</option>
            {Object.keys(STATES_AND_CITIES).map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600">City</label>
          <select value={city} onChange={e=>setCity(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Select city</option>
            {state && STATES_AND_CITIES[state].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-600">Description</label>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} className="w-full p-2 border rounded" rows="3"></textarea>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600">Temp threshold (°C)</label>
          <input value={tempThreshold} onChange={e=>setTempThreshold(e.target.value)} type="number" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Humidity threshold (%)</label>
          <input value={humidityThreshold} onChange={e=>setHumidityThreshold(e.target.value)} type="number" className="w-full p-2 border rounded" />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add Product</button>
      </div>
    </form>
  );
}

/* ---------- Product Detail Modal ---------- */
function ProductModal({ product, close, onBuy }) {
  if(!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <div className="text-xs text-gray-500">{product.qty} • {product.location}</div>
          </div>
          <button onClick={close} className="text-gray-500">✕</button>
        </div>
        <p className="mt-3 text-sm text-gray-700">{product.desc}</p>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-2xl font-bold">{currencyFmt(product.price)}</div>
          <div className="flex gap-2">
            <button onClick={()=>onBuy(product)} className="px-3 py-2 bg-green-600 text-white rounded">Buy</button>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">Sensor thresholds — Temp: {product.sensor?.temp}°C • Humidity: {product.sensor?.humidity}%</div>
      </div>
    </div>
  );
}

/* ---------- IoT Monitor ---------- */
function IoTMonitor({ products, updateSensorState, sendToast }) {
  const [running, setRunning] = useState(false);
  const [intervalMs, setIntervalMs] = useState(2500);
  const intervalRef = useRef(null);

  useEffect(()=> {
    if(running){
      intervalRef.current = setInterval(()=> {
        if(products.length === 0) return;
        const p = products[Math.floor(Math.random()*products.length)];
        if(!p) return;
        const tempJitter = (Math.random()*6 - 2); // -2..+4
        const humJitter = (Math.random()*8 - 3);
        const newTemp = Math.round(((p.sensor?.temp || 25) + tempJitter) * 10)/10;
        const newHum = Math.round(((p.sensor?.humidity || 70) + humJitter) * 10)/10;
        updateSensorState(p.id, { temp: newTemp, humidity: newHum });
        if(newTemp >= (p.sensor?.temp || 30) || newHum >= (p.sensor?.humidity || 85)) {
          sendToast({ title: 'IoT Alert', msg: `${p.name} at ${p.location} flagged for spoilage (T:${newTemp}°C H:${newHum}%)` });
        }
      }, intervalMs);
    }
    return ()=> clearInterval(intervalRef.current);
  }, [running, intervalMs, products]);

  return (
    <div className="container-max mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">IoT Spoilage Monitor</h2>
        <div className="flex gap-2">
          <input type="number" value={intervalMs} onChange={e=>setIntervalMs(Number(e.target.value))} className="p-2 border rounded w-28" />
          <button onClick={()=>setRunning(r=>!r)} className="px-3 py-2 rounded bg-green-600 text-white">{running ? 'Stop' : 'Start'} Simulation</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className={`card ${p.spoilage ? 'border-l-4 border-red-400' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-gray-500">{p.location} • {p.qty}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">Temp: <strong>{p.sensor?.temp ?? '—'}°C</strong></div>
                <div className="text-sm">Humidity: <strong>{p.sensor?.humidity ?? '—'}%</strong></div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">Thresholds: Temp ≥ {p.sensor?.temp}°C or Humidity ≥ {p.sensor?.humidity}% triggers an alert.</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Applicant Selection (AI-like demo) ----------
   Allows uploading/pasting candidate text and scores by simple heuristics:
   - experienceYears (look for digits + yrs)
   - skills presence (count of required skills)
   - education level keywords
   This produces a ranked list and short explanation per candidate.
*/
function ApplicantSelection() {
  const [candidates, setCandidates] = useState([]);
  const [text, setText] = useState('');
  const requiredSkills = ["javascript","python","sql","data","machine learning","agriculture","iot","cloud","react","node"];

  function extractYears(s){
    const m = s.match(/(\d+)\s*(years|yrs|year|yr)/i);
    return m ? Number(m[1]) : 0;
  }
  function scoreCandidate(text){
    const t = text.toLowerCase();
    const years = extractYears(t);
    let skillCount = 0;
    for(const sk of requiredSkills) if(t.includes(sk)) skillCount++;
    const degree = t.includes("phd") ? 3 : t.includes("master") ? 2 : t.includes("bachelor") ? 1 : 0;
    // weighted scoring
    return Math.round( years*1.5 + skillCount*5 + degree*8 );
  }

  function addCandidate(){
    if(!text.trim()){ alert('Paste candidate resume / profile'); return; }
    const s = scoreCandidate(text);
    const c = { id: uid('c'), raw: text, score: s, summary: `Score ${s}: ${extractYears(text)}yrs, skills matched` };
    setCandidates(cs => [c, ...cs].sort((a,b)=>b.score-a.score));
    setText('');
  }

  return (
    <div className="container-max mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-3">AI-driven Applicant Selection (demo)</h2>
      <p className="text-sm text-gray-600 mb-3">Paste resumes, cover letters, or candidate profiles; the tool will score & rank them using simple heuristics. Replace with ML APIs for production.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste resume or profile here..." rows="8" className="w-full p-2 border rounded"></textarea>
          <div className="mt-3 flex justify-end">
            <button onClick={addCandidate} className="px-4 py-2 bg-green-600 text-white rounded">Add Candidate</button>
          </div>
        </div>

        <aside className="card">
          <div className="font-semibold mb-2">Ranking Tips</div>
          <ul className="text-sm text-gray-600 list-disc pl-4">
            <li>More years of relevant experience increase score</li>
            <li>Skills matched (javascript, python, iot, cloud) increase score</li>
            <li>Higher education gives extra points</li>
          </ul>
        </aside>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Ranked candidates</h3>
        <div className="space-y-3">
          {candidates.length === 0 && <div className="text-gray-500">No candidates yet</div>}
          {candidates.map(c=>(
            <div key={c.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">Candidate — {c.score} pts</div>
                  <div className="text-xs text-gray-500">{c.summary}</div>
                </div>
                <div className="text-xs text-gray-400">Ranked</div>
              </div>
              <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{c.raw}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Root App ---------- */
function App(){
  // persisted pieces
  const [products, setProducts] = useState(()=> storage.load('products', DEFAULT_PRODUCTS));
  const [users, setUsers] = useState(()=> storage.load('users', DEFAULT_USERS));
  const [orders, setOrders] = useState(()=> storage.load('orders', []));
  const [analytics, setAnalytics] = useState(()=> storage.load('analytics', { views:0, matches:0 }));
  const [session, setSession] = useState(()=> storage.load('session', null));

  const [current, setCurrent] = useState('market'); // market | iot | dashboard | auth | applicants
  const [toasts, setToasts] = useState([]);
  const [modalProduct, setModalProduct] = useState(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({}); // { location: "City, State" }

  // persist
  useEffect(()=> storage.save('products', products), [products]);
  useEffect(()=> storage.save('users', users), [users]);
  useEffect(()=> storage.save('orders', orders), [orders]);
  useEffect(()=> storage.save('analytics', analytics), [analytics]);
  useEffect(()=> storage.save('session', session), [session]);

  // toast helpers
  function pushToast(t){ const id = uid('t'); setToasts(ts => [{ id, ...t }, ...ts].slice(0,6)); setTimeout(()=> setToasts(ts=>ts.filter(x=>x.id!==id)), 9000); }
  function removeToast(id){ setToasts(ts=>ts.filter(t=>t.id!==id)); }

  function signout(){ setSession(null); setCurrent('market'); }

  function addProduct(p){
    setProducts(ps => [p, ...ps]);
    setAnalytics(a => ({ ...a, matches: a.matches + 1 }));
    pushToast({ title: 'Product listed', msg: `${p.name} added.` });
  }

  function simulateSensor(productId){
    setProducts(ps => ps.map(p=>{
      if(p.id !== productId) return p;
      const newTemp = (p.sensor?.temp ?? 25) + (Math.random()*6 + 3);
      const newHum = (p.sensor?.humidity ?? 70) + (Math.random()*6 + 3);
      const spoil = newTemp >= (p.sensor.temp || 30) || newHum >= (p.sensor.humidity || 85);
      if(spoil) pushToast({ title: 'Spoilage Alert', msg: `${p.name} flagged (T:${newTemp.toFixed(1)}°C, H:${Math.round(newHum)}%)` });
      return { ...p, sensor: { temp: Math.round(newTemp*10)/10, humidity: Math.round(newHum) }, spoilage: spoil };
    }));
  }

  function updateSensorState(productId, sensor){
    setProducts(ps => ps.map(p=>{
      if(p.id !== productId) return p;
      const spoil = sensor.temp >= (p.sensor.temp || 30) || sensor.humidity >= (p.sensor.humidity || 85);
      if(spoil) pushToast({ title: 'IoT Alert', msg: `${p.name} may be spoiling (T:${sensor.temp}°C, H:${sensor.humidity}%)` });
      return { ...p, sensor: { ...p.sensor, ...sensor }, spoilage: spoil };
    }));
  }

  function viewProduct(p){ setModalProduct(p); }

  // Buyer initiates purchase
  function buyProduct(product){
    setAnalytics(a => ({ ...a, views: a.views + 1 }));
    if(!session || session.type !== 'buyer'){ setCurrent('auth'); pushToast({ title: 'Sign in required', msg: 'Please sign in as buyer to complete purchase.' }); return; }

    // demo gating: first 2 purchases free
    const userOrders = orders.filter(o => o.buyerId === session.id);
    const freeUsed = userOrders.length;
    if(freeUsed >= 2){
      // choice modal simulated via confirm -> choose Paystack / Flutterwave
      const proceedPaid = (method) => {
        const onSuccess = (resp) => {
          const order = { id: uid('o'), productId: product.id, buyerId: session.id, amount: product.price, method, ref: resp.reference || resp.tx_ref || 'demo_ref', createdAt: Date.now() };
          setOrders(os => [order, ...os]);
          pushToast({ title: 'Payment success', msg: `Order placed for ${product.name}` });
        };
        if(method === 'paystack') payWithPaystack(product.price, session.email, onSuccess, ()=>pushToast({ title: 'Payment', msg: 'Payment cancelled' }));
        else payWithFlutterwave(product.price, session.email, onSuccess, ()=>pushToast({ title: 'Payment', msg: 'Payment cancelled' }));
      };

      const choose = confirm('You have used 2 free purchases. OK = Paystack, Cancel = Flutterwave');
      if(choose) proceedPaid('paystack'); else proceedPaid('flutterwave');

    } else {
      // free order
      const order = { id: uid('o'), productId: product.id, buyerId: session.id, amount: 0, method: 'free', ref: 'free_' + Date.now(), createdAt: Date.now() };
      setOrders(os => [order, ...os]);
      pushToast({ title: 'Order placed', msg: `${product.name} reserved — contact farmer to arrange delivery.` });
    }
  }

  function handleLogin(u){
    // if registering with no id, create one and persist into users
    let usersList = storage.load('users', DEFAULT_USERS);
    let found = usersList.find(x => x.email === u.email);
    if(!found){
      // create new
      const id = uid(u.type || 'user');
      const newU = { id, name: u.name||u.email, email: u.email, password: u.password||'demo', type: u.type||'buyer' };
      usersList.push(newU);
      storage.save('users', usersList);
      found = newU;
    }
    setSession(found);
    storage.save('session', found);
    pushToast({ title: 'Welcome', msg: `Signed in as ${found.name}` });
    setCurrent(found.type === 'farmer' ? 'dashboard' : 'market');
  }

  // Add demo: function to import default products if user deleted everything
  function resetProducts(){
    setProducts(DEFAULT_PRODUCTS);
    pushToast({ title:'Reset', msg:'Products restored to demo defaults' });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header current={current} setCurrent={setCurrent} user={session} signout={signout} />

      <main className="flex-1">
        { current === 'auth' && <div className="pt-6"><Auth onLogin={handleLogin} /></div> }

        { current === 'market' && (
          <Marketplace
            products={products}
            onBuy={buyProduct}
            query={query}
            setQuery={setQuery}
            filters={filters}
            setFilters={setFilters}
          />
        )}

        { current === 'dashboard' && (
          session && session.type === 'farmer' ? (
            <DashboardArea user={session} products={products} onAddProduct={(p)=>addProduct(p)} onSimulateSensor={simulateSensor} analytics={analytics} />
          ) : (
            <div className="container-max mx-auto p-6">
              <div className="card text-center">
                <div className="text-lg font-semibold">Dashboard</div>
                <div className="text-sm text-gray-600 mt-2">Sign in as a farmer to manage listings.</div>
              </div>
            </div>
          )
        )}

        { current === 'iot' && <IoTMonitor products={products} updateSensorState={updateSensorState} sendToast={(t)=>pushToast(t)} /> }

        { current === 'applicants' && <ApplicantSelection /> }
      </main>

      <footer className="bg-white text-xs text-gray-600 p-4 text-center">
        AgriLink360 — Prototype • Hackathon demo
      </footer>

      <ProductModal product={modalProduct} close={()=>setModalProduct(null)} onBuy={buyProduct} />
      <ToastArea toasts={toasts} remove={id=>removeToast(id)} />
    </div>
  );
}

/* ---------- Render ---------- */
ReactDOM.render(<App />, document.getElementById('root'));
