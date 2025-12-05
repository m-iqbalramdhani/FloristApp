const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const path = require('path');

const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];
const SERVICE_ACCOUNT_PATH = path.join(__dirname, "../config/service-account.json");

// Ambil Access Token dari Google OAuth2
async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: SCOPES
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

async function sendNotification(fcmToken, title, body, data = {}) {
  try {
    const accessToken = await getAccessToken();

    const message = {
      message: {
        token: fcmToken,
        notification: { title, body },
        data
      }
    };

    const projectId = JSON.parse(require('fs').readFileSync(SERVICE_ACCOUNT_PATH)).project_id;

    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const response = await axios.post(url, message, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    console.log("🔥 Notifikasi terkirim:", response.data);
  } catch (err) {
    console.error("❌ Gagal kirim notifikasi:", err.response?.data || err);
  }
}

module.exports = sendNotification;
