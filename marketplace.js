<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>AgriLink360 — Marketplace & Dashboards</title>

  <!-- Tailwind -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html,body,#root { height: 100%; }
    body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
    textarea { min-height: 80px; }
  </style>
</head>
<body class="bg-gray-50">
  <div id="root"></div>

  <!-- React UMD -->
  <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <script type="text/babel">
  const { useState, useEffect, useRef } = React;

  /* ---------------------------
     Utilities & storage helpers
     --------------------------- */
  function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
  function currencyFmt(n){ return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n); }

  const storage = {
    load(k, fallback){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  };

  /* ---------------------------
     States & sample Cities (36 states + FCT)
     Note: cities list is a short sample per state — extend later as needed
     --------------------------- */
  const STATES_WITH_CITIES = {
    "Abia": ["Aba", "Umuahia", "Isiala-Ngwa"],
    "Adamawa": ["Yola", "Numan", "Mubi"],
    "Akwa Ibom": ["Uyo", "Eket", "Ikot Ekpene"],
    "Anambra": ["Awka", "Onitsha", "Nnewi"],
    "Bauchi": ["Bauchi", "Azare", "Misau"],
    "Bayelsa": ["Yenagoa", "Sagbama", "Odi"],
    "Benue": ["Makurdi", "Gboko", "Otukpo"],
    "Borno": ["Maiduguri", "Dikwa", "Biu"],
    "Cross River": ["Calabar", "Ikom", "Ogoja"],
    "Delta": ["Asaba", "Warri", "Sapele"],
    "Ebonyi": ["Abakaliki", "Afikpo", "Ikwo"],
    "Edo": ["Benin City", "Auchi", "Uromi"],
    "Ekiti": ["Ado-Ekiti", "Ikere", "Ise-Ekiti"],
    "Enugu": ["Enugu", "Nsukka", "Agbani"],
    "FCT": ["Abuja"],
    "Gombe": ["Gombe", "Kaltungo", "Yamaltu-Deba"],
    "Imo": ["Owerri", "Orlu", "Okigwe"],
    "Jigawa": ["Dutse", "Hadejia", "Kiyawa"],
    "Kaduna": ["Kaduna", "Zaria", "Kafanchan"],
    "Kano": ["Kano", "Wudil", "Gaya"],
    "Katsina": ["Katsina", "Funtua", "Daura"],
    "Kebbi": ["Birnin Kebbi", "Argungu", "Yauri"],
    "Kogi": ["Lokoja", "Ajaokuta", "Okene"],
    "Kwara": ["Ilorin", "Offa", "Lokoja"],
    "Lagos": ["Ikeja", "Lekki", "Agege"],
    "Nasarawa": ["Lafia", "Akwanga", "Keffi"],
    "Niger": ["Minna", "Bida", "Kontagora"],
    "Ogun": ["Abeokuta", "Ilaro", "Sagamu"],
    "Ondo": ["Akure", "Owo", "Ondo"],
    "Osun": ["Osogbo", "Ile-Ife", "Ilesa"],
    "Oyo": ["Ibadan", "Ogbomosho", "Oyo"],
    "Plateau": ["Jos", "Bukuru", "Pankshin"],
    "Rivers": ["Port Harcourt", "Obio-Akpor", "Bonny"],
    "Sokoto": ["Sokoto", "Gwadabawa", "Gusau"],
    "Taraba": ["Jalingo", "Wukari", "Bali"],
    "Yobe": ["Damaturu", "Potiskum", "Gashua"],
    "Zamfara": ["Gusau", "Kaura Namoda", "Anka"]
  };

  /* ---------------------------
     Default demo data
     --------------------------- */
  const DEFAULT_USERS = [
    { id: 'u_farmer_demo', role: 'farmer', name: 'Uche Farms', email: 'uche@demo.com', password: 'farm123', position: 'Owner', freeCount: 0 },
    { id: 'u_buyer_demo', role: 'buyer', name: 'Market Buyer', email: 'buyer@demo.com', password: 'buy123', position: 'Trader', freeCount: 0 }
  ];

  const DEFAULT_PRODUCTS = [
    { id: uid('p'), title: 'Yellow Maize (100kg)', qty: '100kg', state: 'Lagos', city: 'Ikeja', price: 50000, desc: 'Fresh yellow maize', farmerId: 'u_farmer_demo', sensor: { temp: 28, humidity: 70 } },
    { id: uid('p'), title: 'Tomatoes (200kg)', qty: '200kg', state: 'Abuja', city: 'Abuja', price: 35000, desc: 'Ripe tomatoes', farmerId: 'ngozi_demo', sensor: { temp: 26, humidity: 78 } },
    { id: uid('p'), title: 'Beans (150kg)', qty: '150kg', state: 'Kano', city: 'Kano', price: 42000, desc: 'Protein rich beans', farmerId: 'ade_demo', sensor: { temp: 27, humidity: 65 } }
  ];

  /* ---------------------------
     Ensure localStorage seeds
     --------------------------- */
  useEffect(() => {
    if(!storage.load('users')) storage.save('users', DEFAULT_USERS);
    if(!storage.load('products')) storage.save('products', DEFAULT_PRODUCTS);
    if(!storage.load('orders')) storage.save('orders', []);
  }, []);

  /* ---------------------------
     Header component
     --------------------------- */
  function Header({ user, onLogout, showMarketplaceAs }) {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-green-600 text-white flex items-center justify-center font-bold">A</div>
            <div>
              <div className="font-semibold">AgriLink360</div>
              <div className="text-xs text-gray-500">From Farm to Table</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => showMarketplaceAs('buyer')} className="px-3 py-2 rounded bg-green-50 text-sm">Buyer</button>
            <button onClick={() => showMarketplaceAs('farmer')} className="px-3 py-2 rounded bg-green-50 text-sm">Farmer</button>
            <button onClick={() => showMarketplaceAs('market')} className="px-3 py-2 rounded bg-white border text-sm">Marketplace</button>

            { user ? (
              <div className="flex items-center gap-3 px-3 py-1 border rounded">
                <div className="text-sm">{user.name}</div>
                <div className="text-xs text-gray-500">({user.role})</div>
                <button onClick={onLogout} className="ml-2 text-red-600 text-sm">Logout</button>
              </div>
            ) : (
              <button onClick={() => showMarketplaceAs('auth')} className="px-3 py-2 rounded text-sm border">Sign in / Register</button>
            )}
          </div>
        </div>
      </header>
    );
  }

  /* ---------------------------
     Auth (login/register)
     --------------------------- */
  function Auth({ onLogin }) {
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [role, setRole] = useState('buyer');
    const [position, setPosition] = useState('');

    function handleRegister(e){
      e.preventDefault();
      if(!name || !email || !pw) { alert('Please fill all fields'); return; }
      const users = storage.load('users', DEFAULT_USERS);
      if(users.find(u => u.email === email)){ alert('Email already registered'); return; }
      const newUser = { id: uid('u'), role, name, email, password: pw, position: position || role, freeCount: 0 };
      users.push(newUser);
      storage.save('users', users);
      onLogin(newUser);
    }

    function handleLogin(e){
      e.preventDefault();
      const users = storage.load('users', DEFAULT_USERS);
      const u = users.find(x => x.email === email && x.password === pw);
      if(!u){ alert('Invalid credentials'); return; }
      onLogin(u);
    }

    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8">
        <h3 className="text-lg font-semibold mb-4">{mode === 'login' ? 'Sign In' : 'Register'}</h3>
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3">
          {mode === 'register' && (
            <>
              <label className="block text-sm">
                <div className="text-xs text-gray-600">Full name</div>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded" />
              </label>
              <label className="block text-sm">
                <div className="text-xs text-gray-600">Role</div>
                <select value={role} onChange={e=>setRole(e.target.value)} className="w-full p-2 border rounded">
                  <option value="farmer">Farmer</option>
                  <option value="buyer">Buyer</option>
                </select>
              </label>
              <label className="block text-sm">
                <div className="text-xs text-gray-600">Position (optional)</div>
                <input value={position} onChange={e=>setPosition(e.target.value)} className="w-full p-2 border rounded" />
              </label>
            </>
          )}

          <label className="block text-sm">
            <div className="text-xs text-gray-600">Email</div>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full p-2 border rounded" />
          </label>
          <label className="block text-sm">
            <div className="text-xs text-gray-600">Password</div>
            <input value={pw} onChange={e=>setPw(e.target.value)} type="password" className="w-full p-2 border rounded" />
          </label>

          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{mode === 'login' ? 'Sign In' : 'Sign Up'}</button>
            <button type="button" className="text-sm text-gray-600 underline" onClick={()=>setMode(m=>m==='login'?'register':'login')}>
              {mode === 'login' ? 'Need an account?' : 'Have an account?'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ---------------------------
     Marketplace (buyer access - browse products)
     --------------------------- */
  function MarketplaceView({ products, onView, onBuy }) {
    const [query, setQuery] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const cities = stateFilter ? (STATES_WITH_CITIES[stateFilter] || []) : [];

    const filtered = products.filter(p => {
      const q = query.trim().toLowerCase();
      const matchesText = !q || p.title.toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q);
      const matchesState = !stateFilter || p.state === stateFilter;
      const matchesCity = !cityFilter || p.city === cityFilter;
      return matchesText && matchesState && matchesCity;
    });

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Marketplace</h2>
          <div className="flex gap-2">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title or description" className="px-3 py-2 border rounded w-72" />
            <select value={stateFilter} onChange={e=>{ setStateFilter(e.target.value); setCityFilter(''); }} className="px-3 py-2 border rounded">
              <option value="">All States</option>
              {Object.keys(STATES_WITH_CITIES).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={cityFilter} onChange={e=>setCityFilter(e.target.value)} className="px-3 py-2 border rounded">
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <div className="text-xs text-gray-500">{p.qty} • {p.city}, {p.state}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{currencyFmt(p.price)}</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2">{p.desc}</p>
              <div className="mt-3 flex gap-2 justify-end">
                <button onClick={() => onView(p)} className="px-3 py-1 border rounded">Details</button>
                <button onClick={() => onBuy(p)} className="px-3 py-1 bg-green-600 text-white rounded">Buy</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center text-gray-500 p-8 bg-white rounded">No products found</div>}
        </div>
      </div>
    );
  }

  /* ---------------------------
     Farmer Dashboard
     - add product with state/city dropdown
     - search buyers by location (simulated)
     --------------------------- */
  function FarmerDashboard({ user, products, onAddProduct, simulateSensor, onSearchBuyers }) {
    const [title, setTitle] = useState('');
    const [qty, setQty] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [tempThreshold, setTempThreshold] = useState(30);
    const [humThreshold, setHumThreshold] = useState(80);

    const cities = state ? (STATES_WITH_CITIES[state] || []) : [];

    function submit(e){
      e.preventDefault();
      if(!title || !qty || !state || !city || !price) return alert('Please fill required fields');
      const newP = { id: uid('p'), title, qty, state, city, price: Number(price), desc, farmerId: user.id, sensor: { temp: Number(tempThreshold), humidity: Number(humThreshold) } };
      onAddProduct(newP);
      setTitle(''); setQty(''); setState(''); setCity(''); setPrice(''); setDesc('');
    }

    return (
      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-3">My Listings</h2>
          <div className="space-y-3">
            {products.filter(p => p.farmerId === user.id).length === 0 && <div className="text-gray-500 p-4 bg-white rounded">No listings yet</div>}
            {products.filter(p => p.farmerId === user.id).map(p => (
              <div key={p.id} className={`bg-white p-3 rounded shadow ${p.spoilage ? 'border-l-4 border-red-400' : ''}`}>
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-xs text-gray-500">{p.qty} • {p.city}, {p.state}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{currencyFmt(p.price)}</div>
                    {p.spoilage && <div className="text-red-600 text-sm">Spoilage risk</div>}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{p.desc}</p>
                <div className="mt-3 flex gap-2">
                  <button className="px-2 py-1 border rounded text-sm" onClick={() => simulateSensor(p.id)}>Simulate Sensor</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Add Product</h3>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Title</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Quantity</label>
                  <input value={qty} onChange={e=>setQty(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. 100kg" />
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
                    {Object.keys(STATES_WITH_CITIES).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">City</label>
                  <select value={city} onChange={e=>setCity(e.target.value)} className="w-full p-2 border rounded">
                    <option value="">Select city</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Description</label>
                <textarea value={desc} onChange={e=>setDesc(e.target.value)} className="w-full p-2 border rounded" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Temp threshold (°C)</label>
                  <input value={tempThreshold} onChange={e=>setTempThreshold(e.target.value)} type="number" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Humidity threshold (%)</label>
                  <input value={humThreshold} onChange={e=>setHumThreshold(e.target.value)} type="number" className="w-full p-2 border rounded" />
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-4 py-2 bg-green-600 text-white rounded">Add Listing</button>
              </div>
            </form>
          </div>
        </div>

        <aside className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Find Buyers</h3>
          <p className="text-sm text-gray-600 mb-2">Search for potential buyers by state / city (simulated)</p>
          <BuyerSearch onSearch={onSearchBuyers} />
        </aside>
      </div>
    );
  }

  /* ---------------------------
     BuyerSearch (simulates finding buyers)
     --------------------------- */
  function BuyerSearch({ onSearch }) {
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const cities = state ? (STATES_WITH_CITIES[state] || []) : [];
    const [results, setResults] = useState([]);

    function search(){
      // simulate buyer records: we generate sample buyers in the selected location
      if(!state || !city) return alert('Select state & city to search buyers');
      const sample = [];
      for(let i=0;i<4;i++){
        sample.push({ id: uid('b'), name: `Buyer ${city} ${i+1}`, email: `${city.toLowerCase().replace(/\s+/g,'')}${i+1}@market.local`, state, city, distance: `${Math.floor(Math.random()*30)+1} km` });
      }
      setResults(sample);
      onSearch && onSearch(sample);
    }

    return (
      <div>
        <div className="grid gap-2">
          <select value={state} onChange={e=>{ setState(e.target.value); setCity(''); }} className="p-2 border rounded">
            <option value="">Select state</option>
            {Object.keys(STATES_WITH_CITIES).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={city} onChange={e=>setCity(e.target.value)} className="p-2 border rounded">
            <option value="">Select city</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={search} className="px-3 py-2 bg-blue-600 text-white rounded">Search Buyers</button>
        </div>

        <div className="mt-4 space-y-2">
          {results.map(r => (
            <div key={r.id} className="p-2 border rounded">
              <div className="font-semibold">{r.name}</div>
              <div className="text-xs text-gray-500">{r.email} • {r.distance}</div>
              <div className="mt-2 text-sm">
                <button className="px-2 py-1 bg-green-600 text-white rounded text-sm">Contact</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------------------
     Product Modal
     --------------------------- */
  function ProductModal({ product, onClose, onBuy }) {
    if(!product) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
        <div className="bg-white rounded-lg max-w-xl w-full p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold">{product.title}</h3>
              <div className="text-xs text-gray-500">{product.qty} • {product.city}, {product.state}</div>
            </div>
            <button onClick={onClose} className="text-gray-500">✕</button>
          </div>
          <p className="mt-3 text-sm text-gray-700">{product.desc}</p>
          <div className="mt-4 flex justify-between items-center">
            <div className="text-2xl font-bold">{currencyFmt(product.price)}</div>
            <div className="flex gap-2">
              <button onClick={() => onBuy(product)} className="px-3 py-2 bg-green-600 text-white rounded">Buy</button>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">Sensor thresholds — Temp: {product.sensor?.temp}°C • Humidity: {product.sensor?.humidity}%</div>
        </div>
      </div>
    );
  }

  /* ---------------------------
     IoT Monitor component
     --------------------------- */
  function IoTMonitor({ products, updateSensorState, sendToast }) {
    const [running, setRunning] = useState(false);
    const [intervalMs, setIntervalMs] = useState(2500);
    const ref = useRef(null);

    useEffect(()=>{
      if(running){
        ref.current = setInterval(()=>{
          if(products.length === 0) return;
          const p = products[Math.floor(Math.random()*products.length)];
          const tempJitter = (Math.random()*6 - 3);
          const humJitter = (Math.random()*8 - 4);
          const newTemp = Math.round(((p.sensor?.temp || 25) + tempJitter)*10)/10;
          const newHum = Math.round(((p.sensor?.humidity || 70) + humJitter)*10)/10;
          updateSensorState(p.id, { temp: newTemp, humidity: newHum });
          if(newTemp >= (p.sensor?.temp || 30) || newHum >= (p.sensor?.humidity || 85)) {
            sendToast({ title: 'IoT Alert', msg: `${p.title} at ${p.city}, ${p.state} flagged (T:${newTemp}°C, H:${newHum}%)` });
          }
        }, intervalMs);
      }
      return ()=> clearInterval(ref.current);
    }, [running, intervalMs, products]);

    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">IoT Monitor (Simulated)</h2>
          <div className="flex gap-2 items-center">
            <input type="number" value={intervalMs} onChange={e=>setIntervalMs(Number(e.target.value))} className="p-2 border rounded w-28" />
            <button onClick={()=>setRunning(r=>!r)} className="px-3 py-2 rounded bg-green-600 text-white">{running ? 'Stop' : 'Start'}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className={`bg-white p-4 rounded shadow ${p.spoilage ? 'border-l-4 border-red-400' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.city}, {p.state} • {p.qty}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Temp: <strong>{p.sensor?.temp ?? '—'}°C</strong></div>
                  <div className="text-sm">Humidity: <strong>{p.sensor?.humidity ?? '—'}%</strong></div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">Thresholds: Temp ≥ {p.sensor?.temp}°C or Humidity ≥ {p.sensor?.humidity}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------------------
     Toasts
     --------------------------- */
  function Toasts({ items, remove }) {
    return (
      <div className="fixed right-4 bottom-4 w-96 space-y-2 z-50">
        {items.map(t => (
          <div key={t.id} className="bg-white p-3 rounded shadow border-l-4">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-gray-600">{t.msg}</div>
              </div>
              <button className="text-sm text-gray-500" onClick={() => remove(t.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ---------------------------
     Root App
     --------------------------- */
  function App(){
    const [products, setProducts] = useState(() => storage.load('products', DEFAULT_PRODUCTS));
    const [users, setUsers] = useState(() => storage.load('users', DEFAULT_USERS));
    const [orders, setOrders] = useState(() => storage.load('orders', []));
    const [session, setSession] = useState(() => storage.load('session', null));
    const [view, setView] = useState('market'); // market, auth, buyerDash, farmerDash, iot
    const [toasts, setToasts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // persist changes
    useEffect(()=> storage.save('products', products), [products]);
    useEffect(()=> storage.save('users', users), [users]);
    useEffect(()=> storage.save('orders', orders), [orders]);
    useEffect(()=> storage.save('session', session), [session]);

    function pushToast(t){
      const id = uid('t');
      setToasts(ts => [{ id, ...t }, ...ts].slice(0,6));
      setTimeout(()=> setToasts(ts => ts.filter(x=>x.id !== id)), 9000);
    }
    function removeToast(id){ setToasts(ts => ts.filter(x=>x.id !== id)); }

    function logout(){
      setSession(null);
      setView('market');
      storage.save('session', null);
    }

    function handleLogin(user){
      // ensure user exists in storage (register may provide user object)
      if(!users.find(u=>u.id === user.id)) {
        setUsers(us => [user, ...us]);
      }
      setSession(user);
      setView(user.role === 'farmer' ? 'farmerDash' : 'buyerDash');
      pushToast({ title: 'Welcome', msg: `Signed in as ${user.name}` });
    }

    function handleRegister(user){
      setUsers(us => [user, ...us]);
      setSession(user);
      setView(user.role === 'farmer' ? 'farmerDash' : 'buyerDash');
      pushToast({ title: 'Welcome', msg: `Account created — ${user.name}` });
    }

    function showMarketplaceAs(roleOrView){
      if(roleOrView === 'auth') { setView('auth'); return; }
      // if clicking Buyer button, show marketplace (guest browsing) but prefer buyerDash if signed in
      if(roleOrView === 'buyer'){ setView('market'); return; }
      if(roleOrView === 'farmer'){ setView('market'); return; }
      setView('market');
    }

    function addProduct(p){
      // check farmer free-limit if session exists and is farmer
      if(session && session.role === 'farmer'){
        const usersCopy = [...users];
        const uidx = usersCopy.findIndex(u => u.id === session.id);
        if(uidx !== -1){
          const u = usersCopy[uidx];
          if((u.freeCount || 0) >= 3){
            // need payment - placeholder
            if(!confirm('You have used your 3 free listings. Proceed to pay (demo)?')){ return; }
            // In production integrate Paystack/Flutterwave and verify on server
          } else {
            usersCopy[uidx].freeCount = (u.freeCount || 0) + 1;
            setUsers(usersCopy);
            setSession(usersCopy[uidx]);
            pushToast({ title: 'Listing', msg: 'Free listing used — remaining ' + (3 - usersCopy[uidx].freeCount) });
          }
        }
      }
      setProducts(ps => [p, ...ps]);
    }

    function buyProduct(product){
      // require buyer to sign in for purchase
      if(!session || session.role !== 'buyer'){ setView('auth'); pushToast({ title: 'Sign in', msg: 'Sign in as buyer to purchase' }); return; }
      const buyer = users.find(u => u.id === session.id) || session;
      // check buyer free purchases
      const buyerOrders = orders.filter(o => o.buyerId === buyer.id);
      if((buyer.freeCount || 0) >= 3){
        if(!confirm('You used 3 free purchases. Proceed to pay (demo)?')) return;
        // placeholder: after payment we'd add order with amount
      } else {
        // record free order
        const order = { id: uid('o'), productId: product.id, buyerId: buyer.id, amount: 0, method: 'free', createdAt: new Date().toISOString() };
        setOrders(os => [order, ...os]);
        // increment buyer freeCount
        setUsers(us => us.map(u => u.id === buyer.id ? { ...u, freeCount: (u.freeCount || 0) + 1 } : u));
        setSession(s => s && s.id === buyer.id ? { ...s, freeCount: (s.freeCount || 0) + 1 } : s);
        pushToast({ title: 'Order', msg: 'Free order placed. Contact farmer to arrange delivery.' });
      }
    }

    function simulateSensor(productId){
      setProducts(ps => ps.map(p => {
        if(p.id !== productId) return p;
        const newTemp = (p.sensor?.temp || 25) + (Math.random()*6 + 3);
        const newHum = (p.sensor?.humidity || 70) + (Math.random()*6 + 3);
        const spoil = newTemp >= (p.sensor.temp || 30) || newHum >= (p.sensor.humidity || 85);
        if(spoil) pushToast({ title: 'Spoilage', msg: `${p.title} flagged (T:${newTemp.toFixed(1)}°C, H:${newHum.toFixed(0)}%)` });
        return { ...p, sensor: { temp: Math.round(newTemp*10)/10, humidity: Math.round(newHum) }, spoilage: spoil };
      }));
    }

    function updateSensorState(productId, sensor){
      setProducts(ps => ps.map(p => {
        if(p.id !== productId) return p;
        const spoil = sensor.temp >= (p.sensor.temp || 30) || sensor.humidity >= (p.sensor.humidity || 85);
        if(spoil) pushToast({ title: 'IoT Alert', msg: `${p.title} may be spoiling (T:${sensor.temp}°C, H:${sensor.humidity}%)` });
        return { ...p, sensor: { ...p.sensor, ...sensor }, spoilage: spoil };
      }));
    }

    // farmer searching buyers simulation handler
    function handleSearchBuyers(list){
      pushToast({ title: 'Buyers found', msg: `Found ${list.length} buyers (simulated)` });
    }

    // pick view to render
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={session} onLogout={logout} showMarketplaceAs={showMarketplaceAs} />

        <main className="flex-1">
          { view === 'auth' && <Auth onLogin={handleLogin} onRegister={handleRegister} /> }

          { view === 'market' && <MarketplaceView products={products} onView={p=>setSelectedProduct(p)} onBuy={buyProduct} /> }

          { view === 'farmerDash' && session && session.role === 'farmer' && (
            <FarmerDashboard user={session} products={products} onAddProduct={addProduct} simulateSensor={simulateSensor} onSearchBuyers={handleSearchBuyers} />
          )}

          { view === 'buyerDash' && session && session.role === 'buyer' && (
            <div>
              <div className="max-w-7xl mx-auto px-4 py-6">
                <h2 className="text-2xl font-semibold">Buyer Dashboard</h2>
                <p className="text-sm text-gray-600">Browse available products and filter by location.</p>
              </div>
              <MarketplaceView products={products} onView={p=>setSelectedProduct(p)} onBuy={buyProduct} />
            </div>
          )}

          { view === 'iot' && <IoTMonitor products={products} updateSensorState={updateSensorState} sendToast={pushToast} /> }
        </main>

        <footer className="bg-white text-xs text-gray-600 p-4 text-center">AgriLink360 — Demo • Free-trial gating • IoT simulation</footer>

        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onBuy={(p)=>{ buyProduct(p); setSelectedProduct(null); }} />

        <Toasts items={toasts} remove={removeToast} />
      </div>
    );
  }

  ReactDOM.render(<App />, document.getElementById('root'));
  </script>
</body>
</html>
