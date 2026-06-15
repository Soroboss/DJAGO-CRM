import { createClient } from '@insforge/sdk';

const VITE_INSFORGE_URL = 'https://5dme2uf5.eu-central.insforge.app';
const VITE_INSFORGE_ANON_KEY = 'ik_e1defe1620c1ccf0321ba69637d8f146';

const tempClient = createClient({
  baseUrl: VITE_INSFORGE_URL,
  anonKey: VITE_INSFORGE_ANON_KEY
});

async function testFullFlow() {
  const email = `test_flow_${Date.now()}@example.com`;
  console.log("Signing up:", email);
  
  // 1. Sign up
  const { data, error } = await tempClient.auth.signUp({
    email,
    password: 'Password123!',
    name: 'Flow Test'
  });
  console.log("Signup Result:", data, error);

  // 2. RPC to get ID
  const { data: rpcData, error: rpcError } = await tempClient.database.rpc('get_user_id_by_email', { user_email: email });
  console.log("RPC Result:", rpcData, rpcError);

  if (rpcData) {
    // 3. Insert into team_members
    const { data: insertData, error: insertError } = await tempClient.database.from('team_members').insert({
      id: rpcData,
      name: 'Flow Test',
      email: email,
      role: 'commercial',
      zone: 'Global',
      organization_id: 'a0b94c0f-8c3b-4ab3-9c84-18c72836d5c5' // Any existing org ID
    });
    console.log("Insert Result:", insertData, insertError);
  }
}

testFullFlow();
