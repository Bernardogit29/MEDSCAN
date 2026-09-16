const Analysis = require("../models/Analysis");

async function listHistory(req, res, next) {
  try {
    const personId = req.query.personId || req.query.monitoredPersonId || "self";
    const query = {
      userId: req.user._id,
      monitoredPersonId: personId
    };

    if (personId === "self") {
      query.$or = [
        { monitoredPersonId: personId },
        { monitoredPersonId: { $exists: false } }
      ];
      delete query.monitoredPersonId;
    }

    const history = await Analysis.find(query).sort({ createdAt: -1 });
    return res.json(history);
  } catch (error) {
    next(error);
  }
}

async function getHistoryItem(req, res, next) {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ message: "Análise não encontrada." });
    }

    return res.json(analysis);
  } catch (error) {
    next(error);
  }
}

async function createHistoryItem(req, res, next) {
  try {
    const analysis = await Analysis.create({
      userId: req.user._id,
      monitoredPersonId: req.body.monitoredPersonId || "self",
      monitoredPersonName: req.body.monitoredPersonName || req.user.name,
      type: req.body.type || "symptoms",
      symptoms: req.body.symptoms || "",
      imageUrl: req.body.imageUrl || "",
      result: req.body.result || {},
      possibleCondition: req.body.possibleCondition || "",
      riskLevel: req.body.riskLevel || "Baixo",
      confidence: req.body.confidence || 0,
      recommendation: req.body.recommendation || ""
    });

    return res.status(201).json(analysis);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listHistory,
  getHistoryItem,
  createHistoryItem
};
