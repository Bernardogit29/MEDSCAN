// Descriptive comparisons only: these are not clinical alarm thresholds.
function monitoringEvents(records) {
  const sorted = [...records].filter(r => r.source === 'recorded').sort((a,b)=>new Date(a.measuredAt)-new Date(b.measuredAt));
  const previous = new Map();
  const events = [];
  for (const record of sorted) {
    for (const [metric, label, unit] of [['heartRate','Frequência cardíaca','bpm'],['glucose','Glicose','mg/dL']]) {
      const value = record[metric];
      if (typeof value !== 'number' || !Number.isFinite(value)) continue;
      const key = `${record.monitoredPersonId}:${metric}`;
      const before = previous.get(key);
      const time = new Date(record.measuredAt).getTime();
      if (!Number.isFinite(time)) continue;
      if (before && time > before.time && before.value !== value) events.push({
        id: `${record._id}:${metric}`, metric, label, unit,
        previousValue: before.value, value, change: Number((value-before.value).toFixed(2)),
        previousAt: before.measuredAt, measuredAt: record.measuredAt,
        intervalMinutes: Math.round((time-before.time)/60000),
        note: record.note || ''
      });
      previous.set(key,{value,time,measuredAt:record.measuredAt});
    }
  }
  return events.sort((a,b)=>new Date(b.measuredAt)-new Date(a.measuredAt));
}
module.exports = { monitoringEvents };
