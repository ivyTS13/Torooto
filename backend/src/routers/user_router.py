from fastapi import  File, UploadFile, Depends, APIRouter, HTTPException, status
from src.users import  current_active_user
from src.db import User, get_async_session
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from src.images import imagekit
from src.users import  current_active_user
from src.schemas import ImageUpdate
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["users"])



@router.patch("/{user_id}/image")
async def update_card_image(
    user_id: uuid.UUID,
    file: UploadFile = File(...),
    user:User =Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        check_user = await db.execute(select(User).where(User.id == user_id))
        user_to_update = check_user.scalar_one_or_none()

        if not user_to_update and user.id != user_id:
            return {
                "success": False,
                "data": None,
                "message": "User not found or you do not have permission to edit it."
            }
        file_content = await file.read()
        try:
            upload_result = imagekit.files.upload(
                file=file_content,
                file_name=f"user_{user_id}_{file.filename}",
                use_unique_file_name=True,
                tags=["back-end-upload", f"user_{user_id}"],
                folder="/users"
            )
        except Exception as upload_err:
            logger.error(f"ImageKit Upload failed: {upload_err}")
            return {
                "success": False,
                "data": None,
                "message": "Failed to upload image to storage provider."
            }
        updated_img =ImageUpdate(
             image_url= upload_result.url
         )
        result = await db.execute(update(User)
                                  .where(User.id == user_id)
                                  .values(**updated_img.model_dump(exclude_unset=True))
                                  .returning(User))
        updated_card = result.scalar_one_or_none()
        await db.commit()
        
        return {
            "success": True,
            "data": updated_card,
            "message": "User image updated successfully."
        }
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error during image upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Internal Server Error"
        )
    finally:
            await file.close()