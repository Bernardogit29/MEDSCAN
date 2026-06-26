export const DEFAULT_MONITORED_PERSON_ID = "maria";
export const MONITORED_PERSON_STORAGE_KEY = "medscan.monitoredPersonId";

export const monitoredPeople = [
  {
    id: "maria",
    name: "Maria Silva",
    age: 72,
    relation: "Monitorado por voce",
    status: "Estavel",
    icon: "account-heart",
    vitals: {
      heartRate: 82,
      glucose: 98,
      bloodPressure: "120/80",
      sleep: "7h 30m"
    }
  },
  {
    id: "joao",
    name: "Joao Silva",
    age: 75,
    relation: "Familiar monitorado",
    status: "Atencao",
    icon: "account",
    vitals: {
      heartRate: 88,
      glucose: 116,
      bloodPressure: "135/85",
      sleep: "6h 40m"
    }
  },
  {
    id: "me",
    name: "Voce",
    age: 22,
    relation: "Meu monitoramento",
    status: "Estavel",
    icon: "account-circle",
    vitals: {
      heartRate: 76,
      glucose: 92,
      bloodPressure: "118/76",
      sleep: "8h 05m"
    }
  }
];

export function findMonitoredPerson(personId) {
  return monitoredPeople.find((person) => person.id === personId) || monitoredPeople[0];
}
