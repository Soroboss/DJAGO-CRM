import pg from 'pg';
const client = new pg.Client("postgresql://postgres:d3c18b276365350fc78cffbaf8c49447@5dme2uf5.eu-central.database.insforge.app:5432/insforge?sslmode=require");

async function main() {
  await client.connect();
  try {
    await client.query("BEGIN");
    
    // Set role to authenticated to trigger RLS
    await client.query(`SET LOCAL role = 'authenticated'`);
    // Set a fake user id in the JWT claims
    await client.query(`SET LOCAL request.jwt.claims = '{"sub": "12345678-1234-5678-1234-567812345678", "role": "authenticated"}'`);
    
    // Try to insert
    const res = await client.query(`
      INSERT INTO organizations (id, name, industry_category) 
      VALUES ('11111111-1111-1111-1111-111111111111', 'Test Org', 'technology')
    `);
    console.log("Insert success:", res.rowCount);
    
    await client.query("ROLLBACK");
  } catch(e) {
    console.error("DB Error:", e);
  }
  client.end();
}
main();
