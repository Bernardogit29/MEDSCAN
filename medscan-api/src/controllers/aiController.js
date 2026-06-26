const Analysis = require("../models/Analysis");
const { analyzeMedicalData } = require("../services/aiService");

async function analyze(req, res, next) {
  try {
    const {
      symptoms = "",
      type,
      monitoredPersonId = "maria",
      monitoredPersonName = "Maria Silva"
    } = req.body;
    const file = req.file;
    const analysisType = type || (file ? "image" : "symptoms");
    const imageUrl = file ? `/uploads/${file.filename}` : "";

    const result = await analyzeMedicalData({
      symptoms,
      image: file
        ? {
            filename: file.filename,
            mimetype: file.mimetype,
            path: file.path
          }
        : null
    });

    const analysis = await Analysis.create({
      userId: req.user._id,
      monitoredPersonId,
      monitoredPersonName,
      type: analysisType,
      symptoms,
      imageUrl,
      result,
      possibleCondition: result.possibleCondition,
      riskLevel: result.riskLevel,
      confidence: result.confidence,
      recommendation: result.recommendation
    });

    return res.status(201).json({
      analysis,
      disclaimer:
        "Esta análise não substitui uma consulta médica. Em caso de urgência, procure atendimento imediatamente."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyze
};
