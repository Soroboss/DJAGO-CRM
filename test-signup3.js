const url = process.env.VITE_INSFORGE_URL;
const key = process.env.VITE_INSFORGE_ANON_KEY;
const email = `test_${Date.now()}@example.com`;
const password = "Password123!";

async function test() {
  try {
    const res = await fetch(`${url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key
      },
      body: JSON.stringify({ email, password })
    });
    const text = await res.text();
    console.log("Response:", res.status, text);
  } catch(e) {
    console.error(e);
  }
}
test();
