const VITE_INSFORGE_URL = 'https://5dme2uf5.eu-central.insforge.app';
const VITE_INSFORGE_ANON_KEY = 'ik_e1defe1620c1ccf0321ba69637d8f146';

async function testSignup() {
  try {
    const response = await fetch(`${VITE_INSFORGE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': VITE_INSFORGE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `test_collab_${Date.now()}@example.com`,
        password: 'Password123!',
        data: { name: 'Test Collab', role: 'manager' }
      })
    });
    const result = await response.json();
    console.log("Status:", response.status);
    console.log("Result:", result);
  } catch (e) {
    console.error("Error:", e);
  }
}

testSignup();
