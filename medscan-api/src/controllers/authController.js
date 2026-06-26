const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Profile = require("../models/Profile");
const createToken = require("../utils/createToken");

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nome, e-mail e senha são obrigatórios." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Este e-mail já está cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    await Profile.create({ userId: user._id });

    return res.status(201).json({
      user: sanitizeUser(user),
      token: createToken(user._id)
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    return res.json({
      user: sanitizeUser(user),
      token: createToken(user._id)
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    return res.json({
      user: sanitizeUser(req.user),
      profile
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  me
};
