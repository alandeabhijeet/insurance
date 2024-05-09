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
    authorize('customer', req.params.id)(req, res, next);
}, (req, res) => {
    const id = req.params.id;
    const q = "SELECT * FROM customer WHERE cust_id = ?";
    connection.query(q, [id], (err, cust) => {
        //console.log(cust[0]);
        let fname = cust[0].cust_fname;
        let lname = cust[0].cust_lname;

        let q2 = "SELECT * FROM membership WHERE cust_id = ?";
        connection.query(q2, [id], (err, mem) => {
            res.render("./customer/main.ejs", { id, fname,lname,member : mem[0] });
        });
    });
});

router.get("/:id/application", (req, res) => {
    const id = req.params.id;
    const q = "SELECT * FROM application WHERE cust_id = ?";
    connection.query(q, [id], (err, applications) => {
       // console.log(applications[0]);
        res.render("./customer/application.ejs", { id, application: applications });
    });
});

router.get("/:id/profile",(req,res)=>{
    const id = req.params.id;
    const q = "SELECT * FROM customer WHERE CUST_ID = ?";
    connection.query(q, [id], (err, cust) => {
       // console.log(cust[0]);
        res.render("./customer/profile.ejs", { id, customer: cust[0] });
    });
})

router.get("/:id/application/:app_id", (req, res) => {
    const app_id = req.params.app_id;
    connection.query('CALL GetInsurancePolicy(?)', [app_id], (error, results, fields) => {
      
      res.render("./customer/policies.ejs", { app_id, item: results[0][0] });
    });
    
});

router.get("/:id/receipt",(req,res)=>{
    let id = req.params.id;
    let q = "select * from receipt where cust_id = ?";
    connection.query(q, [id], (err, receipt) => {
        res.render("./customer/receipt.ejs",{receipt});

    })
})






























module.exports = router;