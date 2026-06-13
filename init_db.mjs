import fs from 'fs';
import pg from 'pg';

const connectionString = "postgresql://postgres:d3c18b276365350fc78cffbaf8c49447@5dme2uf5.eu-central.database.insforge.app:5432/insforge?sslmode=require";

async function main() {
  const sql = fs.readFileSync('supabase_schema.sql', 'utf8');
  const client = new pg.Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected to the database");
    await client.query(sql);
    console.log("Database initialized successfully!");
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
}

main();
