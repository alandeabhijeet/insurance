use dbms;

select * from customer;
create table users (
name varchar(70),
password varchar(50),
id varchar(20),
role varchar(25),
primary key (name , password)
);
insert into users values ("A","123","aaaa","agent");
insert into users values ("H","123","hhhh","hr");
insert into users values ("F","123","ffff","finance");
insert into users values ("C","123","cccc","customer");
insert into users values ("I","123","iiii","inspector");

ALTER TABLE nok
DROP FOREIGN KEY nok_ibfk_1;

ALTER TABLE incident_report
ADD COLUMN agreement_id VARCHAR(20);

ALTER TABLE premium_payment
ADD COLUMN agreement_id VARCHAR(20);

DELIMITER //

CREATE PROCEDURE GetInsurancePolicy(IN par_application_id varchar(20))
BEGIN
    DECLARE v_vehicle_id varchar(20);

    -- Fetch vehicle_id from the application table
    SELECT vehicle_id INTO v_vehicle_id
    FROM application
    WHERE application_id = par_application_id;

    -- Retrieve insurance policy details along with vehicle service information
    SELECT ip.*, nok.*, vs.*
    FROM insurance_policy AS ip
    INNER JOIN nok ON ip.aggrement_id = nok.agreement_id
    LEFT JOIN vehicle_service AS vs ON vs.vehicle_id = v_vehicle_id
    WHERE ip.application_id = par_application_id;
END//

DELIMITER ;



DELIMITER //

CREATE PROCEDURE Insert_Customer(
    
    IN p_cust_fname VARCHAR(10),
    IN p_cust_lname VARCHAR(10),
    IN p_cust_DOB DATE,
    IN p_cust_gender CHAR(2),
    IN p_cust_mob_number DECIMAL(10,0),
    IN p_cust_email VARCHAR(225),
    IN p_cust_passport_number VARCHAR(20),
    IN p_cust_martial_status CHAR(10),
    IN p_cust_ppS_number CHAR(9),
    IN p_user_password VARCHAR(50),
    IN p_cust_id VARCHAR(20),
    IN membership_type varchar(20),
    IN mid varchar(20),
    IN rrole varchar(25)
)
BEGIN
    DECLARE v_user_name VARCHAR(70);
    DECLARE v_role VARCHAR(25);

    -- Set user name and role
    SET v_user_name = p_cust_fname;
    SET v_role = rrole;

    -- Insert into customer table
    INSERT INTO customer (
        cust_id,
        cust_fname,
        cust_lname,
        cust_DOB,
        cust_gender,
        cust_mob_number,
        cust_email,
        cust_passport_number,
        cust_martial_status,
        cust_ppS_number
    ) VALUES (
        p_cust_id,
        p_cust_fname,
        p_cust_lname,
        p_cust_DOB,
        p_cust_gender,
        p_cust_mob_number,
        p_cust_email,
        p_cust_passport_number,
        p_cust_martial_status,
        p_cust_ppS_number
    );

    -- Insert into user table
    INSERT INTO users (
        name,
        password,
        id,
        role
    ) VALUES (
        v_user_name,
        p_user_password,
        p_cust_id,
        v_role
    );
    
    insert into membership values(
    mid,
    p_cust_id,
    membership_type,
    p_cust_mob_number
    );
END //

DELIMITER ;

-- drop PROCEDURE Insert_Customer;
DELIMITER //

CREATE PROCEDURE Insert_Incident_Report(
    IN p_incident_id VARCHAR(20),
    IN p_incident_type VARCHAR(30),
    IN p_incident_date DATE,
    IN p_description VARCHAR(100),
    IN p_incident_report_id VARCHAR(20),
    IN p_cust_id VARCHAR(20),
    IN p_incident_inspector VARCHAR(20),
    IN p_incident_cost INT,
    IN p_incident_type_report CHAR(30),
    IN p_incident_report_description VARCHAR(100),
    IN p_agg_id VARCHAR(20)
)
BEGIN
    INSERT INTO incident (INCIDENT_ID, INCIDENT_TYPE, INCIDENT_DATE, DESCRIPTION)
    VALUES (p_incident_id, p_incident_type, p_incident_date, p_description);

    INSERT INTO incident_report (incident_report_id, incident_id, cust_id, incident_inspector, incident_cost, incident_type, incident_report_description,agreement_id)
    VALUES (p_incident_report_id, p_incident_id, p_cust_id, p_incident_inspector, p_incident_cost, p_incident_type_report, p_incident_report_description,p_agg_id);
