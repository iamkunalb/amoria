from fastapi import FastAPI, UploadFile, File, HTTPException
import json
from typing import List, Dict, Any, Optional, Union
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import open_clip
import os
import shutil
from pydantic import BaseModel, Field
import random

app = FastAPI()

# Allow all CORS for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MBTI compatibility mapping
mbti_matches = {
    "INTJ": ["ENFP", "ENTP"],
    "ENFP": ["INFJ", "INTJ"],
    "ISFJ": ["ESTP", "ESFP"],
    "INFP": ["ENFJ", "ENTJ"],
    "ENTP": ["INFJ", "INTJ"],
    "ESFJ": ["ISFP", "ISTP"]
}

device = "cuda" if torch.cuda.is_available() else "cpu"
model, _, preprocess = open_clip.create_model_and_transforms("ViT-B-32", pretrained="openai")

# def encode_image(path):
#     # Construct the full path
#     full_path = os.path.join("/Users/kunalb/Documents/AI Matcher", path)
#     image = preprocess(Image.open(full_path).convert("RGB")).unsqueeze(0).to(device)
#     with torch.no_grad():
#         return model.encode_image(image)

# def classify(user_img_path, reference_dir="reference_faces"):
#     user_vector = encode_image(user_img_path)

#     results = []
#     for filename in os.listdir(reference_dir):
#         ref_path = os.path.join(reference_dir, filename)
#         ref_vector = encode_image(ref_path)

#         similarity = torch.nn.functional.cosine_similarity(user_vector, ref_vector).item()
#         label = filename.replace(".jpg", "").replace("_", " ")
#         results.append((label, similarity))

#     top_matches = sorted(results, key=lambda x: x[1], reverse=True)[:2]
#     print("Top Matches:")
#     for label, score in top_matches:
#         print(f"  ✔️ {label} ({round(score, 4)})")



def encode_image(path):
    image = preprocess(Image.open(path).convert("RGB")).unsqueeze(0).to(device)
    with torch.no_grad():
        return model.encode_image(image)

