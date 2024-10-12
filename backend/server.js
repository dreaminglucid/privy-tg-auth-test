const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const crypto = require('crypto');
const { verifyPrivyToken } = require('./utils/verifyPrivyToken'); // Import the middleware
const app = express();

// Load environment variables
dotenv.config();

// CORS Configuration
app.use(cors({
  origin: 'https://cyan-eagles-march.loca.lt', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If you need to send cookies or authentication headers
}));

// Middleware
app.use(express.json());

// Routes
app.post('/api/onramp', verifyPrivyToken, (req, res) => {
  const { address, email, redirectUrl } = req.body;

  if (!address || !email || !redirectUrl) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  // Construct Moonpay on-ramp URL
  const moonpayBaseUrl = 'https://buy-sandbox.moonpay.com'; // Use production URL in production

  const url = new URL(moonpayBaseUrl);
  url.searchParams.set('apiKey', process.env.MOONPAY_PUBLIC_KEY);
  url.searchParams.set('walletAddress', address);
  url.searchParams.set('redirectURL', redirectUrl);
  url.searchParams.set('email', email);
  url.searchParams.set('currencyCode', 'eth'); // Pre-populate currency as Ethereum

  // Sign the URL using HMAC SHA256
  const signature = crypto
    .createHmac('sha256', process.env.MOONPAY_SECRET_KEY)
    .update(url.search)
    .digest('base64');

  url.searchParams.set('signature', signature);

  // Respond with the signed URL
  return res.status(200).json({ url: url.toString() });
});

// Handle Preflight Requests Globally
app.options('*', cors());

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
