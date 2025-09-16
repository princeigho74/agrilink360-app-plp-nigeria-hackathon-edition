<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>AgriLink360 Marketplace</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-gray-100">
  <div id="root"></div>

  <script type="text/babel">

    const { useState } = React;

    // --- Product Seed Data ---
    const initialProducts = [
      { id: 1, name: "Maize", location: "Kano", description: "Freshly harvested maize", price: 12000 },
      { id: 2, name: "Yam", location: "Benue", description: "High quality yams", price: 35000 },
      { id: 3, name: "Rice", location: "Nasarawa", description: "Local rice (destoned)", price: 40000 },
      { id: 4, name: "Beans", location: "Kaduna", description: "Brown beans", price: 28000 },
      { id: 5, name: "Pepper", location: "Ogun", description: "Fresh red pepper", price: 15000 },
      { id: 6, name: "Bottled Water", location: "Lagos", description: "Clean table water", price: 500 },
      { id: 7, name: "Tomatoes", location: "Kano", description: "Basket of fresh tomatoes", price: 20000 },
      { id: 8, name: "Onions", location: "Sokoto", description: "Purple onions", price: 18000 },
      { id: 9, name: "Garri", location: "Delta", description: "Ijebu Garri (white)", price: 25000 },
      { id: 10, name: "Cassava", location: "Ekiti", description: "Raw cassava tubers", price: 22000 },
      { id: 11, name: "Fish", location: "Rivers", description: "Fresh catfish (per kg)", price: 3500 },
      { id: 12, name: "Bush Meat", location: "Cross River", description: "Smoked bush meat", price: 50000 },
    ];

    // --- Components ---

    function Header({ current, setCurrent, user, signout }) {
      return (
        <header className="bg-green-700 text-white p-4 flex justify-between">
          <h1 className="text-lg font-bold">AgriLink360</h1>
          <nav className="flex gap-4">
            <button onClick={() => setCurrent("market")} className={current==="market"?"underline":""}>Marketplace</button>
            <button onClick={() => setCurrent("dashboard")} className={current==="dashboard"?"underline":""}>Dashboard</button>
            <button onClick={() => setCurrent("auth")} className={current==="auth"?"underline":""}>{user ? "Switch User" : "Login / Signup"}</button>
            {user && <button onClick={signout}>Logout</button>}
          </nav>
        </header>
      );
    }

    function Auth({ onLogin }) {
      const [isSignup, setIsSignup] = useState(false);
      const [form, setForm] = useState({ username:"", password:"", type:"buyer" });

      const handleSubmit = () => {
        if(form.username && form.password){
          onLogin(form);
        }
      };

      return (
        <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
          <h2 className="text-lg font-bold mb-4">{isSignup ? "Sign Up" : "Login"}</h2>
          <input type="text" placeholder="Username" className="border w-full mb-2 p-2"
            value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
          <input type="password" placeholder="Password" className="border w-full mb-2 p-2"
            value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
          <select className="border w-full mb-2 p-2" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            <option value="buyer">Buyer</option>
            <option value="farmer">Farmer</option>
          </select>
          <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded w-full">{isSignup ? "Sign Up" : "Login"}</button>
          <p className="mt-2 text-sm text-center">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button className="text-green-700 ml-1 underline" onClick={()=>setIsSignup(!isSignup)}>{isSignup ? "Login" : "Sign Up"}</button>
          </p>
        </div>
      );
    }

    function Marketplace({ products, query, setQuery, filters, setFilters, onBuy }) {
      const filtered = products.filter(p=>{
        return (
          (!query || p.name.toLowerCase().includes(query.toLowerCase())) &&
          (!filters.location || p.location===filters.location)
        );
      });

      return (
        <div className="p-6 max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Available Products</h2>
          <div className="flex gap-4 mb-4">
            <input type="text" placeholder="Search product..." value={query}
              onChange={e=>setQuery(e.target.value)} className="border p-2 flex-1"/>
            <select className="border p-2" value={filters.location||""}
              onChange={e=>setFilters({...filters, location:e.target.value||null})}>
              <option value="">All Locations</option>
              {[...new Set(products.map(p=>p.location))].map(loc=><option key={loc}>{loc}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p=>(
              <div key={p.id} className="bg-white shadow rounded p-4">
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-sm">{p.description}</p>
                <p className="text-sm text-gray-500">Location: {p.location}</p>
                <p className="text-green-700 font-bold">₦{p.price.toLocaleString()}</p>
                <button onClick={()=>onBuy(p)} className="mt-2 bg-green-600 text-white px-3 py-1 rounded">Buy</button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    function Dashboard({ user, addProduct }) {
      const [newProduct, setNewProduct] = useState({ name:"", description:"", location:"", price:"" });

      const handleAdd = () => {
        if(newProduct.name && newProduct.location){
          addProduct(newProduct);
          setNewProduct({ name:"", description:"", location:"", price:"" });
        }
      };

      if(user.type !== "farmer"){
        return <div className="p-6 text-center text-gray-600">Dashboard available only for Farmers.</div>
      }

      return (
        <div className="p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Farmer Dashboard</h2>
          <input type="text" placeholder="Product Name" className="border w-full mb-2 p-2"
            value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name:e.target.value})}/>
          <input type="text" placeholder="Description" className="border w-full mb-2 p-2"
            value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description:e.target.value})}/>
          <input type="text" placeholder="Location" className="border w-full mb-2 p-2"
            value={newProduct.location} onChange={e=>setNewProduct({...newProduct, location:e.target.value})}/>
          <input type="number" placeholder="Price" className="border w-full mb-2 p-2"
            value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price:parseInt(e.target.value)})}/>
          <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded w-full">Add Product</button>
        </div>
      );
    }

    function App(){
      const [current, setCurrent] = useState("market");
      const [user, setUser] = useState(null);
      const [products, setProducts] = useState(initialProducts);
      const [query, setQuery] = useState("");
      const [filters, setFilters] = useState({});

      const signout = ()=> setUser(null);

      const handleLogin = (form)=> {
        setUser(form);
        setCurrent("market");
      };

      const handleBuy = (product)=>{
        alert(`You have requested to buy ${product.name}. Contact farmer in ${product.location}.`);
      };

      const addProduct = (p)=>{
        setProducts([...products, { ...p, id: products.length+1 }]);
      };

      return (
        <div className="min-h-screen flex flex-col">
          <Header current={current} setCurrent={setCurrent} user={user} signout={signout}/>
          <main className="flex-1">
            {current==="auth" && <Auth onLogin={handleLogin}/>}
            {current==="market" && <Marketplace products={products} query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} onBuy={handleBuy}/>}
            {current==="dashboard" && user && <Dashboard user={user} addProduct={addProduct}/>}
            {current==="dashboard" && !user && <div className="p-6 text-center text-gray-600">Please login to access dashboard.</div>}
          </main>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<App/>);

  </script>
</body>
</html>
