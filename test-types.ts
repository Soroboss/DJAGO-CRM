import { createClient } from '@insforge/sdk';
const client = createClient({ baseUrl: 'http://a', anonKey: 'b' });
type AuthMethods = keyof typeof client.auth;
