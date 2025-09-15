// Nigerian States with example LGAs (you can expand this list)
const STATES_LGAS = {
  "Lagos": ["Ikeja", "Epe", "Ikorodu", "Surulere", "Badagry"],
  "Abuja (FCT)": ["Gwagwalada", "Kuje", "Abaji", "Bwari", "AMAC"],
  "Kano": ["Kano Municipal", "Nassarawa", "Dala", "Gwale", "Fagge"],
  "Rivers": ["Port Harcourt", "Obio/Akpor", "Eleme", "Ikwerre", "Okrika"],
  "Delta": ["Asaba", "Warri", "Ughelli", "Sapele", "Oshimili"],
  "Kaduna": ["Kaduna North", "Kaduna South", "Zaria", "Sabon Gari", "Jema'a"]
  // 🔹 Add all states & LGAs here (full dataset available)
};

window.onload = () => {
  const stateSelect = document.getElementById("state");
  const lgaSelect = document.getElementById("lga");

  // Populate states
  Object.keys(STATES_LGAS).forEach(st => {
    const opt = document.createElement("option");
    opt.value = st;
    opt.textContent = st;
    stateSelect.appendChild(opt);
  });

  // Update LGAs when state changes
  stateSelect.addEventListener("change", () => {
    lgaSelect.innerHTML = "<option value=''>-- Select LGA/City --</option>";
    if (STATES_LGAS[stateSelect.value]) {
      STATES_LGAS[stateSelect.value].forEach(lga => {
        const opt = document.createElement("option");
        opt.value = lga;
        opt.textContent = lga;
        lgaSelect.appendChild(opt);
      });
    }
  });

  // Handle product form submission
  document.getElementById("farmForm").addEventListener("submit", e => {
    e.preventDefault();
    const crop = document.getElementById("crop").value;
    const quantity = document.getElementById("quantity").value;
    const price = document.getElementById("price").value;
    const state = document.getElementById("state").value;
    const lga = document.getElementById("lga").value;
    const desc = document.getElementById("desc").value;

    const product = { crop, quantity, price, location: `${lga}, ${state}`, desc };
    addFarmCard(product);

    e.target.reset();
    lgaSelect.innerHTML = "<option value=''>-- Select LGA/City --</option>"; // reset LGA
  });
};

// Add new farm card dynamically
function addFarmCard(farm) {
  const container = document.getElementById("farmList");
  const card = document.createElement("div");
  card.className = "bg-white p-4 rounded-lg shadow border";
  card.innerHTML = `
    <h3 class="font-bold text-lg">${farm.crop}</h3>
    <p class="text-sm text-gray-600 mt-1">${farm.desc}</p>
    <div class="mt-3 text-sm text-gray-700">
      <div><strong>Quantity:</strong> ${farm.quantity}</div>
      <div><strong>Location:</strong> ${farm.location}</div>
      <div><strong>Price:</strong> ${farm.price}</div>
    </div>
  `;
  container.appendChild(card);
}


