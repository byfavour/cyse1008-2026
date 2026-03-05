// npm install firebase-admin  // if you haven't already


const admin = require("firebase-admin");

// Load your service account key
const serviceAccount = require("./path-to-your-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { role: "admin" });
  console.log(`User ${uid} is now an admin.`);
}

// Replace with your own Firebase UID (Find it in Firebase Authentication)
setAdmin("YOUR_FIREBASE_UID");
