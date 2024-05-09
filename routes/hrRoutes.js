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
router.post('/:id/:com/:dep/office', (req, res) => {
    let department_name = req.params.dep;
    let company_name = req.params.com;
    const { office_name, office_leader, contact_information, address, admin_cost, staff } = req.body;

    const query = 'INSERT INTO office (office_name,department_name,company_name, office_leader, contact_information, address, admin_cost, staff) VALUES (?,?,?, ?, ?, ?, ?, ?)';

    connection.query(query, [office_name,department_name,company_name, office_leader, contact_information, address, admin_cost, staff], (error, results) => {
        
        res.status(200).send('Data inserted into office table successfully');
    });
});
router.post("/:id/:name/department",(req,res)=>{
    let company_name = req.params.name;
    let {department_name,contact_information,department_staff,department_leader}=req.body;
    const sql = "INSERT INTO department (department_name, company_name, contact_information, department_staff, department_leader) VALUES (?, ?, ?, ?, ?)";
  const values = [department_name, company_name, contact_information, department_staff, department_leader];

  connection.query(sql, values, (err, result) => {
    if (err) return;
    
    console.log('Data inserted into department table successfully');
    res.status(200).send('Data inserted into department table successfully');
  });
});
router.get("/:id/:name/staff", (req, res) => {
  const { id, name } = req.params; // Destructuring assignment to extract id and name
  const q = "SELECT * FROM staff WHERE company_name = ?";
  connection.query(q, [name], (err, staff) => { // Use name instead of company_name
      if (err) {
          // Handle error
          console.error("Error fetching staff:", err);
          res.status(500).send("Error fetching staff");
          return;
      }
      res.render("./hr/staff.ejs", { id, staff }); // Pass id and staff to the view
  });
});

router.post("/:id/:name/staff",(req,res)=>{
    let company_name = req.params.name;
    let staff_id = generateUniqueId();
    const { staff_fname, staff_lname, staff_address, staff_contact, staff_gender, staff_marital_status, staff_nationality, staff_qualification, staff_allowance, staff_pps_number } = req.body;

    const sql = "INSERT INTO staff (staff_id,company_name,staff_fname, staff_lname, staff_address, staff_contact, staff_gender, staff_marital_status, staff_nationality, staff_qualification, staff_allowance, staff_pps_number) VALUES (?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [staff_id,company_name,staff_fname, staff_lname, staff_address, staff_contact, staff_gender, staff_marital_status, staff_nationality, staff_qualification, staff_allowance, staff_pps_number];

    connection.query(sql, values, (err, result) => {
        if (err) {
          console.error('Error inserting data into staff table: ' + err.stack);
          res.status(500).send('Error inserting data into staff table');
          return;
        }
        console.log('Data inserted into staff table successfully');
        res.status(200).send('Data inserted into staff table successfully');
      });
});

router.get("/:id", (req, res, next) => {
    authorize('hr', req.params.id)(req, res, next);
}, (req, res) => {
    const id = req.params.id;
    res.render("./hr/main.ejs",{id});
});

router.get("/:id/companies", (req, res) => {
    const id = req.params.id;
    const q = "SELECT * FROM insurance_companies ";
    connection.query(q, (err, companies) => {
        res.render("./hr/companies.ejs", { id, companies});
    });
});

router.get("/:id/:name/staff/delete/:key",(req,res)=>{
    let key = req.params.key;
    const sql = "DELETE FROM staff WHERE staff_id = ?";
    connection.query(sql, [key], (err, result) => {
        if (err) {
          console.error('Error deleting data from staff table: ' + err.stack);
          res.status(500).send('Error deleting data from staff table');
          return;
        }
        console.log('Data deleted from staff table successfully');
        res.status(200).send('Data deleted from staff table successfully');
      });
});


router.get("/:id/:name/department",(req,res)=>{
    let id = req.params.id;
    let name=req.params.name;
    const q = "SELECT * FROM department WHERE company_name = ?";
    connection.query(q, [name], (err, department) => {
         res.render("./hr/department.ejs", { id, department });
     });

})

router.get("/:id/:name/department/delete/:key",(req,res)=>{
    let key = req.params.key;
    const sql = "DELETE FROM department WHERE department_name = ?";
    connection.query(sql, [key], (err, result) => {
        if (err) {
          console.error('Error deleting data from staff table: ' + err.stack);
          res.status(500).send('Error deleting data from staff table');
          return;
        }
        console.log('Data deleted from staff table successfully');
        res.status(200).send('Data deleted from staff table successfully');
      });

})

router.get("/:id/:name/:department/office",(req,res)=>{
    let id = req.params.id;
    let name=req.params.name;
    let department= req.params.department;
    const q = "SELECT * FROM office WHERE company_name = ? AND department_name = ?";
    connection.query(q, [name,department], (err, offices) => {
         res.render("./hr/office.ejs", { id, offices });
     });

})

router.get("/:id/:name/:department/office/delete/:key",(req,res)=>{
    let key = req.params.key;
    const sql = "DELETE FROM office WHERE office_name = ?";
    connection.query(sql, [key], (err, result) => {
        if (err) {
          console.error('Error deleting data from staff table: ' + err.stack);
          res.status(500).send('Error deleting data from staff table');
          return;
        }
        console.log('Data deleted from staff table successfully');
        res.status(200).send('Data deleted from staff table successfully');
      });

})

module.exports = router;