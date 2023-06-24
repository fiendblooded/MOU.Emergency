
import { io } from "socket.io-client";

export const socket = io("http://martinusius.sk:1337");

socket.on('doctors-notified', (count) => {
  console.log('Doctors notified: ', count);
});

socket.on('connect', () => {
  console.log('Connected');
});