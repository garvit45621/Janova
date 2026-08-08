from datetime import datetime, date, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from .models import User, Profile, Document, Service, Scheme, Complaint, Application, Deadline, Notification, BusinessTemplate, LifeEvent, Checklist, EmergencyAlert, EmergencyHelpline, ShelterLocation, SOSAlert

def seed_data(db: Session):
    # We clean and re-seed to ensure the database holds the exact required records
    for table in ["sos_alerts", "shelter_locations", "emergency_helplines", "emergency_alerts", "checklists", "notifications", "deadlines", "applications", "complaints", "documents", "profiles", "users", "services", "schemes", "business_templates", "life_events"]:
        db.execute(text(f"DELETE FROM {table}"))
    db.commit()

    # 1. Seed 30+ Government Services
    services = [
        # Identity Documents (5 services)
        Service(
            title="Aadhaar Card Enrollment",
            description="Register for the unique 12-digit biometric national identity card.",
            category="Identity Documents",
            eligibility="All residents of India (including infants).",
            required_documents=["Proof_of_Identity.pdf", "Proof_of_Address.pdf", "Date_of_Birth_Proof.pdf"],
            estimated_time="10-15 Days",
            application_steps=["Book Appointment", "Submit Biometrics at Center", "Verification", "Card Dispatch"],
            official_url="https://uidai.gov.in"
        ),
        Service(
            title="PAN Card Issuance",
            description="Apply for a Permanent Account Number for tax and financial transactions.",
            category="Identity Documents",
            eligibility="All citizens, entities, and foreign nationals taxable in India.",
            required_documents=["Aadhaar_Card.pdf", "Passport_Photo.png"],
            estimated_time="5-7 Days",
            application_steps=["Submit Form 49A", "E-Sign using Aadhaar OTP", "Payment", "E-PAN Generation"],
            official_url="https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html"
        ),
        Service(
            title="Indian Passport Application",
            description="Apply for a new ordinary passport (36 pages) with biometric validation.",
            category="Identity Documents",
            eligibility="Indian citizens by birth, registration, or naturalization.",
            required_documents=["Aadhaar_Card.pdf", "Address_Proof.pdf", "Non_ECR_Proof.pdf"],
            estimated_time="15-20 Days",
            application_steps=["Register Portal", "Fill Application", "Visit Passport Seva Kendra", "Police Verification", "Dispatch"],
            official_url="https://www.passportindia.gov.in"
        ),
        Service(
            title="Voter ID Registration",
            description="Register to vote in national, state, and local body elections.",
            category="Identity Documents",
            eligibility="Indian citizens aged 18 or above on the qualifying date.",
            required_documents=["Passport_Photo.png", "Age_Proof.pdf", "Address_Proof.pdf"],
            estimated_time="14 Days",
            application_steps=["Submit Form 6", "Field Verification", "EPIC card approval", "Postal delivery"],
            official_url="https://voters.eci.gov.in"
        ),
        Service(
            title="Driving License Application",
            description="Apply for a permanent license to drive light motor vehicles or two-wheelers.",
            category="Identity Documents",
            eligibility="Aged 18 or above, holding a valid Learner's License for over 30 days.",
            required_documents=["Learners_License.pdf", "Age_Proof.pdf", "Address_Proof.pdf"],
            estimated_time="7 Days",
            application_steps=["Book Test Slot", "Pass Driving Test", "Biometrics capture", "License Issuance"],
            official_url="https://parivahan.gov.in"
        ),

        # Certificates (6 services)
        Service(
            title="Birth Certificate Issuance & Registry",
            description="Register a birth and obtain an official legal birth certificate from the Civil Registration System.",
            category="Certificates",
            eligibility="Parents or legal guardians of a child born within municipal or village limits.",
            required_documents=["Hospital_Birth_Record.pdf", "Parents_ID_Card.pdf"],
            estimated_time="3 Days",
            application_steps=["Fill parental info", "Upload hospital receipt", "Seal generation", "Digital copy generation"],
            official_url="https://crsorgi.gov.in"
        ),
        Service(
            title="Marriage Certificate Issuance",
            description="Register a marriage under the Special Marriage Act or Hindu Marriage Act.",
            category="Certificates",
            eligibility="Groom aged 21+, Bride aged 18+; marriage solemnized.",
            required_documents=["Marriage_Invitation_Card.pdf", "Couple_Photo.jpg", "Witness_Identities.pdf"],
            estimated_time="15 Days",
            application_steps=["Submit Joint application", "Schedule interview", "Sign register", "Certificate Issuance"],
            official_url="https://edistrict.delhigovt.nic.in"
        ),
        Service(
            title="Caste Certificate",
            description="Obtain official recognition of caste status (SC/ST/OBC) for reservations.",
            category="Certificates",
            eligibility="Belonging to a caste listed in the Scheduled Castes/Tribes or OBC state schedules.",
            required_documents=["Father_Caste_Certificate.pdf", "Affidavit.pdf", "Land_Records.pdf"],
            estimated_time="15-30 Days",
            application_steps=["Submit Application", "Tehsildar scrutiny", "Local inquiry", "Certificate issuance"],
            official_url="https://edistrict.delhigovt.nic.in"
        ),
        Service(
            title="Income Certificate",
            description="Official certificate stating annual family income for welfare benefit eligibility.",
            category="Certificates",
            eligibility="All residents needing income proof for scholarships or state subsidies.",
            required_documents=["Salary_Slip.pdf", "Employer_Certificate.pdf", "Aadhaar_Card.pdf"],
            estimated_time="10 Days",
            application_steps=["Apply online", "Revenue inspector verification", "Approval by Tehsildar"],
            official_url="https://edistrict.delhigovt.nic.in"
        ),
        Service(
            title="Domicile Certificate",
            description="Verify permanent residency status in a particular state or UT.",
            category="Certificates",
            eligibility="Residents living in the state continuously for 10-15 years (varies by state).",
            required_documents=["Address_Proof_10Y.pdf", "Education_Certificates.pdf"],
            estimated_time="15 Days",
            application_steps=["Submit residency details", "Police verification", "Approval and download"],
            official_url="https://edistrict.delhigovt.nic.in"
        ),
        Service(
            title="Death Certificate Registry",
            description="Register a death and obtain an official death certificate.",
            category="Certificates",
            eligibility="Next of kin of the deceased person.",
            required_documents=["Hospital_Death_Report.pdf", "Deceased_ID.pdf"],
            estimated_time="3 Days",
            application_steps=["Submit hospital report", "Verify details", "Generate digital certificate"],
            official_url="https://crsorgi.gov.in"
        ),

        # Business (5 services)
        Service(
            title="GST Registration",
            description="Obtain a Goods and Services Tax Identification Number (GSTIN).",
            category="Business",
            eligibility="Businesses with turnover exceeding Rs. 40 Lakhs (Rs. 20 Lakhs for services).",
            required_documents=["PAN_Card.pdf", "Partnership_Deed_or_LLC_Charter.pdf", "Bank_Statement.jpg"],
            estimated_time="3-5 Days",
            application_steps=["Submit Part A of Form GST REG-01", "Fill Part B", "Aadhaar authentication", "GSTIN Generation"],
            official_url="https://www.gst.gov.in"
        ),
        Service(
            title="MSME Udyam Registration",
            description="Register a micro, small, or medium enterprise under Ministry of MSME.",
            category="Business",
            eligibility="Proprietors, partnerships, or companies meeting MSME classification thresholds.",
            required_documents=["Aadhaar_Card.pdf", "PAN_Card.pdf"],
            estimated_time="1 Day",
            application_steps=["Submit Aadhaar & PAN details", "Enter business address", "Self-declaration", "Udyam Certificate print"],
            official_url="https://udyamregistration.gov.in"
        ),
        Service(
            title="Import Export Code (IEC)",
            description="Obtain an Import Export Code (IEC) from DGFT.",
            category="Business",
            eligibility="Individuals or entities importing or exporting goods/services from India.",
            required_documents=["PAN_Card.pdf", "Cancelled_Cheque.jpg", "Address_Proof.pdf"],
            estimated_time="2 Days",
            application_steps=["Submit DGFT portal form", "Payment", "IEC generation"],
            official_url="https://www.dgft.gov.in"
        ),
        Service(
            title="Startup India Recognition",
            description="Apply for recognition as a startup by DPIIT for tax and compliance exemptions.",
            category="Business",
            eligibility="Private limited companies or partnerships incorporated under 10 years with turnover under 100Cr.",
            required_documents=["Incorporation_Certificate.pdf", "Patent_or_Innovation_Proof.pdf"],
            estimated_time="10 Days",
            application_steps=["Fill startup details", "Upload innovation writeup", "Review by DPIIT committee", "Recognition Certificate"],
            official_url="https://www.startupindia.gov.in"
        ),
        Service(
            title="Trademark Registration",
            description="Register brand names, logos, or slogans to protect intellectual property.",
            category="Business",
            eligibility="Proprietors, partners, or companies owning unique brand identifiers.",
            required_documents=["Logo_Image.png", "Authorization_Form.pdf"],
            estimated_time="180-360 Days",
            application_steps=["Trademark search", "Submit TM-A application", "Scrutiny and examination", "Journal Publication"],
            official_url="https://ipindiaonline.gov.in"
        ),

        # Taxation (4 services)
        Service(
            title="Income Tax Return E-Filing",
            description="File annual personal and corporate income tax returns (ITR 1 to 4).",
            category="Taxation",
            eligibility="Individuals earning taxable income above exemptions.",
            required_documents=["Form_16.pdf", "Investment_Proofs.pdf", "Bank_Statements.pdf"],
            estimated_time="Instant",
            application_steps=["Verify pre-filled salary", "Declare exemptions", "Calculate tax", "E-verify with Aadhaar OTP"],
            official_url="https://eportal.incometax.gov.in"
        ),
        Service(
            title="Professional Tax Registration",
            description="Register and pay professional tax mandated by state governments.",
            category="Taxation",
            eligibility="Employers and self-employed professionals working in state boundaries.",
            required_documents=["Business_PAN.pdf", "Office_Address_Proof.pdf"],
            estimated_time="3 Days",
            application_steps=["Fill professional list", "Assess tax due", "Pay and obtain certificate"],
            official_url="https://karnatakaprofessionaltax.com"
        ),
        Service(
            title="Property Tax Assessment",
            description="File and pay yearly municipal property taxes for residential and commercial units.",
            category="Taxation",
            eligibility="Property owners in municipal corporation jurisdictions.",
            required_documents=["Previous_Tax_Receipt.pdf", "Title_Deed.pdf"],
            estimated_time="Instant",
            application_steps=["Select property ID", "Verify dimensions", "Submit online payment"],
            official_url="https://bbmptax.karnataka.gov.in"
        ),
        Service(
            title="TDS Return Filing",
            description="File quarterly Tax Deducted at Source (TDS) statements.",
            category="Taxation",
            eligibility="Deductors/employers deducting tax at source.",
            required_documents=["Deduction_Register.xlsx", "Challan_Details.pdf"],
            estimated_time="2 Days",
            application_steps=["Compile TDS entries", "Generate FVU file", "Upload to NSDL portal"],
            official_url="https://www.tin-nsdl.com"
        ),

        # Education (3 services)
        Service(
            title="Central Sector Scholarship Scheme",
            description="Apply for financial assistance for students in college or university.",
            category="Education",
            eligibility="Students scoring above 80th percentile in Class 12 board exams.",
            required_documents=["Class_12_Marksheet.pdf", "Income_Certificate.pdf", "Fee_Receipt.pdf"],
            estimated_time="30 Days",
            application_steps=["Register NSP", "Fill Academic Details", "College verification", "Direct Benefit Transfer"],
            official_url="https://scholarships.gov.in"
        ),
        Service(
            title="National Talent Search Exam",
            description="Register for the prestigious NTSE scholarship program for Class 10.",
            category="Education",
            eligibility="Students studying in Class 10 in recognized schools.",
            required_documents=["School_Bonafide.pdf", "Photo.jpg"],
            estimated_time="15 Days",
            application_steps=["Submit through school", "State Stage 1 exam", "National Stage 2 exam"],
            official_url="https://ncert.nic.in"
        ),
        Service(
            title="Pragati Scholarship for Girls",
            description="Scholarship for girl students pursuing technical diploma or degree education.",
            category="Education",
            eligibility="Girl child, family income < 8 LPA, admitted in AICTE approved college first year.",
            required_documents=["AICTE_College_Allotment.pdf", "Income_Certificate.pdf", "Aadhaar.pdf"],
            estimated_time="45 Days",
            application_steps=["Submit NSP application", "Institute verification", "State nodal scrutiny"],
            official_url="https://scholarships.gov.in"
        ),

        # Healthcare (3 services)
        Service(
            title="Ayushman Bharat Health Card",
            description="Create an Ayushman Bharat Health Account (ABHA) to store digital health records.",
            category="Healthcare",
            eligibility="All residents wanting digitized unified health access.",
            required_documents=["Aadhaar_Card.pdf"],
            estimated_time="1 Day",
            application_steps=["Input Aadhaar Number", "Aadhaar OTP authorization", "ABHA ID Generation", "Download card"],
            official_url="https://abha.abdm.gov.in"
        ),
        Service(
            title="CGHS Card Issuance",
            description="Apply for medical cards under Central Government Health Scheme.",
            category="Healthcare",
            eligibility="Central government employees and pensioners.",
            required_documents=["Appointment_Letter_Pension_Payment_Order.pdf", "Photo.jpg"],
            estimated_time="15 Days",
            application_steps=["Online registration", "Department endorsement", "Card issuance"],
            official_url="https://cghs.nic.in"
        ),
        Service(
            title="PM Jan Aushadhi Kendra Licensing",
            description="Apply for licensing to open a generic medicine pharmacy store.",
            category="Healthcare",
            eligibility="Unemployed pharmacists, doctors, NGOs, or entrepreneurs.",
            required_documents=["B_Pharm_or_D_Pharm_Degree.pdf", "Pharmacy_Registration_Certificate.pdf"],
            estimated_time="30 Days",
            application_steps=["Fill space requirements", "Submit pharmacist degrees", "FDA inspection", "Drug license grant"],
            official_url="https://janaushadhi.gov.in"
        ),

        # Agriculture (4 services)
        Service(
            title="Soil Health Card",
            description="Request soil sample testing and obtain crop-wise fertilizer advice cards.",
            category="Agriculture",
            eligibility="All Indian farmers holding agricultural land.",
            required_documents=["Land_Record_RTC.pdf"],
            estimated_time="10 Days",
            application_steps=["Soil sample submission at lab", "Testing", "Report generation", "Card dispatch"],
            official_url="https://soilhealth.dac.gov.in"
        ),
        Service(
            title="PM Kisan Samman Nidhi Enrollment",
            description="Register to receive landholding income support of Rs. 6000/year.",
            category="Agriculture",
            eligibility="Small and marginal landholding farmer families.",
            required_documents=["Land_Ownership_Patta.pdf", "Bank_Passbook.pdf", "Aadhaar_Card.pdf"],
            estimated_time="15 Days",
            application_steps=["Fill farmer info", "Verify Patta record", "Aadhaar verification", "Bank seeding approval"],
            official_url="https://pmkisan.gov.in"
        ),
        Service(
            title="PM Krishi Sinchayee Yojana",
            description="Apply for micro-irrigation system subsidies (drip/sprinkler systems).",
            category="Agriculture",
            eligibility="Cultivating landholding farmers having water sources.",
            required_documents=["RTC_Record.pdf", "Vendor_Quotation.pdf"],
            estimated_time="20 Days",
            application_steps=["Apply online", "Field inspection", "Subsidy approval", "Equipment installation"],
            official_url="https://pmksy.gov.in"
        ),
        Service(
            title="National Agriculture Market (eNAM)",
            description="Register as a farmer or buyer to trade crops digitally.",
            category="Agriculture",
            eligibility="Farmers, traders, commission agents, and farmer producer organizations.",
            required_documents=["Aadhaar_Card.pdf", "Bank_Passbook.pdf"],
            estimated_time="2 Days",
            application_steps=["Submit KYC", "Assign APMC mandi license", "Digital ID Activation"],
            official_url="https://www.enam.gov.in"
        ),

        # Utilities & Housing (4 services)
        Service(
            title="New Electricity Connection Application",
            description="Apply for a new domestic, commercial, or industrial power meter connection.",
            category="Utilities & Housing",
            eligibility="Property owners or authorized tenants.",
            required_documents=["Property_Ownership_Deed.pdf", "Identity_Proof.pdf", "NOC_Landlord.pdf"],
            estimated_time="7 Days",
            application_steps=["Submit application & wiring layout", "Safety inspection", "Meter installation & energization"],
            official_url="https://bescom.karnataka.gov.in"
        ),
        Service(
            title="Municipal Water & Sewer Connection",
            description="Apply for new piped drinking water or sanitary sewer line connections.",
            category="Utilities & Housing",
            eligibility="Residents & commercial building owners within municipal utility limits.",
            required_documents=["Property_Tax_Receipt.pdf", "Building_Sanction_Plan.pdf"],
            estimated_time="10 Days",
            application_steps=["Online application", "Site feasibility study", "Plumbing connection & meter install"],
            official_url="https://bwssb.karnataka.gov.in"
        ),
        Service(
            title="Building Plan Sanction & Approval",
            description="Obtain municipal authorization for new construction, extension, or structural alteration.",
            category="Utilities & Housing",
            eligibility="Plot owners hiring registered architects/engineers.",
            required_documents=["Architectural_Blueprints.dwg", "Title_Deed.pdf", "Structural_Stability_Cert.pdf"],
            estimated_time="30 Days",
            application_steps=["Upload CAD drawing", "Automated scrutiny", "Departmental NOCs", "Permit grant"],
            official_url="https://edistrict.delhigovt.nic.in"
        ),
        Service(
            title="Land RTC & Khata Mutation Extract",
            description="Obtain official Record of Rights, Tenancy & Crop (RTC) or Khata property transfer certificates.",
            category="Utilities & Housing",
            eligibility="Landholders and property buyers.",
            required_documents=["Registered_Sale_Deed.pdf", "Encumbrance_Certificate.pdf"],
            estimated_time="15 Days",
            application_steps=["Enter Khata/Sy No.", "Revenue verification", "Digital signature endorsement", "Download RTC"],
            official_url="https://landrecords.karnataka.gov.in"
        ),

        # Welfare & Social Safety (4 services)
        Service(
            title="e-Shram National Unorganized Worker Card",
            description="Register for the universal unorganized worker ID card for social security benefits and accidental insurance cover.",
            category="Welfare & Social Safety",
            eligibility="Unorganized workers aged 16-59 not covered under EPFO/ESIC.",
            required_documents=["Aadhaar_Card.pdf", "Bank_Passbook.pdf"],
            estimated_time="Instant",
            application_steps=["Submit Aadhaar mobile OTP", "Enter occupation & skill set", "UWIN card generation"],
            official_url="https://eshram.gov.in"
        ),
        Service(
            title="PM Vishwakarma Artisan Scheme",
            description="Register for subsidized credit, skill training, and modern toolkits for traditional artisans and craftspeople.",
            category="Welfare & Social Safety",
            eligibility="Artisans working in 18 traditional trades (barbers, carpenters, blacksmiths, tailors, etc.).",
            required_documents=["Aadhaar_Card.pdf", "Skill_Trade_Self_Declaration.pdf"],
            estimated_time="14 Days",
            application_steps=["CSC enrollment", "Gram Panchayat/ULB verification", "District committee approval", "Digital ID & Toolkit voucher"],
            official_url="https://pmvishwakarma.gov.in"
        ),
        Service(
            title="LPG DBTL (Pahal) Subsidy Transfer",
            description="Link Aadhaar and bank accounts for direct benefit transfer of cooking gas subsidies.",
            category="Welfare & Social Safety",
            eligibility="LPG consumer account holders.",
            required_documents=["LPG_Consumer_Number.pdf", "Aadhaar_Card.pdf", "Bank_Passbook.pdf"],
            estimated_time="3 Days",
            application_steps=["Submit Form 2 to Distributor", "Aadhaar bank seeding", "Subsidy activation"],
            official_url="https://mylpg.in"
        ),
        Service(
            title="Unique Disability ID (UDID) Card",
            description="Apply for a single national identity card for persons with disabilities for government welfare access.",
            category="Welfare & Social Safety",
            eligibility="Persons with benchmark disabilities (> 40%).",
            required_documents=["Disability_Medical_Certificate.pdf", "Photo.jpg", "Aadhaar_Card.pdf"],
            estimated_time="21 Days",
            application_steps=["Online application", "Hospital Medical Board assessment", "UDID card dispatch"],
            official_url="https://www.swavlambancard.gov.in"
        ),

        # Additional Identity & Certificates (3 services)
        Service(
            title="Ration Card Application & Update",
            description="Apply for a new digital smart ration card or update family members.",
            category="Identity Documents",
            eligibility="Resident families classified under AAY, PHH, or NPHH income limits.",
            required_documents=["Family_Head_Photo.jpg", "Income_Certificate.pdf", "Residence_Proof.pdf"],
            estimated_time="30 Days",
            application_steps=["Submit family tree", "Field verification by Food Inspector", "Ration card issuance"],
            official_url="https://nfsa.gov.in"
        ),
        Service(
            title="Police Clearance Certificate (PCC)",
            description="Obtain official background check verification for foreign travel, employment, or visa.",
            category="Identity Documents",
            eligibility="Indian citizens holding a valid passport.",
            required_documents=["Passport.pdf", "Current_Address_Proof.pdf"],
            estimated_time="14 Days",
            application_steps=["Book PSK appointment", "Document verification", "Local police station inquiry", "PCC issuance"],
            official_url="https://passportindia.gov.in"
        ),
        Service(
            title="Encumbrance Certificate (EC)",
            description="Obtain official proof that a property is free from any monetary or legal liability.",
            category="Certificates",
            eligibility="Property buyers, sellers, or financial institution applicants.",
            required_documents=["Property_Details_and_Deed_No.pdf"],
            estimated_time="3 Days",
            application_steps=["Enter sub-registrar index search year range", "Fee payment", "Digitally signed EC download"],
            official_url="https://edistrict.delhigovt.nic.in"
        )
    ]
    db.add_all(services)

    # 2. Seed 20+ Welfare / Schemes (Real Indian Schemes)
    schemes = [
        Scheme(
            title="PM Kisan Samman Nidhi",
            description="Central scheme providing income support of Rs. 6000/year in three equal installments.",
            category="Welfare",
            amount="Rs. 6,000 / year",
            eligibility_rules={"profession": "Farmer", "landowner": True},
            deadline=date(2026, 7, 10),
            requirements=["Aadhaar_Card.pdf", "Land_Record_RTC.pdf", "Bank_Passbook.pdf"]
        ),
        Scheme(
            title="Ayushman Bharat PM-JAY",
            description="National health insurance scheme offering Rs. 5 Lakhs cash-free hospitalization cover per year.",
            category="Welfare",
            amount="Rs. 5,00,000 / family / year",
            eligibility_rules={"max_income": 120000},
            deadline=date(2026, 12, 31),
            requirements=["Aadhaar_Card.pdf", "Ration_Card.pdf", "Income_Certificate.pdf"]
        ),
        Scheme(
            title="PM Matru Vandana Yojana",
            description="Direct cash maternity benefits of Rs. 5000 for pregnant women and lactating mothers.",
            category="Welfare",
            amount="Rs. 5,000 once",
            eligibility_rules={"gender": "Female", "min_age": 19},
            deadline=date(2026, 8, 30),
            requirements=["Mother_Aadhaar.pdf", "MCP_Health_Card.pdf", "Bank_Passbook.pdf"]
        ),
        Scheme(
            title="PM Awas Yojana (Urban)",
            description="Home subsidy program assisting lower and middle income groups in building/purchasing homes.",
            category="Grants",
            amount="Up to Rs. 2,67,000 subsidy",
            eligibility_rules={"max_income": 1800000},
            deadline=date(2026, 9, 30),
            requirements=["Aadhaar_Card.pdf", "Income_Certificate.pdf", "Affidavit_Non_Owning.pdf"]
        ),
        Scheme(
            title="PM Garib Kalyan Anna Yojana",
            description="Food security welfare scheme distributing 5kg free grains per month to eligible citizens.",
            category="Welfare",
            amount="Free 5kg grains/month",
            eligibility_rules={"max_income": 96000},
            deadline=date(2026, 11, 30),
            requirements=["Ration_Card.pdf", "Aadhaar_Card.pdf"]
        ),
        Scheme(
            title="Pradhan Mantri Mudra Yojana",
            description="Collateral-free business loans up to Rs. 10 Lakhs under Shishu, Kishor, and Tarun categories.",
            category="Grants",
            amount="Up to Rs. 10,00,000",
            eligibility_rules={"profession": "Business Owner"},
            deadline=date(2026, 10, 15),
            requirements=["Business_PAN.pdf", "Udyam_Registration.pdf", "Project_Report.pdf"]
        ),
        Scheme(
            title="Atal Pension Yojana",
            description="Guaranteed monthly pension scheme of Rs. 1000 to Rs. 5000 after reaching age 60.",
            category="Welfare",
            amount="Rs. 1,000 - 5,000 / month",
            eligibility_rules={"min_age": 18, "max_age": 40},
            deadline=date(2026, 12, 1),
            requirements=["Aadhaar_Card.pdf", "Savings_Account_Details.pdf"]
        ),
        Scheme(
            title="Sukanya Samriddhi Yojana",
            description="Small savings scheme for girl child education and marriage support with high tax-free returns.",
            category="Welfare",
            amount="Up to 8.2% annual compound interest",
            eligibility_rules={"min_age": 0, "max_age": 10, "gender": "Female"},
            deadline=date(2026, 7, 31),
            requirements=["Girl_Birth_Certificate.pdf", "Parent_Aadhaar.pdf"]
        ),
        Scheme(
            title="Prime Minister Employment Generation Programme",
            description="Credit-linked subsidy scheme offering up to 35% margin money for starting micro-enterprises.",
            category="Grants",
            amount="Up to Rs. 25,00,000 loan + 35% subsidy",
            eligibility_rules={"min_age": 18, "education": "Class 8 Pass"},
            deadline=date(2026, 9, 15),
            requirements=["Project_Profile.pdf", "Caste_Certificate.pdf", "Education_Marksheet.pdf"]
        ),
        Scheme(
            title="National Scholarship Scheme (NSP)",
            description="Unified portal offering post-matric and merit scholarships to underprivileged students.",
            category="Scholarships",
            amount="Rs. 12,000 - 50,000 / year",
            eligibility_rules={"profession": "Student", "max_income": 250000},
            deadline=date(2026, 8, 31),
            requirements=["Class_12_Marksheet.pdf", "Income_Certificate.pdf", "College_Fee_Receipt.pdf"]
        ),
        Scheme(
            title="PM Research Fellowship (PMRF)",
            description="Highly competitive fellowship for PhD students in IISc, IITs, and Central Universities.",
            category="Scholarships",
            amount="Rs. 70,000 - 80,000 / month",
            eligibility_rules={"profession": "Student", "education": "Postgraduate"},
            deadline=date(2026, 6, 30),
            requirements=["Research_Proposal.pdf", "Gate_Scorecard.pdf", "Academic_Transcripts.pdf"]
        ),
        Scheme(
            title="Post Matric Scholarship for SC Students",
            description="State-sponsored scheme covering tuition fees and maintenance allowance for SC students.",
            category="Scholarships",
            amount="100% Tuition fee waiver",
            eligibility_rules={"profession": "Student", "max_income": 300000, "category_sc": True},
            deadline=date(2026, 8, 15),
            requirements=["Caste_Certificate.pdf", "Income_Certificate.pdf", "Bonafide_Certificate.pdf"]
        ),
        Scheme(
            title="Single Girl Child Scholarship",
            description="CBSE scholarship program supporting educational aspirations of single girl children.",
            category="Scholarships",
            amount="Rs. 6,000 / year",
            eligibility_rules={"profession": "Student", "gender": "Female"},
            deadline=date(2026, 7, 15),
            requirements=["Affidavit_Single_Girl.pdf", "Class_10_Marksheet.pdf"]
        ),
        Scheme(
            title="Stand Up India Scheme",
            description="Bank loans between Rs. 10 Lakhs and Rs. 1 Crore to at least one SC/ST and female borrower.",
            category="Grants",
            amount="Rs. 10,000 to Rs. 1,00,00,000",
            eligibility_rules={"min_age": 18, "gender": "Female"},
            deadline=date(2026, 11, 15),
            requirements=["Business_PAN.pdf", "Partnership_Bylaws.pdf", "Caste_or_Gender_Affidavit.pdf"]
        ),
        Scheme(
            title="PM SVANidhi",
            description="Micro-credit scheme providing street vendors collateral-free working loans up to Rs. 10,000.",
            category="Grants",
            amount="Rs. 10,000 interest-subsidized loan",
            eligibility_rules={"profession": "Vendor"},
            deadline=date(2026, 10, 31),
            requirements=["Vendor_Certificate_of_Vending.pdf", "Aadhaar_Card.pdf"]
        ),
        Scheme(
            title="PM Kusum Scheme",
            description="Solar agriculture pumps installation subsidy covering up to 60% of pump cost.",
            category="Subsidies",
            amount="60% cost subsidy for solar pumps",
            eligibility_rules={"profession": "Farmer"},
            deadline=date(2026, 11, 30),
            requirements=["Patta_Land_Deed.pdf", "Agricultural_Water_Connection.pdf"]
        ),
        Scheme(
            title="Rooftop Solar National Portal",
            description="Direct subsidy support for installing domestic rooftop solar power generation systems.",
            category="Subsidies",
            amount="Rs. 18,000 - 78,000 subsidy",
            eligibility_rules={"max_income": 1200000},
            deadline=date(2026, 9, 30),
            requirements=["Electricity_Bill.pdf", "Roof_Ownership_Deed.pdf", "Vendor_Installation_Receipt.pdf"]
        ),
        Scheme(
            title="PM Fasal Bima Yojana",
            description="Crop insurance coverage shielding farmers from crop loss due to natural calamities.",
            category="Subsidies",
            amount="Up to 98% subsidized insurance premium",
            eligibility_rules={"profession": "Farmer"},
            deadline=date(2026, 6, 25),
            requirements=["Land_Sowing_Certificate.pdf", "Bank_Passbook.pdf"]
        ),
        Scheme(
            title="FAME India Phase II",
            description="Electric vehicle subventions lowering road taxes and prices of electric two and four-wheelers.",
            category="Subsidies",
            amount="Up to Rs. 15,000 EV subsidy",
            eligibility_rules={"min_age": 18},
            deadline=date(2026, 12, 15),
            requirements=["Aadhaar_Card.pdf", "Driving_License.pdf", "Dealer_Invoice.pdf"]
        ),
        Scheme(
            title="Startup India Seed Fund Scheme",
            description="Financial support for startups for proof of concept, prototype development, and marketing.",
            category="Grants",
            amount="Up to Rs. 20,00,000 grant",
            eligibility_rules={"profession": "Business Owner"},
            deadline=date(2026, 8, 25),
            requirements=["DPIIT_Recognition_Certificate.pdf", "Pitch_Deck.pdf", "Business_Plan.pdf"]
        ),
        Scheme(
            title="Lakhpati Didi Scheme",
            description="Financial empowerment scheme training women in Self Help Groups (SHGs) to earn > 1 Lakh annually.",
            category="Welfare",
            amount="Interest-free micro-credit + free skills training",
            eligibility_rules={"gender": "Female", "min_age": 18},
            deadline=date(2026, 10, 20),
            requirements=["SHG_Membership_ID.pdf", "Aadhaar_Card.pdf"]
        )
    ]
    db.add_all(schemes)

    # 3. Seed 6 Business Templates
    biz_templates = [
        BusinessTemplate(
            name="Pharmacy",
            licenses=["State Drugs Control Department Pharmacy License", "Municipal Trade License", "Zoning Clearance"],
            approvals=["FDA Approval", "Environmental Safety clearance"],
            estimated_cost="Rs. 4,50,000 - 8,00,000",
            documents=["Property Lease Agreement", "Pharmacist Degree & Registrations", "Safety Audit Reports"],
            timeline="3-6 Months",
            compliance_checklist=["Biomedical waste disposal compliance", "Daily temperature audit log sheets", "Schedule H & H1 drug sale registers"]
        ),
        BusinessTemplate(
            name="Restaurant",
            licenses=["FSSAI Food Safety License", "State Police Eating House License", "Fire Safety NOC", "Health NOC"],
            approvals=["Fire Marshal Inspection", "Health Department certification"],
            estimated_cost="Rs. 6,00,000 - 15,00,000",
            documents=["Floor blueprints", "Food handling certification", "Business lease agreement", "Water test reports"],
            timeline="2-4 Months",
            compliance_checklist=["Quarterly sanitary audits", "Grease trap maintenance", "Visible display of FSSAI license"]
        ),
        BusinessTemplate(
            name="Retail Shop",
            licenses=["Shops and Establishments License", "Municipal Trade License", "GST registration"],
            approvals=["Commercial safety self-declaration"],
            estimated_cost="Rs. 1,00,000 - 3,00,000",
            documents=["Rental lease", "Shop photos", "PAN Card", "Aadhaar Card"],
            timeline="1-2 Weeks",
            compliance_checklist=["MANDATORY annual trade license renewals", "Shops act working hour schedules"]
        ),
        BusinessTemplate(
            name="Startup",
            licenses=["Private Limited Incorporation", "GST Registration", "MSME registration", "Trademark filing"],
            approvals=["DPIIT Startup India committee recognition"],
            estimated_cost="Rs. 15,000 - 50,000",
            documents=["Articles of Association (AOA)", "Memorandum of Association (MOA)", "Shareholder agreement"],
            timeline="2-3 Weeks",
            compliance_checklist=["Board meeting resolutions registry", "Annual ROC filing (Form MGT-7 and AOC-4)", "Professional Tax deposits"]
        ),
        BusinessTemplate(
            name="Consultancy",
            licenses=["Shop & Establishment License", "Professional Tax Employer Registration", "GSTIN registration"],
            approvals=["Self-declaration of professional standards"],
            estimated_cost="Rs. 10,000 - 25,000",
            documents=["Founder credentials", "Office lease or virtual office agreement"],
            timeline="3-5 Days",
            compliance_checklist=["Monthly GST returns filing", "Quarterly advance income tax payments"]
        ),
        BusinessTemplate(
            name="Manufacturing",
            licenses=["Factory license", "State Pollution Control Board Consent (CTE/CTO)", "Industrial Power connection", "Boiler License"],
            approvals=["DISH Factory inspector clearance", "EIA Environmental impact approval"],
            estimated_cost="Rs. 25,00,000 - 1,00,00,000",
            documents=["Factory land deeds", "Machinery blueprints", "Hazard mitigation audits", "Pollution test report"],
            timeline="6-12 Months",
            compliance_checklist=["Monthly toxic effluent testing", "Factory safety manager reports", "Employee insurance ESIC filings"]
        )
    ]
    db.add_all(biz_templates)

    # 4. Seed 8 Life Events
    life_events = [
        LifeEvent(
            name="Birth of Child",
            description="Timeline guide for registering your newborn's identity and securing family benefits.",
            required_registrations=["Birth Certificate Registry", "Child Healthcare Enrollment"],
            services_needed=["Birth Certificate Registry", "Ayushman Bharat Health Card"],
            documents_required=["Parent Aadhaar", "Hospital Birth Record"],
            timeline_est="2 Weeks"
        ),
        LifeEvent(
            name="Marriage",
            description="Secure official marriage certificate and update joint identity documents.",
            required_registrations=["Marriage Certificate Issuance", "Aadhaar Address Update"],
            services_needed=["Marriage Certificate Issuance", "Aadhaar Card Enrollment"],
            documents_required=["Marriage Invitation Card", "Witness IDs", "Couple Photo"],
            timeline_est="3 Weeks"
        ),
        LifeEvent(
            name="College Admission",
            description="Guidelines for acquiring education subsidies, scholarships, and state student credentials.",
            required_registrations=["NSP National Scholarship registration", "Student Travel Card"],
            services_needed=["Central Sector Scholarship Scheme", "Income Certificate"],
            documents_required=["Class 12 Marksheet", "Income Certificate", "Bonafide Certificate"],
            timeline_est="4 Weeks"
        ),
        LifeEvent(
            name="New Employment",
            description="Tax registrations, provident fund activation, and professional compliance procedures.",
            required_registrations=["EPFO Member activation", "Professional Tax registration"],
            services_needed=["Income Tax Return E-Filing", "Professional Tax Registration"],
            documents_required=["Pan Card", "Aadhaar Card", "Salary Slips"],
            timeline_est="2 Weeks"
        ),
        LifeEvent(
            name="Starting a Business",
            description="Complete business charter listings, tax registrations, and operating permits.",
            required_registrations=["GST Registry application", "MSME Udyam enrollment"],
            services_needed=["GST Registration", "MSME Udyam Registration"],
            documents_required=["Company articles of association", "Business PAN Card"],
            timeline_est="4 Weeks"
        ),
        LifeEvent(
            name="Property Purchase",
            description="Transfer land records, register properties at sub-registrar offices, and clear municipal taxes.",
            required_registrations=["Property Registry Sale Deed", "Khata Mutation Application"],
            services_needed=["Property Tax Assessment", "Domicile Certificate"],
            documents_required=["Sale Deed copy", "Encumbrance Certificate", "Previous Tax Receipts"],
            timeline_est="6 Weeks"
        ),
        LifeEvent(
            name="Retirement",
            description="Secure state pension payments, shift health coverage networks, and log tax exemptions.",
            required_registrations=["Provident Fund claim submission", "National Pension Scheme payout"],
            services_needed=["CGHS Card Issuance", "Income Tax Return E-Filing"],
            documents_required=["Employment record", "Pan Card", "Bank passbook"],
            timeline_est="8 Weeks"
        ),
        LifeEvent(
            name="Death in Family",
            description="Process estate transitions, report deaths, and update inheritance deeds.",
            required_registrations=["Death Certificate Registry", "Legal Heir Certificate Application"],
            services_needed=["Death Certificate Registry", "Property Tax Assessment"],
            documents_required=["Hospital Death Report", "Deceased Identification Records", "Affidavits"],
            timeline_est="5 Weeks"
        )
    ]
    db.add_all(life_events)
    db.commit()

    # 5. Seed 5 User Profiles
    # Note: passwords stored plain for mock backend
    users_data = [
        {"email": "admin@janova.gov", "password": "adminpass123", "role": "admin", "name": "Super Admin", "cid": "CIT-00001", "phone": "+91 9999999999", "addr": "GovTech HQ, Chanakyapuri, New Delhi 110021", "photo": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"},
        {"email": "aria.sterling@janova.gov", "password": "demopass123", "role": "citizen", "name": "Aria Sterling", "cid": "CIT-10001", "phone": "+91 9876543210", "addr": "12, Residency Rd, Bengaluru, Karnataka 560025", "photo": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"},
        {"email": "rajesh.kumar@gmail.com", "password": "demopass123", "role": "citizen", "name": "Rajesh Kumar", "cid": "CIT-10002", "phone": "+91 9988776655", "addr": "Village Doddaballapur, Bengaluru Rural, Karnataka 561203", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"},
        {"email": "priyanka.sharma@yahoo.com", "password": "demopass123", "role": "citizen", "name": "Priyanka Sharma", "cid": "CIT-10003", "phone": "+91 9123456789", "addr": "PG Hostel, IISc Campus, Bangalore 560012", "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"},
        {"email": "amit.patel@outlook.com", "password": "demopass123", "role": "citizen", "name": "Amit Patel", "cid": "CIT-10004", "phone": "+91 8877665544", "addr": "54, 100 Feet Rd, Indiranagar, Bengaluru 560038", "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"}
    ]

    seeded_users = []
    for u in users_data:
        usr = User(email=u["email"], hashed_password=u["password"], role=u["role"])
        db.add(usr)
        db.flush() # get user.id

        prof = Profile(
            user_id=usr.id,
            full_name=u["name"],
            citizen_id=u["cid"],
            phone=u["phone"],
            address=u["addr"],
            photo=u["photo"]
        )
        db.add(prof)
        seeded_users.append(usr)
    
    db.commit()

    # Locate Aria Sterling for specific profile mock features
    aria = next(x for x in seeded_users if x.email == "aria.sterling@janova.gov")
    
    # 6. Seed Documents for Aria (including expiring documents to trigger dashboard warnings)
    documents = [
        Document(
            user_id=aria.id,
            name="Aadhaar Card",
            category="Identity",
            size="1.2 MB",
            url="http://localhost:8000/mock/Aadhaar_Aria.pdf",
            verified=True,
            expiry_date=None
        ),
        Document(
            user_id=aria.id,
            name="PAN Card",
            category="Identity",
            size="0.8 MB",
            url="http://localhost:8000/mock/PAN_Aria.pdf",
            verified=True,
            expiry_date=None
        ),
        Document(
            user_id=aria.id,
            name="Driver's License",
            category="Identity",
            size="1.5 MB",
            url="http://localhost:8000/mock/DL_Aria.pdf",
            verified=True,
            expiry_date=date.today() + timedelta(days=25) # Expiring soon warning!
        ),
        Document(
            user_id=aria.id,
            name="Residential Lease Deed",
            category="Property",
            size="4.2 MB",
            url="http://localhost:8000/mock/Lease_Aria.pdf",
            verified=False,
            expiry_date=date.today() + timedelta(days=120)
        )
    ]
    db.add_all(documents)

    # 7. Seed Applications for Aria
    applications = [
        Application(
            user_id=aria.id,
            title="Passport Renewal",
            category="Identity Documents",
            status="reviewing",
            progress=50,
            history=[
                {"date": "2026-05-10", "note": "Application submitted online."},
                {"date": "2026-05-15", "note": "Biometrics appointment completed at PSK."}
            ]
        ),
        Application(
            user_id=aria.id,
            title="GST Registration",
            category="Business",
            status="pending",
            progress=25,
            history=[
                {"date": "2026-05-20", "note": "GST REG-01 Form A completed."}
            ]
        ),
        Application(
            user_id=aria.id,
            title="Ayushman Bharat Health Card",
            category="Healthcare",
            status="approved",
            progress=100,
            history=[
                {"date": "2026-05-01", "note": "Registration authenticated with Aadhaar."},
                {"date": "2026-05-02", "note": "ABHA ID card generated."}
            ]
        )
    ]
    db.add_all(applications)

    # 8. Seed Deadlines for Aria (spanning the next 3 months: June, July, August 2026)
    deadlines = [
        Deadline(
            user_id=aria.id,
            title="Driver's License Renewal",
            date=date.today() + timedelta(days=25), # Next Month
            type="license",
            urgency="high"
        ),
        Deadline(
            user_id=aria.id,
            title="GST Quarterly Tax Filing",
            date=date(2026, 6, 30),
            type="tax",
            urgency="medium"
        ),
        Deadline(
            user_id=aria.id,
            title="Income Tax Return E-Filing",
            date=date(2026, 7, 31),
            type="tax",
            urgency="medium"
        ),
        Deadline(
            user_id=aria.id,
            title="Passport Renewal Scrutiny",
            date=date.today() + timedelta(days=45),
            type="application",
            urgency="low"
        ),
        Deadline(
            user_id=aria.id,
            title="PM-Kisan Scheme Enrollment",
            date=date(2026, 7, 10),
            type="application",
            urgency="high"
        ),
        Deadline(
            user_id=aria.id,
            title="State Assembly Election Registration",
            date=date(2026, 8, 25),
            type="election",
            urgency="low"
        )
    ]
    db.add_all(deadlines)

    # 9. Seed Notifications for Aria
    notifications = [
        Notification(
            user_id=aria.id,
            text="Your Driver's License (No. DL-1299) expires in 25 days. Click to apply for renewal.",
            type="warning",
            read_status=False
        ),
        Notification(
            user_id=aria.id,
            text="Congratulations! Your Ayushman Bharat Health Card (ABHA) has been approved and verified.",
            type="success",
            read_status=False
        ),
        Notification(
            user_id=aria.id,
            text="Aadhaar Card uploaded to Document Vault was verified by system agent.",
            type="info",
            read_status=True
        )
    ]
    db.add_all(notifications)

    # 10. Seed 10 Complaints in Bengaluru (coordinates relative to Bengaluru center 12.9716, 77.5946)
    complaints = [
        Complaint(
            user_id=aria.id,
            title="Koramangala 80 Feet Road Pothole",
            category="Potholes",
            description="Deep pothole causing accidents near Koramangala 80 Feet Road intersection. Requires immediate patching.",
            location="Koramangala 80 Feet Road, Bengaluru",
            x_coord=-118,
            y_coord=404,
            status="new",
            upvotes=12
        ),
        Complaint(
            user_id=aria.id,
            title="Indiranagar 100 Feet Road Garbage Accumulation",
            category="Garbage",
            description="Piles of solid waste left uncollected next to the main commercial lane for past 4 days. Bad odor.",
            location="100 Feet Road, Indiranagar, Bengaluru",
            x_coord=253,
            y_coord=616,
            status="investigating",
            upvotes=25
        ),
        Complaint(
            user_id=aria.id,
            title="HSR Layout Sector 1 Water Pipeline Leakage",
            category="Water Leakage",
            description="Main municipal water line burst flooding the road. Drinking water getting wasted.",
            location="Sector 1, HSR Layout, Bengaluru",
            x_coord=-361,
            y_coord=654,
            status="new",
            upvotes=8
        ),
        Complaint(
            user_id=seeded_users[2].id, # Rajesh
            title="Whitefield Main Road Streetlight Outage",
            category="Streetlight Failure",
            description="Entire stretch of streetlights dark from Forum Value Mall to Hope Farm junction, very dangerous at night.",
            location="Whitefield Main Road, Bengaluru",
            x_coord=232,
            y_coord=1704,
            status="investigating",
            upvotes=34
        ),
        Complaint(
            user_id=seeded_users[3].id, # Priyanka
            title="MG Road Metro Station Road Damage",
            category="Road Damage",
            description="Asphalt peeled off exposing sub-base near MG Road Metro Station entrance. Severe traffic bottlenecks.",
            location="MG Road, Bengaluru",
            x_coord=290,
            y_coord=272,
            status="resolved",
            upvotes=56
        ),
        Complaint(
            user_id=seeded_users[4].id, # Amit
            title="Illegal Garbage Dumping in Bannerghatta",
            category="Illegal Dumping",
            description="Commercial garbage trucks dumping construction debris in the open plot next to Bannerghatta National Park gate.",
            location="Bannerghatta Road, Bengaluru",
            x_coord=-516,
            y_coord=184,
            status="new",
            upvotes=45
        ),
        Complaint(
            user_id=aria.id,
            title="Bellandur Outer Ring Road Potholes",
            category="Potholes",
            description="Series of dangerous craters on the flyover lane causing sudden braking and traffic delay.",
            location="ORR, Bellandur, Bengaluru",
            x_coord=-187,
            y_coord=1015,
            status="investigating",
            upvotes=61
        ),
        Complaint(
            user_id=seeded_users[2].id,
            title="Electronic City Phase 1 Streetlight Outage",
            category="Streetlight Failure",
            description="Lights inactive next to corporate tech parks. Decreased security.",
            location="Electronic City Phase 1, Bengaluru",
            x_coord=-943,
            y_coord=858,
            status="resolved",
            upvotes=18
        ),
        Complaint(
            user_id=seeded_users[3].id,
            title="Malleshwaram 15th Cross Garbage Heap",
            category="Garbage",
            description="Unchecked garbage bins overflowing next to the local market. Spreading health hazards.",
            location="15th Cross, Malleshwaram, Bengaluru",
            x_coord=516,
            y_coord=-85,
            status="new",
            upvotes=22
        ),
        Complaint(
            user_id=seeded_users[4].id,
            title="Jayanagar 4th Block Water Line Leakage",
            category="Water Leakage",
            description="Minor pipeline fracture leaking clean groundwater. Needs sealing.",
            location="4th Block, Jayanagar, Bengaluru",
            x_coord=-178,
            y_coord=104,
            status="resolved",
            upvotes=10
        )
    ]
    db.add_all(complaints)

    # 11. Seed Emergency Advisories & Alerts
    emergency_alerts = [
        EmergencyAlert(
            title="Severe Weather Warning: Flash Flooding Alert",
            severity="critical",
            category="Weather",
            location="Bengaluru Urban & Low-Lying Eastern Districts",
            description="Meteorological Department issues Red Alert for intense torrential rainfall exceeding 120mm in the next 12 hours. High risk of waterlogging in basement parking and low-lying storm drains.",
            safety_steps=[
                "Avoid traveling through underpasses and inundated roads.",
                "Charge power banks and keep emergency battery lights handy.",
                "Store 48 hours of clean drinking water and essential medications.",
                "In case of immediate structural inundation, move to higher ground."
            ],
            active=True
        ),
        EmergencyAlert(
            title="High Voltage Substation Grid Failure",
            severity="high",
            category="Power Outage",
            location="Indiranagar & Domlur Sector 2-4",
            description="Substation transformer failure causing localized power disruption. BESCOM emergency restoration teams are currently deployed on-site.",
            safety_steps=[
                "Unplug sensitive electronic appliances to avoid power surge damage.",
                "Use emergency solar lanterns or battery LED lamps instead of candles.",
                "Keep refrigerators closed to preserve food temperature."
            ],
            active=True
        ),
        EmergencyAlert(
            title="Urban Heatwave Advisory & Hydration Notice",
            severity="moderate",
            category="Health",
            location="Metropolitan Municipal Region",
            description="Peak afternoon temperatures expected to reach 39°C with high UV index. Stay indoors between 12 PM and 3:30 PM.",
            safety_steps=[
                "Drink water regularly even if not feeling thirsty.",
                "Wear light-colored, loose cotton clothing and UV sunglasses.",
                "Never leave children or pets inside parked vehicles."
            ],
            active=True
        ),
        EmergencyAlert(
            title="Major Arterial Flyover Maintenance Diversion",
            severity="info",
            category="Traffic",
            location="Outer Ring Road - Silk Board Junction",
            description="Structural girder maintenance in progress. Outer lane closed for 24 hours. Commuters advised to use metro or alternative bypass corridors.",
            safety_steps=[
                "Plan travel with 30-minute buffer time.",
                "Follow traffic police detour signage.",
                "Use Namma Metro purple and green line interchanges."
            ],
            active=True
        )
    ]
    db.add_all(emergency_alerts)

    # 12. Seed Emergency Helplines
    emergency_helplines = [
        EmergencyHelpline(
            name="National Emergency Unified Response System",
            category="General Emergency",
            number="112",
            description="Single emergency contact for Police, Fire, Ambulance & Rescue.",
            icon="🚨"
        ),
        EmergencyHelpline(
            name="Police Control Room",
            category="Police",
            number="100",
            description="Immediate law enforcement and law & order assistance.",
            icon="👮"
        ),
        EmergencyHelpline(
            name="Fire & Rescue Control Center",
            category="Fire",
            number="101",
            description="Firefighting, hazmat containment, and structural rescue.",
            icon="🚒"
        ),
        EmergencyHelpline(
            name="Medical Emergency & Ambulance Service",
            category="Medical",
            number="108",
            description="Free 24/7 emergency medical response and hospital transit.",
            icon="🚑"
        ),
        EmergencyHelpline(
            name="National Disaster Response Force (NDRF)",
            category="Disaster",
            number="1078",
            description="Specialized disaster mitigation, flood rescue, and evacuation.",
            icon="🌊"
        ),
        EmergencyHelpline(
            name="Women's Safety & Anti-Harassment Helpline",
            category="Women Safety",
            number="1091",
            description="24/7 dedicated support, emergency dispatch, and legal protection.",
            icon="🛡️"
        ),
        EmergencyHelpline(
            name="National Cyber Crime Reporting Helpline",
            category="Cyber",
            number="1930",
            description="Immediate financial fraud reporting and account freezing assistance.",
            icon="🔒"
        ),
        EmergencyHelpline(
            name="Senior Citizen Helpline (Elder Line)",
            category="General Emergency",
            number="14567",
            description="Free guidance, rescue, and elder care emergency support.",
            icon="👵"
        )
    ]
    db.add_all(emergency_helplines)

    # 13. Seed Emergency Relief Shelters
    shelter_locations = [
        ShelterLocation(
            name="Central Municipal Indoor Stadium Relief Center",
            address="Kanteerava Complex, MG Road, Bengaluru",
            x_coord=120,
            y_coord=-45,
            capacity=500,
            occupancy=142,
            status="open",
            amenities=["Medical First Aid", "Hot Meals", "Clean Water", "Power Generator", "Emergency Beds", "Sanitation Kits"],
            contact_phone="+91 80 2222 1100"
        ),
        ShelterLocation(
            name="Koramangala Ward 5 Communities Emergency Shelter",
            address="8th Main Rd, Koramangala 4th Block, Bengaluru",
            x_coord=340,
            y_coord=210,
            capacity=250,
            occupancy=88,
            status="open",
            amenities=["Medical First Aid", "Food Packets", "Clean Water", "Childcare Area"],
            contact_phone="+91 80 2553 4411"
        ),
        ShelterLocation(
            name="North Hills Government Secondary School Disaster Relief Camp",
            address="Bellary Road, Hebbal, Bengaluru",
            x_coord=-410,
            y_coord=-380,
            capacity=300,
            occupancy=45,
            status="open",
            amenities=["Medical First Aid", "Clean Water", "Blankets", "Power Generator"],
            contact_phone="+91 80 2363 8899"
        ),
        ShelterLocation(
            name="Whitefield Disaster Relief Center",
            address="ITPL Main Rd, Whitefield, Bengaluru",
            x_coord=680,
            y_coord=-150,
            capacity=200,
            occupancy=195,
            status="standby",
            amenities=["Medical First Aid", "Emergency Oxygen", "Food Packets"],
            contact_phone="+91 80 2841 0022"
        )
    ]
    db.add_all(shelter_locations)
    db.commit()

    print("DB Seeding completed successfully with Emergency Hub data!")
