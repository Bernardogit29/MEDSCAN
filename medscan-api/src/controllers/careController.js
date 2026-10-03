const mongoose = require("mongoose");
const CareRecord = require("../models/CareRecord");
const MedicationDose = require("../models/MedicationDose");
const Profile = require("../models/Profile");
const { validateCare, validDate, validTime } = require("../services/careValidation");
async function personExists(userId, personId) {
  if (personId === "self") return true;
  const profile = await Profile.findOne({ userId });
  return Boolean(profile?.relatives?.some(person => person.id === personId));
}
async function list(req, res, next) {
  try {
    const personId = req.query.personId || "self";
    if (!await personExists(req.user._id, personId)) return res.status(404).json({ message: "Pessoa não encontrada." });
    const query = { userId: req.user._id, monitoredPersonId: personId };
    const [records, doses] = await Promise.all([
      CareRecord.find(query).sort({ createdAt: -1 }).limit(1000).lean(),
      MedicationDose.find(query).sort({ takenAt: -1 }).limit(1000).lean()
    ]);
    res.json({ records, doses, limit: 1000 });
  } catch (error) { next(error); }
}
async function save(req, res, next) {
  try {
    let existing;
    if (req.params.id) {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Registro não encontrado." });
      existing = await CareRecord.findOne({ _id: req.params.id, userId: req.user._id });
      if (!existing) return res.status(404).json({ message: "Registro não encontrado." });
    }
    const personId = existing?.monitoredPersonId || req.body.monitoredPersonId || "self";
    if (!await personExists(req.user._id, personId)) return res.status(404).json({ message: "Pessoa não encontrada." });
    let values;
    try { values = validateCare({ ...(existing?.toObject() || {}), ...req.body }, existing?.kind || req.body.kind); }
    catch (error) { return res.status(400).json({ message: error.message }); }
    const record = existing
      ? await CareRecord.findOneAndUpdate({ _id: existing._id, userId: req.user._id }, { $set: values }, { new: true, runValidators: true })
      : await CareRecord.create({ ...values, userId: req.user._id, monitoredPersonId: personId });
    return res.status(existing ? 200 : 201).json(record);
  } catch (error) { next(error); }
}
async function takeDose(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Medicamento não encontrado." });
    const record = await CareRecord.findOne({ _id: req.params.id, userId: req.user._id, kind: "medication", status: "active", archived: false });
    if (!record || !await personExists(req.user._id, record.monitoredPersonId)) return res.status(404).json({ message: "Medicamento ativo não encontrado." });
    const { date, time } = req.body;
    if (!validDate(date) || !validTime(time) || !record.times.includes(time) || (record.startDate && date < record.startDate) || (record.endDate && date > record.endDate) || Date.parse(date) > Date.now() + 86400000) return res.status(400).json({ message: "Data ou horário fora da agenda deste medicamento." });
    const query = { userId: req.user._id, monitoredPersonId: record.monitoredPersonId, medicationId: record._id, date, time };
    const dose = await MedicationDose.findOneAndUpdate(query, { $setOnInsert: { ...query, name: record.name, dose: record.dose, takenAt: new Date() } }, { upsert: true, new: true, runValidators: true });
    res.json(dose);
  } catch (error) { if (error.code === 11000) return res.status(409).json({ message: "Esta tomada já foi registrada. Atualize a agenda." }); next(error); }
}
module.exports = { list, save, takeDose };
