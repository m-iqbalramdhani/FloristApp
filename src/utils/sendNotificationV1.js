const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

// Ambil kredensial service account dari ENV
function getServiceAccountCredentials() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env not set');
  }

  try {
    return JSON.parse(json);
  } catch (e) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }
}

// Ambil Access Token dari Google OAuth2
async function getAccessToken(credentials) {
  const auth = new GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

async function sendNotification(fcmToken, title, body, data = {}) {
  try {
    const credentials = getServiceAccountCredentials();
    const accessToken = await getAccessToken(credentials);

    const message = {
      message: {
        token: fcmToken,
        notification: { title, body },
        data,
      },
    };

    const projectId = credentials.project_id;
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const response = await axios.post(url, message, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔥 Notifikasi terkirim:', response.data);
  } catch (err) {
    console.error('❌ Gagal kirim notifikasi:', err.response?.data || err);
  }
}

module.exports = sendNotification;
