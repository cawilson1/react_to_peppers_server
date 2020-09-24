require("dotenv").config();
const sql = require("mysql2/promise");

const pool = sql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// (async function() {
//   try {
//     const conn = await pool.getConnection();
//     console.log(conn, "connection successful");
//     conn.release();
//   } catch (error) {
//     console.log(error);
//   }
// })();

(async function createUserTable() {
  try {
    const conn = await pool.getConnection();

    conn.query("CREATE DATABASE IF NOT EXISTS peppers");
    conn.query("USE peppers");
    const userDb = await conn.query(
      "CREATE TABLE IF NOT EXISTS user (username VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, PRIMARY KEY(username))"
    );
    console.log(userDb);
    conn.release();
  } catch (error) {
    console.log(error);
  }
})();
