let runs = 0;

function runAnalysis() {
  const resultsDiv = document.getElementById("results");
  const paymentDiv = document.getElementById("payment");

  if (runs < 2) {
    runs++;
    resultsDiv.innerHTML = "✅ Analysis complete (Free Run #" + runs + ")";
  } else {
    resultsDiv.innerHTML = "⚠️ Free limit reached.";
    paymentDiv.classList.remove("hidden");
  }
}

/******** Paystack ********/
function payWithPaystack(amount, email) {
  let handler = PaystackPop.setup({
    key: 'pk_test_xxxxxxxxx', // Replace with your Paystack public key
    email: email,
    amount: amount * 100,
    currency: 'NGN',
    callback: function(response) {
      alert('Payment complete! Reference: ' + response.reference);
    },
    onClose: function() {
      alert('Transaction not completed.');
    },
  });
  handler.openIframe();
}

/******** Flutterwave ********/
function payWithFlutterwave(amount, email) {
  FlutterwaveCheckout({
    public_key: "FLWPUBK_TEST-xxxxxxxxx", // Replace with your Flutterwave public key
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

