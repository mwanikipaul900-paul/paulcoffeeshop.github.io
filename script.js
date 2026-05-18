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
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

function normalizePhone(phone) {
    return String(phone || '').replace(/[^\d]/g, '');
}

function mpesaTimestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function getMpesaAccessToken() {
    const key = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_CONSUMER_SECRET;

    if (!key || !secret) {
        throw new Error('Missing M-Pesa consumer key or secret');
    }

    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const baseUrl = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';

    const res = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.errorMessage || 'Unable to get M-Pesa token');
    return data.access_token;
}

async function initiateStkPush({ amount, phoneNumber, accountReference }) {
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!shortcode || !passkey || !callbackUrl) {
        throw new Error('Missing M-Pesa shortcode, passkey, or callback URL');
    }

    const token = await getMpesaAccessToken();
    const baseUrl = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
    const timestamp = mpesaTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const phone = normalizePhone(phoneNumber);

    const body = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(Number(amount)),
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: 'Paul Mwaniki Coffee Shop payment'
    };

    const res = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.errorMessage || 'STK push failed');
    return data;
}

app.post('/api/create-payment-link', async (req, res) => {
    try {
        const { orderId, amount, customer, method, items, mpesaPhone } = req.body;
        const paymentMethod = (method || 'visa').toLowerCase();
        const currency = 'KES';

        if (!orderId || !amount || !customer?.name || !customer?.email || !customer?.phone) {
            return res.status(400).json({
                success: false,
                message: 'Missing order, amount, or customer details'
            });
        }

        if (paymentMethod === 'bank') {
            return res.json({
                success: true,
                paymentMode: 'bank',
                currency,
                orderId,
                amount,
                paymentUrl: null,
                bankDetails: {
                    bankName: 'Co-operative Bank of Kenya',
                    accountName: 'Paul Mwaniki Coffee Shop',
                    accountNumber: '01234566678',
                    branch: 'Nairobi'
                },
                message: 'Bank transfer details provided'
            });
        }

        if (paymentMethod === 'mpesa') {
            const phone = normalizePhone(mpesaPhone || customer.phone);

            if (!phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing M-Pesa phone number'
                });
            }

            const stk = await initiateStkPush({
                amount,
                phoneNumber: phone,
                accountReference: orderId
            });

            return res.json({
                success: true,
                paymentMode: 'mpesa',
                currency,
                orderId,
                amount,
                paymentUrl: null,
                stkResponse: stk,
                message: 'M-Pesa STK push sent to customer phone'
            });
        }

        const sourceMap = {
            visa: 'src_card',
            mastercard: 'src_card',
            knet: 'src_kw.knet'
        };

        const sourceId = sourceMap[paymentMethod] || 'src_card';
        const gatewayKey = process.env.TAP_SECRET_KEY;

        if (!gatewayKey) {
            return res.status(500).json({
                success: false,
                message: 'TAP_SECRET_KEY is missing from server environment'
            });
        }

        const tapPayload = {
            amount: Number(amount).toFixed(3),
            currency: 'KWD',
            threeDSecure: true,
            save_card: false,
            description: `Paul Mwaniki Coffee Shop Order ${orderId}`,
            statement_descriptor: 'PAUL MWANIKI',
            customer: {
                first_name: customer.name.split(' ')[0] || customer.name,
                last_name: customer.name.split(' ').slice(1).join(' ') || 'Customer',
                email: customer.email,
                phone: {
                    country_code: normalizePhone(customer.phone).startsWith('254') ? '254' : '965',
                    number: normalizePhone(customer.phone)
                }
            },
            source: {
                id: sourceId
            },
            redirect: {
                url: `${BASE_URL}/payment-success?orderId=${encodeURIComponent(orderId)}`
            },
            post: {
                url: `${BASE_URL}/api/tap-webhook`
            },
            reference: {
                transaction: orderId,
                order: orderId
            },
            metadata: {
                orderId,
                items: JSON.stringify(items || [])
            }
        };

        const tapResponse = await fetch('https://api.tap.company/v2/charges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${gatewayKey}`
            },
            body: JSON.stringify(tapPayload)
        });

        const tapData = await tapResponse.json();

        if (!tapResponse.ok) {
            return res.status(500).json({
                success: false,
                message: tapData?.message || 'Tap payment creation failed',
                details: tapData
            });
        }

        const paymentUrl = tapData?.transaction?.url || tapData?.url || tapData?.redirect?.url || null;

        if (!paymentUrl) {
            return res.status(500).json({
                success: false,
                message: 'Tap did not return a payment URL',
                details: tapData
            });
        }

        return res.json({
            success: true,
            paymentMode: paymentMethod,
            currency,
            orderId,
            amount,
            paymentUrl,
            tapResponse: tapData,
            message: 'Tap payment link created successfully'
        });

    } catch (error) {
        console.error('Payment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Payment server error',
            error: error.message
        });
    }
});

app.post('/api/tap-webhook', (req, res) => {
    console.log('Tap webhook:', req.body);
    res.status(200).json({ success: true });
});

app.post('/api/mpesa-callback', (req, res) => {
    console.log('M-Pesa callback:', JSON.stringify(req.body, null, 2));
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

app.get('/payment-success', (req, res) => {
    const orderId = req.query.orderId || 'Unknown';

    res.send(`
        <html>
        <head>
            <title>Payment Success</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 60px; background: #f7f7f7; }
                .box { max-width: 600px; margin: auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 18px rgba(0,0,0,0.1); }
                h1 { color: #27ae60; }
                p { font-size: 18px; }
                a { display: inline-block; margin-top: 20px; text-decoration: none; background: #7b5a4a; color: white; padding: 12px 20px; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="box">
                <h1>Payment Received</h1>
                <p>Your order <strong>${orderId}</strong> has been processed successfully.</p>
                <a href="/">Back to Shop</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on ${BASE_URL}`);
});
