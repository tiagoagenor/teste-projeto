const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'filmow_super_secret_key_2026_jwt_token';

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, avatar_url, bio } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios (nome, username, email, senha).' });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    // Check existing email or username
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, cleanUsername]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email ou nome de usuário já cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`;

    const [result] = await pool.query(
      'INSERT INTO users (name, username, email, password_hash, avatar_url, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [name, cleanUsername, email, passwordHash, avatar, bio || 'Adora assistir e avaliar filmes.']
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, username: cleanUsername, name }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      token,
      user: { id: userId, name, username: cleanUsername, email, avatar_url: avatar, bio: bio || '' }
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    return res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { login, password } = req.body; // login can be email or username

    if (!login || !password) {
      return res.status(400).json({ error: 'Informe seu login (email ou username) e senha.' });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [login, login.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas. Usuário não encontrado.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas. Senha incorreta.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, username, email, avatar_url, bio, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json(users[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
  }
};
