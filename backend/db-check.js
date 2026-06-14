const postgres = require('postgres');
const sql = postgres('postgres://admin:password123@localhost:5432/power_meter');

async function check() {
  try {
    const result = await sql`SELECT MIN(timestamp) as min, MAX(timestamp) as max, COUNT(*) as count FROM telemetry`;
    console.log(result[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
check();
