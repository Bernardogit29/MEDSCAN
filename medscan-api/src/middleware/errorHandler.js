function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.name === "MulterError") {
    return res.status(400).json({ message: "Erro ao enviar arquivo.", detail: error.message });
  }

  return res.status(error.status || 500).json({
    message: error.message || "Erro interno no servidor."
  });
}

module.exports = errorHandler;
