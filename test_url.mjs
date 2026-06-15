import { createClient } from '@insforge/sdk';

const VITE_INSFORGE_URL = 'https://5dme2uf5.eu-central.insforge.app';
const VITE_INSFORGE_ANON_KEY = 'ik_e1defe1620c1ccf0321ba69637d8f146';

const tempClient = createClient({
  baseUrl: VITE_INSFORGE_URL,
  anonKey: VITE_INSFORGE_ANON_KEY
});

console.log(tempClient.auth.url); // Or whatever property stores the auth URL
