from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])

class SummarizeRequest(BaseModel):
    document_id: int

class TranslateRequest(BaseModel):
    legal_text: str

class ChatQueryRequest(BaseModel):
    query: str
    user_context: dict

class VoiceVaniRequest(BaseModel):
    query: str
    language: str

@router.post("/voice-vani")
def process_voice_vani(req: VoiceVaniRequest):
    query = req.query.strip()
    lang = req.language or "Hindi"
    lower_q = query.lower()
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()

    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            prompt = (
                f"You are Janova Vani (जनोवा वाणी), an AI Vernacular GovTech Voice Assistant for citizens in India. "
                f"Respond to the citizen query in {lang} language using native script, and provide step-by-step guidance.\n\n"
                f"Citizen Query: {query}\n\n"
                "Return a JSON response with exactly these fields:\n"
                "- native_response: (string) Warm, spoken response in native script (e.g. Hindi/Tamil/Kannada).\n"
                "- english_translation: (string) Simple English translation of the response.\n"
                "- action_steps: (array of strings) 2-3 specific action items for the citizen.\n"
                "- lang_code: (string) BCP-47 language tag (e.g., 'hi-IN', 'kn-IN', 'ta-IN', 'te-IN', 'mr-IN', 'bn-IN', 'en-IN')."
            )
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            req_data = json.dumps(payload).encode('utf-8')
            http_req = urllib.request.Request(url, data=req_data, headers={'Content-Type': 'application/json'})
            
            with urllib.request.urlopen(http_req, timeout=10) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                candidates = result.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        raw_text = parts[0]["text"].strip()
                        if "{" in raw_text and "}" in raw_text:
                            json_str = raw_text[raw_text.find("{"):raw_text.rfind("}")+1]
                            parsed = json.loads(json_str)
                            return parsed
        except Exception as e:
            print("Janova Vani Gemini fallback:", e)

    # Vernacular Response Engine Rules Fallback
    if lang == "Hindi":
        return {
            "native_response": f"नमस्ते! Janova Vani में आपका स्वागत है। आपके प्रश्न '{query}' के लिए: आप अपनी डिजिटल सेवा के लिए आधार और ऑनलाइन फॉर्म के माध्यम से 3 सरल चरणों में आवेदन कर सकते हैं।",
            "english_translation": f"Hello! Welcome to Janova Vani. Regarding '{query}': You can apply in 3 simple steps via Aadhaar verification and online form.",
            "action_steps": [
                "जनोवा डिजिटल वॉल्ट से आधार वेरीफाई करें",
                "आधिकारिक ऑनलाइन आवेदन पत्र भरें",
                "ट्रैकिंग नंबर से 24 घंटे में स्थिति जांचें"
            ],
            "lang_code": "hi-IN"
        }
    elif lang == "Kannada":
        return {
            "native_response": f"ನಮಸ್ಕಾರ! ಜಾನೋವಾ ವಾಣಿಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಪ್ರಶ್ನೆ '{query}' ಗಾಗಿ: ಡಿಜಿಲಾಕರ್ ಮತ್ತು ಆನ್‌ಲೈನ್ ಪೋರ್ಟಲ್ ಮೂಲಕ 3 ಸರಳ ಹಂತಗಳಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.",
            "english_translation": f"Hello! Welcome to Janova Vani. For '{query}': You can submit your application in 3 simple steps via DigiLocker.",
            "action_steps": [
                "ಡಿಜಿಲಾಕರ್ ಮೂಲಕ ಆಧಾರ್ ಪರಿಶೀಲಿಸಿ",
                "ಅರ್ಜಿ ನಮೂನೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ",
                "ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ ಪಡೆಯಿರಿ"
            ],
            "lang_code": "kn-IN"
        }
    elif lang == "Tamil":
        return {
            "native_response": f"வணக்கம்! ஜனோவா வாணி சேவைக்கு வரவேற்கிறோம். உங்கள் கேள்வி '{query}': ஆதார் மற்றும் டிஜிலாக்கர் மூலம் 3 எளிய படிகளில் விண்ணப்பிக்கலாம்.",
            "english_translation": f"Hello! Welcome to Janova Vani. For your question '{query}': You can apply in 3 easy steps using Aadhaar.",
            "action_steps": [
                "ஆதார் சான்றிதழை சரிபார்க்கவும்",
                "விண்ணப்ப படிவத்தை சமர்ப்பிக்கவும்",
                "நிலை கண்காணிப்பு எண்ணைப் பெறவும்"
            ],
            "lang_code": "ta-IN"
        }
    elif lang == "Telugu":
        return {
            "native_response": f"నమస్కారం! జనోవా వాణికి స్వాగతం. మీ ప్రశ్న '{query}' కోసం: ఆధార్ మరియు డిజిలాకర్ ద్వారా 3 సులభమైన దశల్లో దరఖాస్తు చేసుకోవచ్చు.",
            "english_translation": f"Hello! Welcome to Janova Vani. For '{query}': Apply in 3 simple steps via DigiLocker.",
            "action_steps": [
                "ఆధార్ వివరాలను సరిచూసుకోండి",
                "ఆన్‌లైన్ ఫారమ్‌ను సమర్పించండి",
                "ట్రాకింగ్ ఐడీని పొందండి"
            ],
            "lang_code": "te-IN"
        }
    elif lang == "Marathi":
        return {
            "native_response": f"नमस्कार! जनोव्हा वाणी मध्ये आपले स्वागत आहे. आपल्या प्रस्तावासाठी '{query}': आपण आधार व डिजिटल व्हॉल्टद्वारे ३ सोप्या टप्प्यात अर्ज करू शकता.",
            "english_translation": f"Hello! Welcome to Janova Vani. For '{query}': Submit your request in 3 easy steps.",
            "action_steps": [
                "आधार डिजिटल पडताळणी करा",
                "शासकीय अर्ज भरा",
                "ट्रॅकिंग आयडी प्राप्त करा"
            ],
            "lang_code": "mr-IN"
        }
    elif lang == "Bengali":
        return {
            "native_response": f"নমস্কার! জনোভা বাণীতে আপনাকে স্বাগতম। আপনার প্রশ্ন '{query}'-এর জন্য: আধার ও ডিজিলকারের মাধ্যমে ৩টি সহজ ধাপে আবেদন করতে পারেন।",
            "english_translation": f"Hello! Welcome to Janova Vani. For '{query}': Submit application in 3 simple steps.",
            "action_steps": [
                "ডিজিটাল নথিপত্র যাচাই করুন",
                "অনলাইন ফর্ম জমা দিন",
                "ট্র্যাকিং স্ট্যাটাস দেখুন"
            ],
            "lang_code": "bn-IN"
        }
    else:
        return {
            "native_response": f"Welcome to Janova Vani. For your query '{query}': You can submit your application directly using your verified Aadhaar DigiLocker payload.",
            "english_translation": f"Welcome to Janova Vani. For '{query}': Application processed via Digital Vault payload.",
            "action_steps": [
                "Verify identity with DigiLocker",
                "Review auto-filled application form",
                "Track status with SLA countdown"
            ],
            "lang_code": "en-IN"
        }

