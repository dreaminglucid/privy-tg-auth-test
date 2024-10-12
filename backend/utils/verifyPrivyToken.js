const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Initialize JWKS client
const client = jwksClient({
  jwksUri: 'https://auth.privy.io/api/v1/apps/cm21ts1hg03j5vu4i1x0h6aub/jwks.json', // Replace with actual JWKS endpoint
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) {
      callback(err, null);
      return;
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const verifyPrivyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    console.warn('No Authorization header provided.');
    return res.status(401).json({ error: 'No token provided.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    console.warn('Authorization header malformed.');
    return res.status(401).json({ error: 'Malformed token.' });
  }
  
  jwt.verify(token, getKey, { algorithms: ['ES256'], issuer: 'privy.io', audience: process.env.REACT_APP_PRIVY_APP_ID }, (err, decoded) => {
    if (err) {
      console.warn('Invalid JWT token:', err.message);
      return res.status(403).json({ error: 'Invalid token.' });
    }
    
    req.user = decoded;
    next();
  });
};

module.exports = { verifyPrivyToken };