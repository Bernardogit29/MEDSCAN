const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn("MONGO_URI nao configurada. Configure o .env para usar o MongoDB Atlas.");
    return false;
  }

  try {
    mongoose.set("bufferCommands", false);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000
    });

    console.log("MongoDB conectado com sucesso.");
    return true;
  } catch (error) {
    console.error("Erro ao conectar no MongoDB:", error.message);
    return false;
  }
}

module.exports = connectDB;
