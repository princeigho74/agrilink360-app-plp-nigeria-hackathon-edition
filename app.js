const { useState, useEffect } = React;

/******* Candidate Scoring Logic *******/
function scoreCandidate(applicant, criteria) {
  let score = 0;
  if (criteria.skills) {
    const matched = applicant.skills.filter(s =>
      criteria.skills.includes(s.toLowerCase())
    );
    score += matched.length * 50;
  }
  if (applicant.experience) score += applicant.experience * 25;
  if (applicant.education) score += applicant.education * 15;
  if (applicant.assessment) score += applicant.assessment * 10;
  return score;
}

/******* Payment Integration *******/
function payWithPaystack(amount, email) {
  let handler = PaystackPop.setup({
    key: 'pk_test_xxxxxxxxxxxxx', // Replace with your public key
    email: email,
    amount: amount * 100,
    currency: 'NGN',
    callback: function(response) {
      alert('Payment complete! Reference: ' + response.reference);
    },
    onClose: function() {
      alert('Transaction not completed, window closed.');
    },
  });
  handler.openIframe();
}

function payWithFlutterwave(amount, email) {
  FlutterwaveCheckout({
    public_key: "FLWPUBK_TEST-xxxxxxxxxxxx",
    tx_ref: Date.now(),
    amount: amount,
    currency: "NGN",
    payment_options: "card,ussd,banktransfer",
    customer: {
      email: email,
      phone_number: "08012345678",
      name: "Test User",
    },
    callback: function(data) {
      alert("Payment complete! " + data.status);
    },
    onclose: function() {},
  });
}

/******* Main Pages *******/
function Landing({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-600 to-green-500 text-white p-6">
      <h2 className="text-4xl font-extrabold mb-3">🌍 AI Applicant Selection</h2>
      <p className="max-w-xl text-center mb-6">
        Analyze resumes, rank applicants, and recommend top candidates for LSETF/PLP programs.
      </p>
      <button onClick={onStart} className="px-6 py-3 bg-white text-green-700 rounded-lg font-semibold shadow">
        Get Started
      </button>
    </div>
  );
}

function Dashboard() {
  const [runs, setRuns] = useState(0);
  const [showPayment, setShowPayment] = useState(false);

  function runAnalysis() {
    if (runs < 2) {
      alert("Analysis run complete (Free).");
      setRuns(runs + 1);
    } else {
      setShowPayment(true);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Applicant Dashboard</h1>
      <button onClick={runAnalysis} className="px-4 py-2 bg-green-600 text-white rounded shadow">
        Run Analysis
      </button>

      {showPayment && (
        <div className="mt-6 p-4 border rounded bg-white shadow">
          <h3 className="font-semibold mb-2">Payment Required</h3>
          <button onClick={() => payWithPaystack(5000, "test@example.com")} className="px-4 py-2 bg-blue-600 text-white rounded mr-2">
            Pay with Paystack
          </button>
          <button onClick={() => payWithFlutterwave(5000, "test@example.com")} className="px-4 py-2 bg-purple-600 text-white rounded">
            Pay with Flutterwave
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [started, setStarted] = useState(false);
  return started ? <Dashboard /> : <Landing onStart={() => setStarted(true)} />;
}

ReactDOM.render(<App />, document.getElementById('root'));