@router.post("/summarize")
def summarize_document(req: SummarizeRequest):
    # Simulated analysis of the uploaded PDF/image document
    return {
        "summary": [
            "This document is an official Identity Verification card.",
            "Document Owner: Aria Sterling. Verified by State registries.",
            "Expiration status: Valid until June 2028.",
            "Recommendation: Securely link this document to any Identity renewal request."
        ]
    }

@router.post("/translate")
def translate_legal_language(req: TranslateRequest):
    text = req.legal_text.strip()
    lower_t = text.lower()
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()

    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            prompt = (
                "You are an expert legal and government policy translator. "
                "Translate the following complex legal/policy paragraph into 1-2 simple, crystal-clear, plain English sentences for a regular citizen:\n\n"
                f"{text}"
            )
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            req_data = json.dumps(payload).encode('utf-8')
            http_req = urllib.request.Request(url, data=req_data, headers={'Content-Type': 'application/json'})
            
            with urllib.request.urlopen(http_req, timeout=10) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                candidates = result.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        return {"plain_language_translation": parts[0]["text"].strip()}
        except Exception as e:
            print("Gemini translate error fallback:", e)

    # Smart Local Legal Translator Rules
    if any(k in lower_t for k in ["tax", "143(1)", "section", "assessment", "penalty", "income"]):
        plain = "Plain Terms: The tax department has processed your tax return. You must verify if any balance tax or penalty is due within 30 days to avoid late interest."
    elif any(k in lower_t for k in ["lease", "tenant", "rent", "premise", "eviction", "landlord"]):
        plain = "Plain Terms: This lease agreement specifies that rent is due on the 1st of every month. Notice of 30 days is required before vacating or making structural changes."
    elif any(k in lower_t for k in ["hereby", "accordance", "pursuant", "whereof"]):
        plain = "Plain Terms: This official rule states that your permit is subject to annual municipal audit. Failure to submit documents within 30 days will result in a standard penalty fee."
    elif any(k in lower_t for k in ["passport", "visa", "immigration"]):
        plain = "Plain Terms: If your passport is within 6 months of expiration, you must renew it immediately on the official portal (passportindia.gov.in) before international travel."
    else:
        plain = f"Plain Terms: '{text[:80]}...' means you need to submit required identity documents, pay applicable municipal fees, and wait for official verification."

    return {"plain_language_translation": plain}

