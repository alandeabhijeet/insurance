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
    authorize('agent', req.params.id)(req, res, next);
}, (req, res) => {
    const id = req.params.id;
    const q = "SELECT * FROM users WHERE id = ?";
    connection.query(q, [id], (err, result) => {
        //console.log(cust[0]);
        res.render("./agent/main.ejs", { id, user: result[0] });
    });
});

router.get("/:id/coverages", (req, res) => {
    const id = req.params.quote_id;
    const q = "select * FROM coverage ";
    connection.query(q,  (err,coverages) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.render("./agent/coverage.ejs", { id,coverages });
        }
    });
});
router.get("/:id/customer", (req, res, next) => {
    authorize('agent', req.params.id)(req, res, next);
}, (req, res) => {
    const id = req.params.id;
    const q = "SELECT * FROM customer ";
    connection.query(q, (err, customer) => {
        res.render("./agent/customer.ejs", { id, customer});
    });
});

router.get("/:id/:cust_id/application", (req, res) => {
    const id = req.params.cust_id;
    const q = "SELECT * FROM application WHERE cust_id = ?";
    connection.query(q, [id], (err, applications) => {
       // console.log(applications[0]);
        res.render("./agent/application.ejs", { id, application: applications });
    });
});

router.get("/:id/:cust_id/delete/:app_id", (req, res) => {
    const iid = req.params.app_id;
    let id = req.params.id;
    const q = "DELETE FROM APPLICATION WHERE application_id = ?";
    connection.query(q, [iid], (err, result) => {
        if (err) {
            // handle error appropriately, e.g., send an error response
            console.error(err);
            return res.status(500).send("Error deleting application");
        }
        // Redirect to the appropriate route
        // res.redirect(`/agent/${id}`,{id});
    });
    res.send("Item Deleted");
});




router.get("/:id/:customerId/quotes/:applicationId", (req, res) => {
    const id = req.params.customerId;
    const application_id = req.params.applicationId;

    const q = "SELECT * FROM quote WHERE application_id = ? and cust_id = ? ";
    connection.query(q, [application_id, id ], (err, quotes) => {
        let q2 = "SELECT application_status FROM application WHERE application_id = ?  ";
        connection.query(q2,[application_id],(err,sta)=>{
            res.render("./agent/quote.ejs", { id, quotes: quotes,status : sta[0].application_status });
        })
        
    });
});


router.get("/:id/:quotes", (req, res) => {
    // const id = req.params.quote_id;
    const q = "DELETE FROM quote WHERE quote_id = ?";
    connection.query(q, [id], (err, quotes) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        }
        else {
            res.redirect("/agent/${id}/quote.ejs");
        }
    });
});

router.get("/:id/:cust_id/quotes/update/:quote_id", (req, res) => {
    const id = req.params.quote_id;
    const q = "select * FROM quote WHERE quote_id = ?";
    connection.query(q, [id], (err, quotes) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        }
        else {
            res.render("./agent/update-quote.ejs", { id, quotes: quotes[0] });
        }
    });
});













router.get("/:id/policies/premium-payment/:cust_id/:pol_num/:agg", (req, res) => {
    const id = req.params.cust_id;
    const policy_number = req.params.pol_num;
    let agg = req.params.agg;
    connection


    const q = "select * FROM premium_payment WHERE agreement_id = ?";
    connection.query(q, [agg], (err, premium) => {
        if (err) {
            res.send(err);
        }
        else {
            res.render("./agent/premium-payment.ejs",{id:id,premium: premium[0]});
        }
    })
});

router.post("/:id/policies/premium-payment/:cust_id/:pol_num/:payId/:agg", (req, res) => {
    const coverage_id = req.params.pol_num;
    let aggId = req.params.agg;
    const receipt_id = generateUniqueId();
    const cust_id = req.params.cust_id;
    q = "CALL premium_payment (?, ?, ?, ?)"
    connection.query(q, [receipt_id,  cust_id, coverage_id, aggId], (err, result) => {
        console.log(result);
        if (err) {
            console.error(err);
            res.status(500).send("Error inserting receipt");
        } else if(result[0][0].result == 0) {
            console.log("Receipt inserted successfully");
            res.status(200).send("Receipt inserted successfully");
        }
        else {
            res.send("Expired")
        }
    });
});

router.post("/:id/policies/renew/:polID", (req, res) => {
    const { agreement_id, application_id, cust_id } = req.body;
    const policy_number = req.params.polID;
    const policy_renewable_id = generateUniqueId();
    const q1 = "call renewPolicy(?, ?, ?, ?, ?)";
    connection.query(q1, [ agreement_id, application_id, cust_id, policy_number, policy_renewable_id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error renewing policy");
        } else {
            res.send("Policy Renewed");
        }
    });
});

















router.post("/:id/update/:quote_id", (req, res) => {
    const id = req.params.id;
    const quoteId = req.params.quote_id;
    const { quote_id, application_id, cust_id, issue_date, valid_from_date, valid_till_date, description, product_id, coverage_level } = req.body;
    
    const q = "UPDATE quote SET quote_id = ?, application_id = ?, cust_id = ?, issue_date = ?, valid_from_date = ?, valid_till_date = ?, description = ?, product_id = ?, coverage_level = ? WHERE quote_id = ?";
    let data = [quote_id, application_id, cust_id, issue_date, valid_from_date, valid_till_date, description, product_id, coverage_level, quoteId];
    connection.query(q, data, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');

        } else {
            res.redirect(`/agent/${id}/quotes`);
        }
    });
});
router.get("/:id/:cust/quotes/s/:app/:quote_id", (req, res) => {
    let q = req.params.quote_id;
    res.render("./agent/service.ejs",{q});
});