END //

DELIMITER ;













DELIMITER //

CREATE PROCEDURE insert_application_data_with_nok_and_vehicle(
    IN p_application_id VARCHAR(20),
    IN p_cust_id VARCHAR(20),
    IN p_vehicle_id VARCHAR(20),
    IN p_application_status ENUM('accepted', 'rejected', 'pending'),
    IN p_coverage VARCHAR(50),
    IN p_nok_id VARCHAR(20),
    IN p_agreement_id VARCHAR(20),
    IN p_nok_name VARCHAR(20),
    IN p_nok_address VARCHAR(20),
    IN p_nok_phone_number INT,
    IN p_nok_marital_status ENUM('married', 'unmarried'),
    IN p_nok_gender ENUM('m', 'f', 'o'),
    IN p_policy_id VARCHAR(20),
    IN p_dependent_nok_id VARCHAR(20),
    IN p_vehicle_registration_number VARCHAR(20),
    IN p_vehicle_value INT,
    IN p_vehicle_type VARCHAR(20),
    IN p_vehicle_size INT,
    IN p_vehicle_number_of_seat INT,
    IN p_vehicle_manufacturer VARCHAR(20),
    IN p_vehicle_chasis_number VARCHAR(30),
    IN p_vehicle_number VARCHAR(20),
    IN p_vehicle_model_number VARCHAR(20),
    IN p_quote_id VARCHAR(20),
    IN p_issue_date DATETIME,
    IN p_valid_from_date DATETIME,
    IN p_valid_till_date DATETIME
)
BEGIN
    DECLARE p_product_id VARCHAR(20);
    DECLARE p_coverage_level VARCHAR(20);
    -- Insert into application table
    INSERT INTO application (application_id, cust_id, vehicle_id, application_status, coverage)
    VALUES (p_application_id, p_cust_id, p_vehicle_id, p_application_status, p_coverage);

    -- Insert into nok table
    INSERT INTO nok (nok_id, agreement_id, application_id, cust_id, nok_name, nok_address, nok_phone_number, nok_marital_status, nok_gender)
    VALUES (p_nok_id, p_agreement_id, p_application_id, p_cust_id, p_nok_name, p_nok_address, p_nok_phone_number, p_nok_marital_status, p_nok_gender);
    
    -- Insert into vehicle table
    INSERT INTO vehicle (vehicle_id, cust_id, policy_id, dependent_nok_id, vehicle_registration_number, vehicle_value, vehicle_type, vehicle_size, vehicle_number_of_seat, vehicle_manufacturer, vehicle_chasis_number, vehicle_number, vehicle_model_number)
    VALUES (p_vehicle_id, p_cust_id, p_policy_id, p_dependent_nok_id, p_vehicle_registration_number, p_vehicle_value, p_vehicle_type, p_vehicle_size, p_vehicle_number_of_seat, p_vehicle_manufacturer, p_vehicle_chasis_number, p_vehicle_number, p_vehicle_model_number);
    
    SELECT  product_id, coverage_level
    INTO  p_product_id, p_coverage_level
    FROM coverage
    WHERE coverage_id = p_coverage;
    
    INSERT INTO quote (quote_id, application_id, cust_id, issue_date, valid_from_date, valid_till_date, description, product_id, coverage_level)
    VALUES (p_quote_id, p_application_id, p_cust_id, p_issue_date, p_valid_from_date, p_valid_till_date, 'no description', p_product_id, p_coverage_level);
END //

DELIMITER ;






DELIMITER //

