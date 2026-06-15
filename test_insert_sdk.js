import { createClient } from '@insforge/sdk';
import 'dotenv/config'; // I can pass env vars manually

const client = createClient({ 
  baseUrl: 'https://5dme2uf5.eu-central.insforge.app', 
  anonKey: process.env.ANON_KEY 
});

async function main() {
  const { error } = await client.database
    .from('organizations')
    .insert({ id: '22222222-2222-2222-2222-222222222222', name: 'Test Org 2', industry_category: 'technology' });
    
  console.log("Error:", error);
}
main();
