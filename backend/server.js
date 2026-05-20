require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const DEFAULT_MPESA_PHONE = process.env.DEFAULT_MPESA_PHONE || '254794824443';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

function normalizePhone(phone) {
  return String(phone || '').replace(/[^\d]/g, '');
}

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    port: PORT,
    baseUrl: BASE_URL,
    currency: 'KES'
  });
});

app.post('/api/create-payment-link', (req, res) => {
  const payload = req.body || {};
  const orderId = payload.orderId || `ORD-${Date.now()}`;
  const amount = Number(payload.amount || 0);
  const method = String(payload.method || 'visa').toLowerCase();
  const mpesaPhone = normalizePhone(payload.mpesaPhone || payload.customer?.phone || DEFAULT_MPESA_PHONE);

  if (!payload.customer?.name || !payload.customer?.email || !payload.customer?.phone) {
    return res.status(400).json({
      success: false,
      message: 'Missing customer details',
      received: payload
    });
  }

  if (!amount || Number.isNaN(amount)) {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid amount',
      received: payload
    });
  }

  if (method === 'mpesa') {
    return res.json({
      success: true,
      message: 'Test M-Pesa route working',
      paymentMode: 'mpesa',
      orderId,
      amount,
      currency: 'KES',
      paymentUrl: null,
      received: payload,
      stkResponse: {
        ResponseCode: '0',
        ResponseDescription: 'Test STK request accepted',
        phone: mpesaPhone,
        Currency: 'KES'
      }
    });
  }

  if (method === 'bank') {
    return res.json({
      success: true,
      message: 'Test bank route working',
      paymentMode: 'bank',
      orderId,
      amount,
      currency: 'KES',
      paymentUrl: null,
      received: payload,
      bankDetails: {
        bankName: 'Co-operative Bank of Kenya',
        accountName: 'Paul Mwaniki Coffee Shop',
        accountNumber: '01234566678',
        branch: 'Nairobi',
        currency: 'KES'
      }
    });
  }

  return res.json({
    success: true,
    message: 'Test card route working',
    paymentMode: method,
    orderId,
    amount,
    currency: 'KES',
    paymentUrl: null,
    received: payload
  });
});

app.post('/api/tap-webhook', (req, res) => {
  res.json({ success: true });
});

app.post('/api/mpesa-callback', (req, res) => {
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

app.get('/payment-success', (req, res) => {
  const orderId = req.query.orderId || 'Unknown';
  res.send(`<h1>Payment received for order ${orderId}</h1>`);
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${BASE_URL}`);
});