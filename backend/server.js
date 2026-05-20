require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    currency: 'KES'
  });
});

app.post('/api/test', (req, res) => {
  console.log('Test payload:', req.body);
  res.json({
    success: true,
    message: 'Backend is working',
    received: req.body,
    currency: 'KES'
  });
});

app.post('/api/create-payment-link', (req, res) => {
  console.log('Received payload:', req.body);

  const payload = req.body || {};
  const orderId = payload.orderId || `ORD-${Date.now()}`;
  const amount = Number(payload.amount || 0);
  const method = String(payload.method || 'visa').toLowerCase();

  res.status(200).json({
    success: true,
    message: 'Test payment route working',
    paymentMode: method,
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
    },
    stkResponse: {
      ResponseCode: '0',
      ResponseDescription: 'Test STK request accepted',
      Currency: 'KES'
    }
  });
});

app.post('/api/tap-webhook', (req, res) => {
  console.log('Tap webhook:', req.body);
  res.status(200).json({ success: true });
});

app.post('/api/mpesa-callback', (req, res) => {
  console.log('M-Pesa callback:', req.body);
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
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

app.listen(PORT, () => {
  console.log(`Server running on ${BASE_URL}`);
});