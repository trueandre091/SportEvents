const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    res.status(401).json({ message: 'Неверный email или пароль' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, tg_id, username, remember_me } = req.body;
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        tg_id,
        username,
        remember_me
      }),
    });

    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      throw new Error('Registration failed');
    }
  } catch (error) {
    res.status(400).json({ error: 'Ошибка при регистрации' });
  }
});

module.exports = router; 