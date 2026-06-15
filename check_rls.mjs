import pg from 'pg';
const client = new pg.Client("postgresql://postgres:d3c18b276365350fc78cffbaf8c49447@5dme2uf5.eu-central.database.insforge.app:5432/insforge?sslmode=require");
async function main() {
  await client.connect();
  try {
    const res = await client.query("SELECT tgname FROM pg_trigger WHERE tgrelid = 'organizations'::regclass");
    console.log("Triggers:", res.rows);
  } catch(e) {
    console.error("DB Error:", e.message);
  }
  client.end();
}
main();
