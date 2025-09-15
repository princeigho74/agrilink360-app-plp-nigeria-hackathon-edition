// server.js — Backend for payment verification
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(require('cors')());

// File to persist orders
const ordersFile = path.join(__dirname, 'orders.json');

// Utility to load/save orders
function loadOrders() {
  try {
    return JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  } catch {
    return [];
  }
}
function saveOrders(orders) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

// Example root
app.get('/', (req, res) => {
  res.send('AgriLink360 backend running ✅');
});

/* -------- Verify Paystack -------- */
app.post('/api/verify/paystack', async (req, res) => {
  const { reference, buyerId, productId, amount } = req.body;
  if (!reference) return res.status(400).json({ error: 'Missing reference' });

  try {
    const resp = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const data = resp.data;
    if (data.status && data.data.status === 'success') {
      const orders = loadOrders();
      orders.unshift({
        id: 'o_' + Date.now(),
        buyerId,
        productId,
        amount,
        method: 'paystack',
        reference,
        createdAt: new Date().toISOString()
      });
      saveOrders(orders);
      return res.json({ success: true, order: orders[0] });
    }
    res.status(400).json({ error: 'Verification failed', raw: data });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

/* -------- Verify Flutterwave -------- */
app.post('/api/verify/flutterwave', async (req, res) => {
  const { transactionId, buyerId, productId, amount } = req.body;
  if (!transactionId) return res.status(400).json({ error: 'Missing transactionId' });

  try {
    const resp = await axios.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` }
    });
    const data = resp.data;
    if (data.status === 'success' && data.data.status === 'successful') {
      const orders = loadOrders();
      orders.unshift({
        id: 'o_' + Date.now(),
        buyerId,
        productId,
        amount,
        method: 'flutterwave',
        reference: data.data.tx_ref,
        createdAt: new Date().toISOString()
      });
      saveOrders(orders);
      return res.json({ success: true, order: orders[0] });
    }
    res.status(400).json({ error: 'Verification failed', raw: data });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

/* -------- Get all orders (for testing) -------- */
app.get('/api/orders', (req, res) => {
  res.json(loadOrders());
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
