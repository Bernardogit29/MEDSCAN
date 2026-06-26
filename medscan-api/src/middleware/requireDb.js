const mongoose = require("mongoose");

function requireDb(req, res, next) {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    message: "Banco de dados indisponivel. Verifique a conexao com o MongoDB Atlas."
  });
}

module.exports = requireDb;
