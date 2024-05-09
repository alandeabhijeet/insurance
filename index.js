let mysql = require("mysql2");
let express = require("express");
let methodOverride = require("method-override");
let app = express();
const { v4: uuidv4 } = require('uuid');
const customerRoutes = require('./routes/customerRoutes');
let jwt = require("jsonwebtoken");
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(express.static('public'));
const path = require("path");
const agentRoutes = require('./routes/agentRoutes');
const inspectorRoutes = require('./routes/inspectorRoutes');
const financeRoutes = require('./routes/financeRoutes');
const hrRoutes = require('./routes/hrRoutes');
app.use(cookieParser());
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'dbms',
    password: '22bcs007'
});

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

let port = 8080;
const generateUniqueId = () => {
    const uuid = uuidv4();
    return uuid.substring(0, 4);
  };
app.listen(port, () => {
    console.log("Server started");
});
app.get("/", (req, res) => {
    res.render("index.ejs");
});
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})
app.post("/account", (req, res) => {
    const {
      cust_fname,
      cust_lname,
      cust_DOB,
      cust_gender,
      cust_mob_number,
      cust_email,
      cust_passport_number,
      cust_martial_status,
      membership_type,
      cust_ppS_number,
      user_role,
      password
    } = req.body;
  
    const Id = generateUniqueId();
    const MId = generateUniqueId();
    const sql = `CALL Insert_Customer(
      '${cust_fname}',
      '${cust_lname}',
      '${cust_DOB}',
      '${cust_gender}',
      '${cust_mob_number}',
      '${cust_email}',
      '${cust_passport_number}',
      '${cust_martial_status}',
      '${cust_ppS_number}',
      '${password}',
      '${Id}',
      '${membership_type}',
      '${MId}',
      '${user_role}'
    )`;
  
    connection.query(sql, (error, results) => {
      if (error) {
        console.error('Error executing stored procedure: ' + error.message);
        res.status(500).send('Error executing stored procedure');
        return;
      }
      console.log('Stored procedure executed successfully');
      res.status(200).send('Account created successfully');
    });
  });
let myid;
app.post('/login', (req, res) => {
    
    const { username, password } = req.body;
    console.log(`${username} ${password}`);
    connection.query('SELECT * FROM users WHERE name = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        } else if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign({ id: user.id, role: user.role }, 'your_secret_key', { expiresIn: '1h' });
            //console.log("Check");
            
            res.cookie('token', token, { httpOnly: true, maxAge: 360000000000 }); 
            //console.log("After Token");
            myid=user.id;
            let redirectUrl;
            redirectUrl = `/${user.role}/${user.id}`;
            res.redirect(redirectUrl);

        } else {
            res.status(401).send('Unauthorized');
        }
    });
});

function authorize(role) {
    // console.log(`Myid ${myid}`);
    return (req, res, next) => {
        const token = req.cookies.token;
        // console.log(token);
        if (!token) {
            return res.status(401).send('Unauthorized bye');
        }

        jwt.verify(token, 'your_secret_key', (err, decoded) => {
            if (err) return res.status(401).send('Unauthorized');
            // console.log("Nu");
            // console.log(decoded);
            // console.log(`Myid ${myid}`);
            const userRole = decoded.role;
            if (userRole !== role ) return res.status(403).send('Forbidden');
            req.token = token; 
            next();
        });
    };
}

app.use('/customer', authorize('customer'), customerRoutes);

app.use('/agent', authorize('agent'), agentRoutes);

app.use('/inspector', authorize('inspector'), inspectorRoutes);

app.use('/hr', authorize('hr'), hrRoutes);

app.use('/finance', authorize('finance'), financeRoutes);



module.exports = myid;