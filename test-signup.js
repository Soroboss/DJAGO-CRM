import { createClient } from '@insforge/sdk';

const client = createClient({
  url: process.env.VITE_INSFORGE_URL,
  key: process.env.VITE_INSFORGE_ANON_KEY
});

async function run() {
  console.log("Testing signup...");
  const randomEmail = `test_${Date.now()}@example.com`;
  const { data, error } = await client.auth.signUp({
    email: randomEmail,
    password: "Password123!"
  });
  console.log("Signup Result:", data, error);
}

run();
