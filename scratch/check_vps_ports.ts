import net from 'net';

const ports = [5432, 5433, 5434, 5435, 5436];
const host = '72.61.141.50';

ports.forEach(port => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.on('connect', () => {
        console.log(`Port ${port} on ${host} is OPEN`);
        socket.destroy();
    }).on('timeout', () => {
        console.log(`Port ${port} on ${host} TIMEOUT`);
        socket.destroy();
    }).on('error', (err) => {
        console.log(`Port ${port} on ${host} CLOSED (${err.message})`);
    }).connect(port, host);
});
