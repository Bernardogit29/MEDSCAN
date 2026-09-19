const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Profile = require("../models/Profile");
const createToken = require("../utils/createToken");

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    age: user.age,
    createdAt: user.createdAt
  };
}

async function register(req, res, next) {
  try {
    const { age, password } = req.body;
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!name || !email || age == null || String(age).trim() === "" || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Nome, idade, e-mail e senha são obrigatórios." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Informe um e-mail válido." });
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) return res.status(400).json({ message: "Use uma senha com pelo menos 8 caracteres e até 72 bytes." });
    const numericAge = typeof age === "boolean" ? NaN : Number(age);
    if (!Number.isInteger(numericAge) || numericAge < 0 || numericAge > 120) {
      return res.status(400).json({ message: "Informe uma idade válida entre 0 e 120 anos." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Este e-mail já está cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      age: numericAge,
      password: hashedPassword
    });

    await Profile.create({ userId: user._id });

    return res.status(201).json({
      user: sanitizeUser(user),
      token: createToken(user._id)
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Este e-mail já está cadastrado." });
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { password } = req.body;
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!email || typeof password !== "string" || !password) {
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
