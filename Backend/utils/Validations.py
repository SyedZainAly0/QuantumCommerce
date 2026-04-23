from fastapi import UploadFile, HTTPException, Request

ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]
MAX_FILE_SIZE = 5 * 1024 * 1024

async def validate_image(file: UploadFile, request: Request):
    errors = []
    
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_FILE_SIZE:
        errors.append("File too large. Max 5MB.")

    if file.content_type not in ALLOWED_TYPES:
        errors.append("Invalid file type")

    if not any(file.filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
        errors.append("Invalid file extension")

    if errors:
        raise HTTPException(status_code=400, detail=errors)