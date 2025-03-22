const admin = require('firebase-admin');

console.log('Initializing Firebase Admin...');

// Check if environment variables exist
console.log('Environment variables present:', {
  projectId: !!process.env.FIREBASE_PROJECT_ID,
  clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: !!process.env.FIREBASE_PRIVATE_KEY
});

// Ensure private key is formatted correctly
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : null;

// Build service account object
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: privateKey,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

// Debugging: Ensure service account fields are set
console.log('Service Account Config:', JSON.stringify({
  ...serviceAccount,
  private_key: serviceAccount.private_key ? '[PRESENT]' : '[MISSING]'
}, null, 2));

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.log('⚠️ Firebase Admin already initialized');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error);
}

module.exports = admin;
