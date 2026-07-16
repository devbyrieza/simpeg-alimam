import net from 'net';

const ports = [5432, 5433, 5434, 5435];
const host = '127.0.0.1';

ports.forEach(port => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
        console.log(`Port ${port} is OPEN`);
        socket.destroy();
    }).on('timeout', () => {
        console.log(`Port ${port} TIMEOUT`);
        socket.destroy();
    }).on('error', (err) => {
        console.log(`Port ${port} CLOSED (${err.message})`);
    }).connect(port, host);
});
