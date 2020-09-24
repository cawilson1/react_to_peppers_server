///THIS FILE IS NOT THE SERVER, RUN IT TO CREATE DB AND DB TABLES

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

// (async function createUserTable() {
//   try {
//     const conn = await pool.getConnection();

//     conn.query("CREATE DATABASE IF NOT EXISTS peppers");
//     conn.query("USE peppers");
//     const userDb = await conn.query(
//       "CREATE TABLE IF NOT EXISTS user (username VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, PRIMARY KEY(username))"
//     );
//     console.log(userDb);
//     conn.release();
//   } catch (error) {
//     console.log(error);
//   }
// })();

// name: "Golden Cayenne", //VARCHAR(255) NOT NULL
// scoville: 40000, //heat //INT NOT NULL
// pic:
//   "https://edge.bonnieplants.com/www/tiny/uploads/20200810205412/golden-cayenne-pepper.jpg", //VARCHAR 2000 NOT NULL
// flavor: "spicy, sweet, apple-y", //VARCHAR (2000)
// color: "yellow", //VARCHAR (255)
// species: "capsicum annuum", //VARCHAR 255
// growthTimeMonths: 1, //TINYINT
// size: 4, //1-10 (1 smallest) //TINYINT
// id: 1, //INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY
// user: "Casey" //VARCHAR 255 FOREIGN KEY

// (async function createPepperTable() {
//   try {
//     const conn = await pool.getConnection();

//     conn.query("CREATE DATABASE IF NOT EXISTS peppers");
//     conn.query("USE peppers");
//     const userDb = await conn.query(
//       "CREATE TABLE IF NOT EXISTS pepper (id INT AUTO_INCREMENT NOT NULL UNIQUE, name VARCHAR(255) NOT NULL, scoville INT NOT NULL, pic VARCHAR(2000) NOT NULL, flavor VARCHAR(2000), color VARCHAR(255), species VARCHAR(255), growthtimemonths TINYINT, size TINYINT, user VARCHAR(255),  PRIMARY KEY(id), FOREIGN KEY (user) REFERENCES user(username))"
//     );
//     console.log(userDb);
//     conn.release();
//   } catch (error) {
//     console.log(error);
//   }
// })();

//user
//pepperid
// (async function createPepperfriendsTable() {
//   try {
//     const conn = await pool.getConnection();

//     conn.query("CREATE DATABASE IF NOT EXISTS peppers");
//     conn.query("USE peppers");
//     const userDb = await conn.query(
//       "CREATE TABLE IF NOT EXISTS pepperfriends (pepperid INT NOT NULL, user VARCHAR(255) NOT NULL,  PRIMARY KEY(pepperid,user), FOREIGN KEY (user) REFERENCES user(username), FOREIGN KEY(pepperid) REFERENCES pepper(id))"
//     );
//     console.log(userDb);
//     conn.release();
//   } catch (error) {
//     console.log(error);
//   }
// })();
