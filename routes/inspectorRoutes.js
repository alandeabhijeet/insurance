const express = require('express');
let mysql = require("mysql2");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
router.use(express.static("./public"));
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'dbms',
    password: '22bcs007'
});
const generateUniqueId = () => {
    const uuid = uuidv4();
    return uuid.substring(0, 4);
  };
function authorize(role, id) {
    return (req, res, next) => {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send('Unauthorized bye');
        }

        jwt.verify(token, 'your_secret_key', (err, decoded) => {
            if (err) return res.status(401).send('Unauthorized');
            // console.log("Decoded token:", JSON.stringify(decoded, null, 2));
            const { id : userId, role: userRole } = decoded; // Extracting id and role
            if (userRole !== role) return res.status(403).send('Forbidden');
            if (userId !== id) return res.status(403).send('Forbidden');
            next();
        });
        
    };
}

router.get("/:id", (req, res, next) => {
    authorize('inspector', req.params.id)(req, res, next);
}, (req, res) => {
    const id = req.params.id;
    res.render("./inspector/main.ejs",{id});
});

router.post("/:id/incident",(req,res)=>{
    console.log("Hello");
    const {
        cust_id,
        agreement_id,
        incident_inspector,
        incident_cost,
        incident_type,
        incident_date,
        incident_report_description
    } = req.body;
    let incident_report_id = generateUniqueId();
    let incident_id =  generateUniqueId();

    connection.query(
        'CALL Insert_Incident_Report(?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          incident_id,
          incident_type,
          incident_date, // Assuming current date for INCIDENT_DATE
          incident_report_description, // Assuming empty description for now
          incident_report_id,
          cust_id,
          incident_inspector,
          incident_cost,
          incident_type,
          incident_report_description,
          agreement_id
        ],
        (err, results) => {
          if (err) {
            console.error("Error inserting incident report:", err);
            res.status(500).send("Error inserting incident report");
            return;
          }
          res.status(200).send("Incident report inserted successfully");
        }
      );
})



module.exports = router;