CREATE PROCEDURE process_application(
    IN p_quote_id VARCHAR(20),
    IN p_app_id VARCHAR(20),
    IN p_cust_id VARCHAR(20),
    IN p_vehicle_service_id VARCHAR(20),
    IN p_department_name CHAR(20),
    IN p_vehicle_service_address VARCHAR(20),
    IN p_vehicle_service_contact VARCHAR(20),
    IN p_vehicle_service_incharge CHAR(20),
    IN p_vehicle_service_type VARCHAR(20),
    IN p_pri_id VARCHAR(20)
)
BEGIN
    DECLARE v_start_date DATETIME;
    DECLARE v_expiry_date DATETIME;
    DECLARE v_term_condition_description VARCHAR(100);
    DECLARE v_policy_number VARCHAR(20);
    DECLARE v_agreement_id VARCHAR(20);
	 DECLARE v_vehicle_id VARCHAR(20);
     declare v_am int ;

    SELECT valid_from_date, valid_till_date, description
    INTO v_start_date, v_expiry_date, v_term_condition_description
    FROM quote
    WHERE quote_id = p_quote_id;

    -- Get policy_number from application table
    SELECT coverage 
    INTO v_policy_number 
    FROM application
    WHERE application_id = p_app_id;
    
    
    SELECT coverage_amount 
    INTO v_am 
    FROM coverage
    WHERE coverage_id = v_policy_number;
    
    SELECT vehicle_id
    INTO v_vehicle_id
    FROM application
    WHERE application_id = p_app_id;
    -- Get department_name from coverage table
    

    -- Get agreement_id from nok table
    SELECT agreement_id
    INTO v_agreement_id
    FROM nok
    WHERE application_id = p_app_id;

    -- Set application status to 'accepted'
    UPDATE application
    SET application_status = 'accepted'
    WHERE application_id = p_app_id;

    -- Insert data into insurance_policy table
    INSERT INTO insurance_policy (aggrement_id, application_id, cust_id, department_name, policy_number, start_date, expiry_date, term_condition_description)
    VALUES (v_agreement_id, p_app_id, p_cust_id, p_department_name, v_policy_number, v_start_date, v_expiry_date, v_term_condition_description);
    
    INSERT INTO vehicle_service (vehicle_service, vehicle_id, cust_id, department_name, vehicle_service_address, vehicle_service_contact, vehicle_service_incharge, vehicle_service_type)
	VALUES(p_vehicle_service_id,v_vehicle_id,p_cust_id,p_department_name,p_vehicle_service_address,p_vehicle_service_contact,p_vehicle_service_incharge,p_vehicle_service_type);
    
    INSERT INTO premium_payment (premium_payment_id, cust_id, policy_number, premium_payment_schedule, premium_payment_amount,agreement_id) 
VALUES (p_pri_id, p_cust_id, v_policy_number, DATE_ADD(v_start_date, INTERVAL 1 YEAR), v_am/10,v_agreement_id);

END //

DELIMITER ;







DELIMITER //

CREATE PROCEDURE InsertClaim(IN p_claim_id VARCHAR(20),
    IN p_cust_id VARCHAR(20),
    IN p_agreement_id VARCHAR(20),
    IN p_claim_amount INT,
    IN p_damage_type VARCHAR(20),
    IN p_date_of_claim DATE,
    IN p_claim_status ENUM('accepted','rejected','pending')
)
BEGIN
    DECLARE v_incident_id VARCHAR(20);
   
    -- Retrieve incident_id based on agreement_id
    SELECT incident_id INTO v_incident_id
    FROM incident_report
    WHERE agreement_id = p_agreement_id
    LIMIT 1;
   
    -- Insert into claim table
    INSERT INTO claim (claim_id,
        cust_id,
        agreement_id,
        claim_amount,
        incident_id,
        damage_type,
        date_of_claim,
        claim_status
    ) VALUES (p_claim_id,
        p_cust_id,
        p_agreement_id,
        p_claim_amount,
        v_incident_id,
        p_damage_type,
        p_date_of_claim,
        p_claim_status
    );
END //

DELIMITER ;


DELIMITER //

