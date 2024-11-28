import os

from bot.bot import dp, bot
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import WebAppInfo, Message, InlineKeyboardMarkup, InlineKeyboardButton
from dotenv import load_dotenv

load_dotenv()

@dp.message(Command("start"))
async def callback_start(message: Message, state: FSMContext):
    user = message.from_user
    url = f"{os.environ.get('MAIN_URL')}/auth/register?tg_id={user.id}&username={user.username}"
    markup = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="Open Web App", url=url)]]
    )
    await message.answer(f"Здравствуйте! Регистрация по кнопке ниже, {user.first_name}!", reply_markup=markup)
