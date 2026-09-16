export const DEFAULT_MONITORED_PERSON_ID = "self";
export const MONITORED_PERSON_STORAGE_KEY = "medscan.monitoredPersonId";

const defaultVitals = {
  heartRate: 82,
  glucose: 98,
  bloodPressure: "120/80",
  sleep: "7h 30m"
};

export function createCurrentUserPerson(user = {}) {
  return {
    id: "self",
    name: user.name || "Voce",
    age: user.age || null,
    relation: "Meu monitoramento",
    status: "Estavel",
    icon: "account-circle",
    vitals: defaultVitals
  };
}

export function normalizeRelative(relative = {}) {
  return {
    ...relative,
    id: relative.id || `relative-${Date.now()}`,
    name: relative.name || "Familiar",
    age: relative.age || null,
    relation: relative.relation || "Familiar monitorado",
    status: relative.status || "Estavel",
    icon: relative.icon || "account-heart",
    vitals: relative.vitals || defaultVitals
  };
}

export function getMonitoredPeople(user, relatives = []) {
  return [createCurrentUserPerson(user), ...relatives.map(normalizeRelative)];
}

export function findMonitoredPerson(personId, people = []) {
  return people.find((person) => person.id === personId) || people[0] || createCurrentUserPerson();
}
