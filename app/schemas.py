"""
schemas.py - Схемы для валидации данных
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


class UserCreate(BaseModel):
    """Регистрация"""
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    """Вход"""
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """Ответ с данными пользователя (без пароля)"""
    id: int
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class NoteCreate(BaseModel):
    """Создание заметки"""
    title: str
    content: Optional[str] = ""


class NoteUpdate(BaseModel):
    """Обновление заметки"""
    title: Optional[str] = None
    content: Optional[str] = None


class NoteOut(BaseModel):
    """Ответ с заметкой"""
    id: int
    user_id: int
    title: str
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT токен"""
    access_token: str
    token_type: str