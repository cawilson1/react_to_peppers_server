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

app.post("/pepper", authorizeUser, async (request, response) => {
  try {
    if (!request.body.name || !request.body.pic || !request.body.scoville)
      return response.status(401).send({ message: "Missing required field" });

    const name = request.body.name;
    const pic = request.body.pic;
    const scoville = request.body.scoville;
    const flavor = request.body.flavor;
    const color = request.body.color;
    const species = request.body.species;
    const growthtimemonths = request.body.growthtimemonths;
    const size = request.body.size;

    const decodedToken = request.decodedToken;
    console.log(decodedToken);
    const user = decodedToken.username;

    const conn = await pool.getConnection();
    const queryResponse = await conn.execute(
      `INSERT INTO peppers.pepper (name, pic,user,scoville,flavor,color,species,growthtimemonths,size) VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        name,
        pic,
        user,
        scoville,
        flavor,
        color,
        species,
        growthtimemonths,
        size
      ]
    );
    conn.release();
    response.status(201).send(queryResponse);
    response.sendStatus(200);
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.post("/getpeppers", authorizeUser, async (request, response) => {
  try {
    const conn = await pool.getConnection();
    const queryResponse = await conn.query(`SELECT * FROM peppers.pepper`);
    conn.release();
    const peppers = queryResponse[0];
    response.status(200).send(peppers);
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

function authorizeUser(request, response, next) {
  const token = request.body.jwt;
  if (token == null) {
    console.log(token, "token is null");
    response.status(401).send();
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) return response.status(403).send();
    request.decodedToken = decodedToken;
    console.log("decoded token", decodedToken);
    next();
  });
}

app.listen(PORT, () => console.log(`server is running on ${PORT}`));
