import pg from 'pg';
const client = new pg.Client("postgresql://postgres:d3c18b276365350fc78cffbaf8c49447@5dme2uf5.eu-central.database.insforge.app:5432/insforge?sslmode=require");
async function main() {
  await client.connect();
  try {
    const res = await client.query("SELECT count(*) FROM organizations");
    console.log("Organizations count:", res.rows[0].count);
  } catch(e) {
    console.error("DB Error:", e.message);
  }
  client.end();
}
main();
