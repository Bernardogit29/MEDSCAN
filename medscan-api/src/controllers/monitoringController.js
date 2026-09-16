const Monitoring = require("../models/Monitoring");
const Device = require("../models/Device");
const Profile = require("../models/Profile");

const defaultDevices = [
  { name: "Smartwatch", type: "wearable", battery: 85, connected: true },
  { name: "Oxímetro", type: "oximeter", battery: 90, connected: true },
  { name: "Glicose", type: "glucose", battery: 80, connected: true },
  { name: "Pressão arterial", type: "blood-pressure", battery: 70, connected: true }
];

async function getMonitoring(req, res, next) {
  try {
    let monitoring = await Monitoring.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!monitoring) {
      monitoring = await Monitoring.create({ userId: req.user._id });
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    const personId = req.query.personId || "self";
    const relative = profile?.relatives?.find((item) => item.id === personId);
    const monitoredPerson = relative || {
      id: "self",
      name: req.user.name,
      age: req.user.age || null,
      status: monitoring.status,
      relation: "Meu monitoramento"
    };

    return res.json({
      monitoredPerson: {
        id: monitoredPerson.id,
        name: monitoredPerson.name,
        age: monitoredPerson.age,
        status: monitoredPerson.status || monitoring.status,
        relation: monitoredPerson.relation
      },
      vitals: monitoring,
      alerts: [
        {
          title: "Pressão acima do normal",
          description: "Detectado às 08:42",
          level: "Atenção"
        },
        {
          title: "Próximo lembrete",
          description: "08:00 - Losartana 50mg",
          level: "Lembrete"
        }
      ]
    });
  } catch (error) {
    next(error);
  }
}

async function createMonitoring(req, res, next) {
  try {
    const monitoring = await Monitoring.create({
      userId: req.user._id,
      heartRate: req.body.heartRate,
      glucose: req.body.glucose,
      bloodPressure: req.body.bloodPressure,
      sleep: req.body.sleep,
      status: req.body.status || "Estável"
    });

    return res.status(201).json(monitoring);
  } catch (error) {
    next(error);
  }
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
  createMonitoring,
  getDevices,
  createDevice
};
