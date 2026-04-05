const os = require('os');
const qr = require('qrcode');

const localIP = () => {
    for (const iface of Object.values(os.networkInterfaces())) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) return config.address;
        }
    }
    return 'localhost';
};

const generateTerminalQR = async (url) => {
    try {
        const qrString = await qr.toString(url, { type: 'terminal' });
        const line = '='.repeat(50);
        console.log(`\n${line}\n📱 SCAN QR CODE TO CONNECT:\n${line}\n${qrString}\n${line}`);
        console.log(`🌐 URL: ${url}\n${line}\n`);
    } catch {
        console.log(`Server: ${url}`);
    }
};

module.exports = { localIP, generateTerminalQR };
