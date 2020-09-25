require("dotenv").config();
const sql = require("mysql2/promise");
const express = require("express");
const bcrypt = require("bcrypt");
const PORT = 4000;
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

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
    console.log("POST ALL PEPPERS");
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

app.get("/allusers", async (request, response) => {
  console.log("POST GET PEPPERS BY USER");
  try {
    const conn = await pool.getConnection();
    const queryResponse = await conn.query(`SELECT * FROM peppers.user`);
    conn.release();
    const peppers = queryResponse[0];
    response.status(200).send(peppers);
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.post("/getpeppersbyuser", authorizeUser, async (request, response) => {
  console.log("POST GET PEPPERS BY USER");
  try {
    const conn = await pool.getConnection();
    const username = request.decodedToken.username;
    const queryResponse = await conn.query(
      `SELECT * FROM peppers.pepper WHERE user=?`,
      [username]
    );
    conn.release();
    const peppers = queryResponse[0];
    response.status(200).send(peppers);
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.post("/sharepepper", authorizeUser, async (request, response) => {
  try {
    if (!request.body.user || !request.body.pepperid)
      return response.status(401).send({ message: "Missing required field" });

    const user = request.body.user;
    const pepperid = request.body.pepperid;

    const decodedToken = request.decodedToken;
    console.log(decodedToken);
    //   const user = decodedToken.username;

    const conn = await pool.getConnection();

    const pepperChecker = await conn.execute(
      `SELECT user FROM peppers.pepper WHERE id = ?`,
      [pepperid]
    );

    console.log("pepperChecker", pepperChecker[0]);
    if (!(pepperChecker[0][0].user === decodedToken.username)) {
      return response.status(403).send({ message: "FAKE!" });
    }

    const queryResponse = await conn.execute(
      `INSERT INTO peppers.pepperfriends (user, pepperid) VALUES (?,?)`,
      [user, pepperid]
    );
    conn.release();
    response.status(201).send(queryResponse);
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.post("/sharedpeppersbyuser", authorizeUser, async (request, response) => {
  console.log("GET SHARED PEPPERS FOR ", request.decodedToken.username);
  try {
    const user = request.decodedToken.username;
    const conn = await pool.getConnection();

    const queryResponse = await conn.execute(
      `SELECT * FROM
        (SELECT id,name,scoville,pic,flavor,color,species,growthtimemonths,size,PF.user FROM peppers.pepperfriends AS PF JOIN peppers.pepper AS PP ON PP.id = PF.pepperid) 
         AS temp
        WHERE temp.user = ?
      `,
      [user]
    );

    const peppers = queryResponse[0];

    conn.release();
    response.status(201).send(peppers);
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

function authorizeUser(request, response, next) {
  const token = request.body.jwt;
  if (token == null) {
    console.log(token, "token is null");
    return response.status(401).send();
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) return response.status(403).send();
    request.decodedToken = decodedToken;
    console.log("decoded token", decodedToken);
    next();
  });
}

app.listen(PORT, () => console.log(`server is running on ${PORT}`));
