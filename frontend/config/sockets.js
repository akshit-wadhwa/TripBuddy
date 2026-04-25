import {io} from 'socket.io-client';

const SOCKET_URL = `${import.meta.env.VITE_BACKEND_URL}`;
console.log("Socket URL:", SOCKET_URL);

export const socket = io(SOCKET_URL, {
     transports: ['websocket'],
});