import os
import json
import urllib.request
import urllib.error

@router.post("/chat")
def conversational_helper(req: ChatQueryRequest):
    query = req.query.strip()
    lower_q = query.lower()
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    
    # 1. Try Gemini API if API key is configured in .env
    if gemini_key:
        models_to_try = ["gemini-1.5-flash", "gemini-pro"]
        for model_name in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_key}"
                system_prompt = (
                    "You are Janova, an AI GovTech Assistant for citizens. "
                    "Help citizens understand government services, welfare schemes, document vault procedures, "
                    "tax filings, emergency advisories, business licenses, and civic complaints. Provide clear, concise, step-by-step advice."
                )
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": f"{system_prompt}\n\nUser Question: {query}"}
                            ]
                        }
                    ]
                }
                req_data = json.dumps(payload).encode('utf-8')
                http_req = urllib.request.Request(url, data=req_data, headers={'Content-Type': 'application/json'})
                
                with urllib.request.urlopen(http_req, timeout=10) as resp:
                    result = json.loads(resp.read().decode('utf-8'))
                    candidates = result.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            text_resp = parts[0]["text"]
                            return {
                                "reply": text_resp,
                                "action_plan": [
                                    "1. Follow Gemini AI guidance",
                                    "2. Check linked Janova portal section",
                                    "3. Verify required documents in Vault"
                                ]
                            }
            except urllib.error.HTTPError as he:
                print(f"Gemini API HTTP Error ({model_name}):", he.code, he.reason)
            except Exception as e:
                print(f"Gemini API Error ({model_name}):", e)

    # 2. Comprehensive Smart Local GovTech AI Engine
    
    # Taxation / Income Tax / Property Tax / TDS
    if any(k in lower_q for k in ["tax", "itr", "income tax", "property tax", "tds", "filing", "return", "deduction", "form 16"]):
        reply = (
            "For Income Tax Return (ITR) e-filing, annual returns (ITR-1 to ITR-4) can be filed online at the official Income Tax portal (eportal.incometax.gov.in). "
            "You can claim tax deductions under Section 80C (EPF, PPF, LIC) and Section 80D (Health Insurance). Property taxes for residential and commercial units can also be assessed and paid instantly online."
        )
        action_plan = [
            "1. Open Services Portal and select 'Taxation' category",
            "2. Collect Form 16, Bank Statements, and Investment Proofs in Document Vault",
            "3. Click 'Apply Online' on Income Tax Return E-Filing (eportal.incometax.gov.in)",
            "4. Verify pre-filled salary details and e-verify using Aadhaar OTP"
        ]

    # Business / GST / MSME / Startup / Trademark / License
    elif any(k in lower_q for k in ["business", "gst", "msme", "udyam", "startup", "trademark", "company", "license", "shop", "incorporation"]):
        reply = (
            "Janova's Business Hub provides step-by-step licensing and compliance roadmaps for Pharmacies, Restaurants, Retail Shops, Startups, and Manufacturing units. "
            "You can register for a GSTIN at gst.gov.in, get an MSME Udyam certificate at udyamregistration.gov.in, or apply for DPIIT Startup India recognition for tax exemptions."
        )
        action_plan = [
            "1. Navigate to Business Hub to inspect required licenses & approvals",
            "2. Go to Services Portal and select 'Business' category",
            "3. Register for MSME Udyam Certificate (1-day instant issuance)",
            "4. Apply for GST Registration (GSTIN) with PAN & Business Lease Deed"
        ]

    # Identity Documents & Official Certificates
    elif any(k in lower_q for k in ["passport", "aadhaar", "pan", "voter", "driving", "license", "birth", "marriage", "caste", "income cert", "domicile", "certificate", "death", "ration"]):
        reply = (
            "Janova's Services Portal provides direct redirection to official application websites for key government certificates and identity credentials: "
            "Aadhaar (uidai.gov.in), PAN Card (nsdl.com), Indian Passport (passportindia.gov.in), Voter ID (voters.eci.gov.in), Driving License (parivahan.gov.in), and Birth/Death Certificates (crsorgi.gov.in)."
        )
        action_plan = [
            "1. Open the Services Portal and filter by 'Identity Documents' or 'Certificates'",
            "2. Review required documents (Identity Proof, Address Proof, Photos)",
            "3. Click 'Apply Online' to launch the official government application portal",
            "4. Save your application tracking ID to monitor progress in Janova Dashboard"
        ]

    # Welfare Schemes & Scholarships
    elif any(k in lower_q for k in ["scheme", "benefit", "scholarship", "welfare", "kisan", "ayushman", "abha", "matru", "awas", "grant", "subsidy", "pension"]):
        reply = (
            "Janova's Benefits Finder wizard calculates eligibility match percentages for central and state schemes including PM Kisan Samman Nidhi (Rs 6,000/yr), "
            "Ayushman Bharat PM-JAY (Rs 5 Lakh health cover), Central Sector Scholarships, PM Awas Yojana home subsidies, and Sukanya Samriddhi Yojana."
        )
        action_plan = [
            "1. Open Benefits Finder from the sidebar menu",
            "2. Input your age, annual income, state, and occupation details",
            "3. Review matched welfare schemes sorted by highest percentage match",
            "4. Click on matched schemes to apply directly on official portals (scholarships.gov.in, pmkisan.gov.in)"
        ]

    # Emergency, SOS, Disaster, Weather, Shelters
    elif any(k in lower_q for k in ["emergency", "sos", "flood", "disaster", "weather", "rain", "police", "fire", "ambulance", "shelter", "helpline", "alert"]):
        reply = (
            "The Emergency & Disaster Response Hub provides 1-Tap SOS signal dispatch to District Emergency Control Rooms, "
            "live weather/flood advisories, 24/7 speed-dial emergency numbers (112 Unified, 100 Police, 101 Fire, 108 Ambulance, 1078 NDRF), and open relief shelters with bed capacity meters."
        )
        action_plan = [
            "1. Open Emergency Hub 🚨 from sidebar or dashboard banner",
            "2. Tap 'Dispatch SOS Alert' if in immediate danger to transmit your GPS location",
            "3. Call 112 or 108 directly for immediate emergency rescue",
            "4. Check nearest open emergency relief shelters for medical & meal support"
        ]

    # Document Vault & Storage
    elif any(k in lower_q for k in ["vault", "upload", "document", "file", "expiry", "pdf", "share", "verification", "storage"]):
        reply = (
            "The Document Vault allows you to securely upload, organize, and store essential digital documents (Aadhaar, PAN, Driver's License, Lease Deeds). "
            "It automatically flags documents expiring within 30 days and generates secure 24-hour temporary share links."
        )
        action_plan = [
            "1. Navigate to Document Vault (/vault)",
            "2. Click 'Upload Document' and select files from your computer",
            "3. Assign categories (Identity, Property, Tax, Healthcare)",
            "4. Check dashboard warnings for documents nearing expiration"
        ]

    # Civic Complaints & Infrastructure Issues
    elif any(k in lower_q for k in ["complaint", "pothole", "garbage", "water", "streetlight", "road", "dumping", "issue", "map", "report"]):
        reply = (
            "You can report civic and infrastructure issues (potholes, garbage overflow, streetlight failures, water leakage) in the Civic Complaints Map. "
            "Clicking anywhere on the satellite Leaflet map auto-populates exact location coordinates."
        )
        action_plan = [
            "1. Open Complaints Map (/complaints)",
            "2. Click on the Leaflet Satellite Map to pin the issue location",
            "3. Fill in complaint title, category, and description",
            "4. Track municipal resolution status and upvote community complaints"
        ]

    # Greetings & General Help
    elif any(k in lower_q for k in ["hello", "hi", "hey", "help", "who", "janova", "about", "start", "guide", "what"]):
        reply = (
            "Hello! Welcome to Janova Citizen OS. I am your AI GovTech Assistant. "
            "I can help you navigate 41+ government services, check welfare scheme eligibility, manage your Document Vault, "
            "report civic complaints on the satellite map, or dispatch emergency SOS alerts. How can I assist you today?"
        )
        action_plan = [
            "1. Explore Services Portal for official application links",
            "2. Run Benefits Finder to discover eligible scholarships & subsidies",
            "3. Upload identity documents to your Document Vault",
            "4. Open Emergency Hub for disaster alerts & 1-tap SOS"
        ]

    # Dynamic Fallback for Any Specific Question
    else:
        reply = (
            f"Regarding your query ('{query}'): Janova Citizen OS provides tools across government services, welfare schemes, document vault verification, emergency response, and civic complaints. "
            "You can search our 41+ official government services directory, run the eligibility match wizard in Benefits Finder, or ask me for specific instructions on tax, passport, business, or emergency procedures."
        )
        action_plan = [
            "1. Search relevant keywords in the Services Portal",
            "2. Check Document Vault for required identity credentials",
            "3. Use Benefits Finder for financial assistance & scheme matches",
            "4. Contact 24/7 helplines in the Emergency Hub for urgent support"
        ]

    return {
        "reply": reply,
        "action_plan": action_plan
    }