CREATE PROCEDURE process_claim(
	IN p_set_id VARCHAR(20),
	IN p_cust_id VARCHAR(20),
    IN p_claim_id VARCHAR(20),
    IN p_agreement_id VARCHAR(20),
    IN p_amount_paid INT,
    IN p_date DATE,
    IN p_cov VARCHAR(20)
)
BEGIN
    DECLARE v_application_id VARCHAR(20);
    DECLARE v_vehicle_id VARCHAR(20);
    DECLARE v_coverage_id VARCHAR(20);

    -- 1. Update claim table
    UPDATE claim
    SET claim_status = 'accepted'
    WHERE claim_id = p_claim_id;

    -- 2. Find application_id
    SELECT application_id INTO v_application_id
    FROM insurance_policy
    WHERE aggrement_id = p_agreement_id;

    -- 3. Find vehicle_id
    SELECT vehicle_id INTO v_vehicle_id
    FROM application
    WHERE application_id = v_application_id;

    -- 4. Insert into claim_settlement table
    INSERT INTO claim_settlement (
        claim_settlement_id,
        claim_id,
        cust_id,
        vehicle_id,
        date_settled,
        amount_paid,
        coverage_id
    ) VALUES (
        p_set_id,p_claim_id,p_cust_id,v_vehicle_id,p_date,p_amount_paid,p_cov
    );

END //

DELIMITER ;













DELIMITER //

CREATE PROCEDURE premium_payment(
    IN INreceipt_id VARCHAR(20),
    IN INcust_id VARCHAR(20),
    IN INpolicy_number VARCHAR(20),
    IN agg varchar(20)
)
BEGIN
    DECLARE premiumID VARCHAR(20);
    DECLARE pcost INT;
    DECLARE schedule_greater_than_current INT DEFAULT 0; -- Default value is 0
   
    -- Check if premium payment schedule date is greater than or equal to the current date
    IF EXISTS (
        SELECT 1
        FROM premium_payment
        WHERE premium_payment_schedule < CURDATE() AND agreement_id = agg
        
    ) THEN
        SET schedule_greater_than_current = 1; -- Set to 1 if true
    END IF;
   
    -- Retrieve premium_payment_id and premium_payment_amount
    SELECT premium_payment_id INTO premiumID
    FROM premium_payment
    WHERE premium_payment_schedule >= CURDATE() AND agreement_id = agg
    LIMIT 1;
    
   
    SELECT premium_payment_amount INTO pcost
    FROM premium_payment
    WHERE premium_payment_schedule >= CURDATE() AND agreement_id = agg
    LIMIT 1;
   
    -- Insert into receipt if all values are not null
    IF INreceipt_id IS NOT NULL AND premiumID IS NOT NULL AND INcust_id IS NOT NULL AND pcost IS NOT NULL THEN
        INSERT INTO receipt
        SELECT INreceipt_id, premiumID, INcust_id, pcost, CURDATE();
    END IF;
   
    -- Update premium_payment_schedule if policy exists and schedule date is greater than or equal to current date
    IF schedule_greater_than_current = 1 THEN
        UPDATE premium_payment
        SET premium_payment_schedule = DATE_ADD(premium_payment_schedule, INTERVAL 1 YEAR)
        WHERE agreement_id = agg AND premium_payment_schedule >= CURDATE();
    END IF;
   
    -- Return 1 if premium payment schedule date is greater than or equal to current date
    SELECT schedule_greater_than_current AS result;
END //

DELIMITER ;







DELIMITER //

CREATE PROCEDURE renewPolicy(IN agreement_id varchar(20), IN application_id varchar(20), IN cust_id varchar(20), IN policy_number varchar(20), IN policy_renewable_id varchar(20))
BEGIN


    -- Insert into policy_renewable
    INSERT INTO policy_renewable (policy_renewable_id, agreement_id, application_id, cust_id, date_of_renewal, type_of_renewal)
    VALUES (policy_renewable_id, agreement_id, application_id, cust_id, CURDATE(), 'Yearly');

    -- Update expiry_date in insurance_policy table
    UPDATE insurance_policy
    SET expiry_date = DATE_ADD(CURDATE(), INTERVAL 3 YEAR)
    WHERE policy_number = policy_number;
   
    UPDATE premium_payment
    set premium_payment_schedule = date_add(Curdate(), interval 3 day)
    where policy_number = policy_number;
END //

DELIMITER ;



