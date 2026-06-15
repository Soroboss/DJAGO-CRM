import { createClient } from '@insforge/sdk';

const VITE_INSFORGE_URL = 'https://5dme2uf5.eu-central.insforge.app';
const VITE_INSFORGE_ANON_KEY = 'ik_e1defe1620c1ccf0321ba69637d8f146';

const tempClient = createClient({
  baseUrl: VITE_INSFORGE_URL,
  anonKey: VITE_INSFORGE_ANON_KEY,
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function test() {
  const result = await tempClient.auth.signUp({
    email: `test_sdk_2_${Date.now()}@example.com`,
    password: 'Password123!',
    options: {
      data: { name: 'Test', role: 'manager' }
    }
  });
  console.log("Full result:", JSON.stringify(result, null, 2));
}

test();
