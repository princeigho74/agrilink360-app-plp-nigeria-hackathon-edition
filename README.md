🌍 AgriLink360 – AI-Driven Agri Marketplace

AgriLink360 is a prototype AI-powered web app that connects farmers directly with buyers across Nigeria, while using IoT simulation to detect and alert farmers about potential spoilage of goods.
The solution is designed as part of a Hackathon challenge with focus on:

Zero Hunger

Empowering Farmers

Reducing Food Waste

Seamless Future Integration with LMS & Payment Platforms


🚀 Features

Role-Based Access

👩‍🌾 Farmer: Add products, search for buyers, simulate IoT spoilage alerts.

🛒 Buyer: Browse available farm products, search/filter by state/city, connect with farmers.


Marketplace

Preloaded Nigerian products (Rice, Beans, Tomatoes, Pepper, Garri, Cassava, Onions, Fish, Bush Meat, etc.)

Linked to states/cities in Nigeria for localized matching.


IoT Spoilage Alerts (Simulated)

Farmers receive real-time alerts when goods risk spoilage (demo via toast notification).


AI-Driven Matching (Prototype)

Buyer ↔ Farmer matching logic (simulated ranking).

Ready for extension with ML/AI models.


Payment Trial

Farmers can try adding products 3 times for free.

Payment system (Paystack/Flutterwave) can be integrated after trial.


🛠️ Tech Stack

Frontend: React (via CDN + Babel), TailwindCSS

Hosting: Works locally in browser or can be hosted on Netlify/Vercel/GitHub Pages

Data: Mock JSON for products, buyers, Nigerian states & cities

Future Integration: AI services for applicant/product ranking, LMS upskilling, IntaSend/Paystack for payments


📂 Project Structure

├── index.html       # Loads React + Tailwind + marketplace.js
├── styles.css       # Optional custom styles
├── marketplace.js   # Main React app (Farmers, Buyers, Marketplace, IoT, AI logic)
└── README.md        # Project documentation


⚙️ Setup & Run

1. Clone Repo

git clone https://github.com/yourusername/agrilink360.git
cd agrilink360

2. Open in Browser

Simply open index.html in Chrome/Firefox/Edge.

No backend needed — this is a front-end prototype.


📸 Demo Screens

Landing page with sign-in options

Buyer marketplace with product filters

Farmer dashboard with IoT alerts

Mock AI-driven ranking for buyer/farmer matching


🔮 Next Steps

Connect real IoT sensors for spoilage detection

Integrate AI/ML model for smarter buyer ↔ farmer product recommendations

Add payment API (Paystack/Flutterwave) for real transactions

Link with LSETF LMS for farmer/buyer upskilling


👥 Contributors

Happy Igho Umukoro – Product Owner / Developer

Open for collaborators



