const url = process.env.VITE_INSFORGE_URL;
const key = process.env.VITE_INSFORGE_ANON_KEY;
const email = `test_${Date.now()}@example.com`;
const password = "Password123!";

async function test() {
  console.log("Signup URL:", `${url}/auth/v1/signup`);
  try {
    const res = await fetch(`${url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log("Response:", res.status, data);
  } catch(e) {
    console.error(e);
  }
}
test();
