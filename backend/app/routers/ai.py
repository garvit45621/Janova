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
    text = req.legal_text.lower()
    
    # Very simple translation parsing
    if "hereby" in text or "accordance" in text:
        plain = "This ruleset states that your business charter is subject to state tax filing every year. Failure to submit within the 30-day window will result in a standard late fee penalty."
      
    elif "passport" in text:
        plain = "If your passport expires, you must renew it online immediately. You will need to upload a photo and pay a standard state processing fee."
    else:
        plain = "Plain terms: You must submit your request details, attach a verified ID scan, confirm the municipal processing fees, and wait for state department verification."
        
    return {"plain_language_translation": plain}

@router.post("/chat")
def conversational_helper(req: ChatQueryRequest):
    query = req.query.lower()
    
    response = "I can guide you through Janova's core portals: Dashboard, Document Vault, Government Directory, Benefits Finder, Life Events, Civic Complaints, Business Hub, and Calendar."
    action_plan = []

    if "passport" in query:
        response = "To renew your passport, navigate to the Services directory and select 'Passport Renewal'. You will need to attach your National ID Card from the Document Vault."
        action_plan = [
            "1. Open the Services portal",
            "2. Select 'Passport Renewal'",
            "3. Attach 'National_ID_Card.pdf'",
            "4. Pay the $130 fee and submit"
        ]
    elif "scholarship" in query or "benefit" in query:
        response = "The Benefits discovery wizard can check your eligibility across scholarships, grants, and subsidies based on your age, income, and state."
        action_plan = [
            "1. Go to the Benefits Finder portal",
            "2. Complete the 4-step eligibility questionnaire",
            "3. Select high-percentage matches",
            "4. Attach documents and apply"
        ]
    elif "pothole" in query or "complaint" in query or "garbage" in query:
        response = "Report neighborhood safety issues directly in the Civic Complaints Portal by pinning the exact location on our digital map."
        action_plan = [
            "1. Open the Civic Complaints portal",
            "2. Pin coordinates on the interactive Leaflet map",
            "3. Fill in descriptions and category details",
            "4. Submit and track state resolution"
        ]

    return {
        "reply": response,
        "action_plan": action_plan
    }
