// server/src/config/firestore.js
const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // On Render / in .env as JSON string
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local dev fallback: use file
  // (keep serviceAccountKey.json OUT of git)
  // eslint-disable-next-line global-require
  serviceAccount = require("../../serviceAccountKey.json");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = db;
