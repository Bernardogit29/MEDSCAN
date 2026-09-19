const Monitoring = require("../models/Monitoring");
const Device = require("../models/Device");
const Profile = require("../models/Profile");

const defaultDevices = [
  { name: "Smartwatch", type: "wearable", battery: 85, connected: true },
  { name: "OxÃ­metro", type: "oximeter", battery: 90, connected: true },
  { name: "Glicose", type: "glucose", battery: 80, connected: true },
  { name: "PressÃ£o arterial", type: "blood-pressure", battery: 70, connected: true }
];

async function getMonitoring(req, res, next) {
  try {
    const personId = req.query.personId || "self";
    if (!await personExists(req.user._id, personId)) return res.status(404).json({ message: "Pessoa não encontrada." });
    const records = await Monitoring.find({ userId: req.user._id, monitoredPersonId: personId, source: "recorded" }).sort({ measuredAt: -1 }).limit(100).lean();
    const profile = await Profile.findOne({ userId: req.user._id });
    const relative = profile?.relatives?.find(item => item.id === personId);
    const events = require("../services/monitoringEvents").monitoringEvents(records);
    const latest = key => records.find(record => record[key] != null)?.[key] ?? null;
    return res.json({
      monitoredPerson: { id: personId, name: relative?.name || req.user.name, age: relative?.age ?? req.user.age, relation: relative?.relation || "Meu monitoramento", status: records.length ? "Medições registradas" : "Sem medições" },
      vitals: { heartRate: latest("heartRate"), glucose: latest("glucose"), bloodPressure: latest("bloodPressure"), sleep: latest("sleep") },
      measuredAt: records[0]?.measuredAt || null,
      alerts: events.slice(0, 3).map(event => ({ title: `Variação de ${event.label.toLowerCase()}`, description: `${event.previousValue} → ${event.value} ${event.unit}`, measuredAt: event.measuredAt, level: "Registro" }))
    });
  } catch (error) { next(error); }
}

async function personExists(userId, personId) {
  if (personId === "self") return true;
  const profile = await Profile.findOne({ userId });
  return Boolean(profile?.relatives?.some(person => person.id === personId));
}

async function getMonitoringHistory(req, res, next) {
  try {
    const personId = req.query.personId || "self";
    if (!await personExists(req.user._id, personId)) return res.status(404).json({ message: "Pessoa não encontrada." });
    const records = await Monitoring.find({ userId: req.user._id, monitoredPersonId: personId, source: "recorded" }).sort({ measuredAt: -1, _id: -1 }).limit(100).lean();
    return res.json({ records, events: require("../services/monitoringEvents").monitoringEvents(records), limit: 100 });
  } catch (error) { next(error); }
}

async function createMonitoring(req, res, next) {
  try {
    const personId = req.body.monitoredPersonId || "self";
    if (!await personExists(req.user._id, personId)) return res.status(404).json({ message: "Pessoa não encontrada." });
    const values = {};
    for (const key of ["heartRate", "glucose"]) {
      if (req.body[key] === undefined || req.body[key] === null || req.body[key] === "") continue;
      const value = Number(req.body[key]);
      if (!Number.isFinite(value) || value <= 0 || typeof req.body[key] === "boolean") return res.status(400).json({ message: "Informe valores numéricos positivos." });
      values[key] = value;
    }
    if (!Object.keys(values).length) return res.status(400).json({ message: "Informe a frequência cardíaca ou a glicose." });
    const measuredAt = req.body.measuredAt ? new Date(req.body.measuredAt) : new Date();
    if (!Number.isFinite(measuredAt.getTime()) || measuredAt.getTime() > Date.now() + 60000) return res.status(400).json({ message: "Informe uma data válida, sem horário futuro." });
    const monitoring = await Monitoring.create({ userId: req.user._id, monitoredPersonId: personId, source: "recorded", measuredAt, ...values, note: String(req.body.note || "").slice(0,500) });
    return res.status(201).json(monitoring);
  } catch (error) { next(error); }
}

async function getDevices(req, res, next) {
  try {
    let devices = await Device.find({ userId: req.user._id }).sort({ name: 1 });

    if (!devices.length) {
      devices = await Device.insertMany(defaultDevices.map((device) => ({
        ...device,
        userId: req.user._id
      })));
    }

    return res.json(devices);
  } catch (error) {
    next(error);
  }
}

async function createDevice(req, res, next) {
  try {
    const device = await Device.create({
      userId: req.user._id,
      name: req.body.name,
      type: req.body.type,
      battery: req.body.battery || 100,
      connected: req.body.connected !== false
    });

    return res.status(201).json(device);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMonitoring,
  getMonitoringHistory,
  createMonitoring,
  getDevices,
  createDevice
};