router.post("/:id/:cust/quotes/s/:app/:quote_id/accept", (req, res) => {
    const cust = req.params.cust; // Corrected parameter name
    const quoteId = req.params.quote_id;
    const appId = req.params.app; // No need to declare as let if it's not going to change
    let serId = generateUniqueId();
    let perId = generateUniqueId();
    let {department_name,vehicle_service_address,vehicle_service_contact,vehicle_service_incharge,vehicle_service_type} = req.body;
    let q = "CALL process_application (?,?, ?,?,?,?,?,?,?,?)"; // Adjusted query to match the stored procedure parameters
    connection.query(q, [quoteId, appId,cust,serId,department_name,vehicle_service_address,vehicle_service_contact,vehicle_service_incharge,vehicle_service_type,perId], (err, qres) => {
        if (err) { 
            console.error(err); 
            res.status(500).send("Internal Server Error"); 
            return; 
        }
        res.send("Quote Accepted"); 
    });
});
router.get("/:id/policies/:cust_id", (req, res) => {
    const id = req.params.cust_id;
    const q = "select * FROM insurance_policy WHERE cust_id = ?";
    connection.query(q, [id], (err, policy) => {
        if (err) {
            res.send(err);
        }
        else {
            res.render("./agent/insurance_policies.ejs", { id,policy});
        }
    });
        
});

router.get("/:id/policies/:cust_id/:app_id/:agg", (req, res) => {
    const aggid = req.params.agg;
    const id=req.params.id;
    const cust_id=req.params.cust_id;
    const app_id=req.params.app_id;
    res.render("./agent/claim.ejs",{id,cust_id,app_id,aggid});
    
});
router.post("/:id/policies/:cust_id/:app_id/:agg", (req, res) => {
    const aggid = req.params.agg;
    const id = req.params.id;
    const cust_id = req.params.cust_id;
    const app_id = req.params.app_id;
    let claim_id = generateUniqueId();
    let { claim_amount, damage_type, date_of_claim } = req.body;
    
    // Formulate the SQL query to call the stored procedure
    let q = `CALL InsertClaim('${claim_id}',
        '${cust_id}',
        '${aggid}',
        ${claim_amount},
        '${damage_type}',
        '${date_of_claim}',
        'pending'
    )`;
    
    // Execute the query
    connection.query(q, (err, result) => {
        if (err) {
            console.error("Error inserting claim:", err);
            res.status(500).send("Error inserting claim");
        } else {
            console.log("Claim inserted successfully");
            res.status(200).send("Claim inserted successfully");
        }
    });
});







router.get("/:id/:cust_id/create-application", (req, res) => {
    const id = req.params.quote_id;
    
     res.render("./agent/create-application.ejs", { id});
        
});



  router.post("/:id/:cust_id/create-application", (req, res) => {
    const {
        coverage_id,
        nok_name,
        nok_address,
        nok_phone_number,
        nok_marital_status,
        nok_gender,
        vehicle_registration_number,
        vehicle_value,
        vehicle_type,
        vehicle_size,
        vehicle_number_of_seats,
        vehicle_manufacturer,
        vehicle_chasis_number,
        vehicle_number,
        vehicle_model_number
    } = req.body;

    let t = 'pending';
    const { id, cust_id } = req.params;

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 2);

    const formattedNextYear = nextYear.toISOString().slice(0, 10);
    let app_id = generateUniqueId();
    let p_nok_id= generateUniqueId();
    let p_agreement_id=generateUniqueId();
    let quoteid = generateUniqueId();
    const q = "CALL insert_application_data_with_nok_and_vehicle(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)";
    const data = [
        app_id,
        cust_id,
        vehicle_registration_number,
        t,
        coverage_id,
        p_nok_id,
        p_agreement_id,
        nok_name,
        nok_address,
        nok_phone_number,
        nok_marital_status,
        nok_gender,
        coverage_id,
        p_nok_id,
        vehicle_registration_number,
        vehicle_value,
        vehicle_type,
        vehicle_size,
        vehicle_number_of_seats,
        vehicle_manufacturer,
        vehicle_chasis_number,
        vehicle_number,
        vehicle_model_number,
        quoteid,
        formattedDate,
        formattedDate,
        formattedNextYear
    ];
    
    connection.query(q, data, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            
            res.send("Application Successful")
        }
    });
});


router.get("/:id/policies/:cust_id/:agg", (req, res) => {
    const cust_id = req.params.cust_id;
    const aggid=req.params.agg;
    const id = req.params.id;

    const q = "select * FROM claim WHERE agreement_id = ?";
    connection.query(q, [aggid], (err, claim) => {
        if (err) {
            res.send(err);
        }
        else {
            res.render("./agent/see_claims.ejs", { id,claim});
        }
    });
        
});




























































module.exports = router;