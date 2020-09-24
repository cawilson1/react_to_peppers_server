require("dotenv").config();
const sql = require("mysql2/promise");
const express = require("express");
const bcrypt = require("bcrypt");
const PORT = 4000;
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

const pool = sql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

app.post("/user", async (request, response) => {
  try {
    if (!request.body.username || !request.body.password)
      return response
        .status(401)
        .send({ message: "Missing username or password" });

    const username = request.body.username;
    const password = request.body.password;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const conn = await pool.getConnection();
    const queryResponse = await conn.execute(
      `INSERT INTO peppers.user (username, password) VALUES (?,?)`,
      [username, hashedPassword]
    );
    conn.release();
    response.status(201).send(queryResponse);
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.post("/login", async (request, response) => {
  try {
    if (!request.body.username || !request.body.password)
      return response
        .status(401)
        .send({ message: "Missing username or password" });

    const username = request.body.username;
    const password = request.body.password;
    const conn = await pool.getConnection();
    const queryResponse = await conn.execute(
      `SELECT * FROM peppers.user WHERE username = ?`,
      [username]
    );
    const fetchedUser = queryResponse[0][0];
    if (!fetchedUser)
      response.status(401).send({ message: "User does not exist" });
    else {
      if (await bcrypt.compare(password, fetchedUser.password)) {
        const username = fetchedUser.username;

        const jwtToken = jwt.sign(
          { username: username },
          process.env.JWT_SECRET
        );
        response
          .status(200)
          .send({ message: "successfully authenticated", jwt: jwtToken });
      } else {
        response.status(401).send({ message: "incorrect password" });
      }
    }

    console.log(fetchedUser);
    conn.release();
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.listen(PORT, () => console.log(`server is running on ${PORT}`));