@app.post("/classify-selfie")
async def classify_selfie(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    path = f"uploads/{file.filename}"
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    user_vector = encode_image(path)

    scores = []
    for fname in os.listdir("reference_faces"):
        ref_path = os.path.join("reference_faces", fname)
        ref_vector = encode_image(ref_path)
        sim = torch.nn.functional.cosine_similarity(user_vector, ref_vector).item()
        scores.append((fname.replace(".jpg", ""), sim))

    top_tags = sorted(scores, key=lambda x: x[1], reverse=True)[:2]
    return {"visual_appearance": [tag for tag, _ in top_tags]}

def mbti_score(my_type, their_type):
    if their_type in mbti_matches.get(my_type, []):
        return 1.0
    return 0.5 if my_type[0] == their_type[0] else 0.0

def satisfies_filters(a, b):
    return (
        b["gender"] == a["preference_gender"] and
        a["gender"] == b["preference_gender"] and
        a["pref_age_min"] <= b["age"] <= a["pref_age_max"] and
        b["pref_age_min"] <= a["age"] <= b["pref_age_max"] and
        b["ethnicity"] in a["pref_ethnicity"] and
        a["ethnicity"] in b["pref_ethnicity"]
    )

def match_score(a: Dict, b: Dict) -> float:
    if not satisfies_filters(a, b):
        return 0.0

    score = 0.0

    if b["self_rating"] in range(a["pref_rating_range"][0], a["pref_rating_range"][1] + 1):
        score += 1
    if a["self_rating"] in range(b["pref_rating_range"][0], b["pref_rating_range"][1] + 1):
        score += 1

    if any(tag in b.get("visual_pref", []) for tag in a.get("visual_pref", [])):
        score += 2

    score += mbti_score(a["mbti"], b["mbti"]) * 2

    return score

# Load profiles from JSON file
with open("profiles.json") as f:
    profiles = json.load(f)

@app.get("/match/{user_id}")
def get_matches(user_id: str):
    try:
        # Load all users from users_data.json
        with open(JSON_FILE_PATH, 'r') as f:
            all_users = json.load(f)
        
        # Get the user's data
        user = all_users.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get the actual user data from the nested structure
        user_data = user['data']
        
        # Get all other users EXCEPT the current user
        others = []
        for uid, udata in all_users.items():
            # Skip if it's the same user or same phone number
            if (uid != user_id and 
                udata['data'].get('phoneNumber') != user_data.get('phoneNumber')):
                others.append((uid, udata))

        matches = []

        for other_id, other in others:
            other_data = other['data']
            score = calculate_match_score(user_data, other_data)
            
            if score > 0:
                # Extract name from the nested structure
                first_name = other_data.get('firstName', '')
                last_name = other_data.get('lastName', '')
                full_name = f"{first_name} {last_name}".strip() or "Anonymous"

                matches.append({
                    "id": other_id,
                    "name": full_name,
                    "score": score,
                    "mbti": other_data.get('mbti', 'Unknown'),
                    "faceType": other_data.get('userFaceType', []),
                    "age": other_data.get('age', 'Unknown')
                })

        # Sort by score and get top 3
        top_matches = sorted(matches, key=lambda x: x['score'], reverse=True)[:3]
        
        # Get user's name for response
        user_first_name = user_data.get('firstName', '')
        user_last_name = user_data.get('lastName', '')
        user_full_name = f"{user_first_name} {user_last_name}".strip() or "Anonymous"

        return {
            "user": user_full_name,
            "matches": top_matches
        }

    except Exception as e:
        print(f"Matching error: {str(e)}")  # Debug print
        raise HTTPException(status_code=500, detail=str(e))

def calculate_match_score(user_a: Dict, user_b: Dict) -> float:
    try:
        # First check if there's any face type match
        # Get user B's face type (from their selfie analysis)
        user_b_face_type = user_b.get('userFaceType', {}).get('visual_appearance', [])
        # Get user A's selected faces preferences (keep original strings)
        user_a_selected_faces = user_a.get('selectedFaces', [])
        
        # Helper function to check if any preference matches the face type
        def has_face_match(face_type, preferences):
            face_type_lower = face_type.lower()
            return any(pref.lower() in face_type_lower or face_type_lower in pref.lower() 
                      for pref in preferences)
        
        # If user B's face type doesn't match any of user A's preferences, return 0
        if not any(has_face_match(face_type, user_a_selected_faces) 
                  for face_type in user_b_face_type):
            return 0.0

        score = 0.0
        
        # MBTI Compatibility (max 2 points)
        mbti_a = user_a.get('mbti')
        mbti_b = user_b.get('mbti')
        if mbti_a and mbti_b:
            if mbti_b in mbti_matches.get(mbti_a, []):
                score += 2
            elif mbti_a[0] == mbti_b[0]:  # Same first letter
                score += 1

        # Face Type Match Score (max 2 points)
        matching_face_types = sum(1 for face_type in user_b_face_type 
                                if has_face_match(face_type, user_a_selected_faces))
        score += matching_face_types * 1.0  # 1 point per matching face type

        # Personality Answers Similarity (max 2 points)
        answers_a = user_a.get('personalityAnswers', [])
        answers_b = user_b.get('personalityAnswers', [])
        if answers_a and answers_b:
            valid_pairs = [(a, b) for a, b in zip(answers_a, answers_b) 
                          if a is not None and b is not None]
            if valid_pairs:
                similarities = sum(1 for a, b in valid_pairs if abs(a - b) <= 1)
                score += (similarities / len(valid_pairs)) * 2 if valid_pairs else 0

        # Basic Compatibility Checks
        gender_a = user_a.get('gender')
        gender_b = user_b.get('gender')
        if gender_a and gender_b and gender_a != gender_b:
            score += 1

        # Age Compatibility (within reasonable range)
        age_a = user_a.get('age')
        age_b = user_b.get('age')
        if age_a and age_b:
            try:
                age_a = int(age_a)
                age_b = int(age_b)
                age_diff = abs(age_a - age_b)
                if age_diff <= 5:
                    score += 1
                elif age_diff <= 10:
                    score += 0.5
            except (ValueError, TypeError):
                pass

        return score

    except Exception as e:
        print(f"Score calculation error: {str(e)}")  # Debug print
        return 0.0

@app.get("/users")
def get_users():
    return profiles

# if __name__ == "__main__":
#     # Run it
#     classify("uploads/test_selfie.jpg")
#     # test_user_id = "u03"
#     # result = get_matches(test_user_id)
#     # print(f"Top matches for {result['user']}:")
#     # for m in result["matches"]:
#     #     print(f"  - {m['name']} (MBTI: {m['mbti']}, Score: {m['score']})")

# Path to your JSON file
JSON_FILE_PATH = "/Users/kunalb/Documents/AI Matcher/users_data.json"

class UserData(BaseModel):
    id: str
    data: Dict[str, Any]

def load_existing_data():
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(JSON_FILE_PATH), exist_ok=True)
        
        # If file exists, load it
        if os.path.exists(JSON_FILE_PATH):
            with open(JSON_FILE_PATH, 'r') as f:
                return json.load(f)
        return {}
    except Exception as e:
        print(f"Error loading data: {e}")
        return {}

@app.post("/save-user-data")
async def save_user_data(user_data: UserData):
    try:
        # Load existing data
        all_data = load_existing_data()
        
        # Add new data
        all_data[user_data.id] = user_data.dict()
        
        # Save to file with pretty printing
        with open(JSON_FILE_PATH, 'w') as f:
            json.dump(all_data, f, indent=2)
        
        print(f"Data saved to: {JSON_FILE_PATH}")  # Debug print
        return {"message": "Data saved successfully", "id": user_data.id}
    
    except Exception as e:
        print(f"Error saving data: {e}")  # Debug print
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/debug-data")
async def debug_data(data: Dict[str, Any]):
    print("Received data structure:", data)
    return {"message": "Data structure logged"}

@app.post("/send-verification")
async def send_verification_code(data: dict):
    try:
        phone_number = data.get('phone_number')
        if not phone_number:
            raise HTTPException(status_code=400, detail="Phone number is required")

        # Generate a random 6-digit code
        verification_code = str(random.randint(100000, 999999))

        # In a real application, you would:
        # 1. Use a proper SMS service (like Twilio) to send the code
        # 2. Store the code securely with an expiration time
        # 3. Handle rate limiting and other security measures

        # For demo purposes, we'll just return the code
        # In production, NEVER send the code back to the frontend
        return {
            "message": "Verification code sent successfully",
            "code": verification_code  # Remove this in production
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verify-code")
async def verify_code(data: dict):
    try:
        phone_number = data.get('phone_number')
        code = data.get('code')
        
        if not phone_number or not code:
            raise HTTPException(status_code=400, detail="Phone number and code are required")

        # In a real application, you would:
        # 1. Check the code against the stored code for this phone number
        # 2. Verify the code hasn't expired
        # 3. Mark the phone number as verified if successful

        # For demo purposes, we'll just return success
        # In production, implement proper verification logic
        return {
            "verified": True,
            "message": "Phone number verified successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
