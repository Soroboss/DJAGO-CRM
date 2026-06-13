const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:d3c18b276365350fc78cffbaf8c49447@5dme2uf5.eu-central.database.insforge.app:5432/insforge?sslmode=require"
  });
  await client.connect();
  const sql = fs.readFileSync('saas_migration.sql', 'utf8');
  try {
    await client.query(sql);
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}
run();
