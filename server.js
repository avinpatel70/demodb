require ('dotenv').config()
const oracledb = require('oracledb');
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
const app = express();
const corsOpts = {
    origin: '*',
  
    methods: [
      'GET',
      'POST',
    ],
  
    allowedHeaders: [
      'Content-Type',
    ],
  };
app.use(cors(corsOpts));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Connection Pool Configuration
console.log(process.env.ORACLE_HOME);
oracledb.initOracleClient({libDir: process.env.ORACLE_HOME});
async function startServer() {
  
  const pool = await oracledb.createPool({
        user: process.env.DBUSER,
        password: process.env.PASSWORD,
        connectString: process.env.CONNECTSTRING,
        poolMax: 10,
        poolMin: 2,
        poolIncrement: 2,
  });

// Signup API
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name+email+password)
  try {
    const options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      };
    const connection = await pool.getConnection();
    const query = `INSERT INTO users (name, email, password) VALUES (:name, :email, :password)`;
    const result = await connection.execute(query, [name, email, password],options);
    await connection.commit();
    res.status(200).send({ message: 'User registered successfully' });
    try {
      await connection.close();
    } catch (err) {
      console.error(err);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error registering user' });
  }  
});

// Login API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      };
    const connection = await pool.getConnection();
    const query = `SELECT * FROM users WHERE email = :email AND password = :password`;
    const result = await connection.execute(query, [email, password], );
    //await connection.commit();
    console.log(result.rows[0][0]);
    if (result.rows.length === 0) {
      res.send({ success: false, message: 'Invalid email or password' });
    } else {
      res.send({ success: true, message: 'User authenticated successfully', name:result.rows[0][0]});
      return true;
    }
    try {
      await connection.close();
    } catch (err) {
      console.error(err);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error authenticating user' });
  }
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
}
startServer();