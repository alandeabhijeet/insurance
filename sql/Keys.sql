use DBMS;

alter table application 
	add foreign key(cust_id) references customer(cust_id) on delete cascade;

alter  table quote 
	add foreign key (application_id) references application(application_id) on delete cascade,
    add foreign key (cust_id) references customer(cust_id) on delete cascade;

alter table insurance_policy
	add foreign key (application_id) references application(application_id) on delete cascade,
    add foreign key (cust_id) references customer(cust_id) on delete cascade;

alter table premium_payment
	add foreign key (cust_id) references customer(cust_id) on delete cascade;
    
alter table vehicle 
	add foreign key (cust_id) references customer(cust_id) on delete cascade;

alter table claim 
	add foreign key (cust_id) references customer(cust_id) on delete cascade;

alter table claim_settlement 
	add foreign key (cust_id) references customer(cust_id) on delete cascade,
    add foreign key (claim_id) references claim(claim_id) on delete cascade,
    add unique (claim_id);

alter table staff
	add foreign key (company_name) references insurance_companies(company_name) on delete cascade;

alter table department 
	add foreign key (company_name) references insurance_companies(company_name) on delete cascade;

alter table office 
	add foreign key (company_name) references insurance_companies(company_name) on delete cascade,
    add foreign key (department_name) references department(department_name) on delete cascade;

alter table membership
	add foreign key (cust_id) references customer(cust_id) on delete cascade,
    add unique(cust_id);

alter table vehicle_service
	add foreign key (vehicle_id) references vehicle(vehicle_id) on delete cascade,
	add foreign key (cust_id) references customer(cust_id) on delete cascade;
 
alter table nok
	add foreign key (agreement_id) references insurance_policy(aggrement_id) on delete cascade,
    add foreign key (application_id) references application(application_id) on delete cascade,
	add foreign key (cust_id) references customer(cust_id) on delete cascade;
    
alter table policy_renewable
	add foreign key (agreement_id) references insurance_policy(aggrement_id) on delete cascade,
    add foreign key (application_id) references application(application_id) on delete cascade,
	add foreign key (cust_id) references customer(cust_id) on delete cascade;

alter table incident_report 
	add foreign key (cust_id) references customer(cust_id) on delete cascade,
    add foreign key (incident_id) references incident(incident_id) on delete cascade;

alter table coverage
	add foreign key (company_name) references insurance_companies(company_name) on delete cascade;

alter table product
	add foreign key (company_name) references insurance_companies(company_name) on delete cascade;
    
alter table receipt
	add foreign key (cust_id) references customer(cust_id) on delete cascade,
    add foreign key (premium_payment_id) references premium_payment(premium_payment_id) on delete cascade,
    add unique(premium_payment_id);
    
alter table insurance_policy_coverage
	add foreign key (coverage_id) references coverage(coverage_id) on delete cascade;