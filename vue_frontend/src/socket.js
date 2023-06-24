
import { io } from "socket.io-client";
import { reactive } from "vue";

export const socket = io("http://martinusius.sk:1337");

export const emergency = reactive({
  id: null,
  location: null,
  medicalData: null,
});

export const rejectedEmergencies = reactive([]);

socket.on('doctors-notified', (count) => {
  console.log('Doctors notified: ', count);
});

socket.on('connect', () => {
  console.log('Connected');
});

socket.on('emergency-canceled', (id) => {
  if (emergency.id !== id) return;

  emergency.id = null;
  emergency.location = null;
  emergency.medicalData = null;
});

socket.on('emergency', (id, location, medicalData) => {
  if (rejectedEmergencies.includes(id)) return;
  if (emergency.id && emergency.id !== id) return;

  emergency.id = id;
  emergency.location = location;
  emergency.medicalData = medicalData;
});