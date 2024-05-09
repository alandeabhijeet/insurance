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
    authorize('finance', req.params.id)(req, res, next);
}, (req, res) => {
    const id = req.params.id;
    res.render("./finance/main.ejs",{id});
});

router.get("/:id/claim", (req, res) => {
    const id = req.params.id;
    let tem = 'pending';
    const q = "SELECT c.*, i.*, p.policy_number, cov.coverage_amount FROM claim AS c INNER JOIN incident_report AS i ON c.incident_id = i.incident_id INNER JOIN insurance_policy AS p ON c.agreement_id = p.aggrement_id INNER JOIN coverage AS cov ON p.policy_number = cov.coverage_id WHERE c.claim_status = ?";

    connection.query(q, [tem], (err, claims) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        }
        else {
            res.render("./finance/claim.ejs", { id, claims });
        }
    });
});

router.post("/:id/:cust/:agg/:claim/a/:cov",(req,res)=>{
    let cust_id = req.params.cust;
    let agg_id = req.params.agg;
    let claim_id = req.params.claim;
    let cov = req.params.cov;

    let setId = generateUniqueId();
    let { amount_paid } = req.body;
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    // Call the stored procedure
    connection.query(
        "CALL process_claim(?, ?, ?, ?, ?, ?, ?)",
        [setId, cust_id, claim_id, agg_id, amount_paid, formattedDate, cov],
        (error, results, fields) => {
            if (error) {
                console.error("Error executing stored procedure:", error);
                res.status(500).json({ error: "An error occurred while processing the claim." });
            } else {
                console.log("Claim processed successfully!");
                res.status(200).json({ message: "Claim processed successfully!" });
            }
        }
    );
});



module.exports = router;