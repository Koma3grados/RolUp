const fs = require("fs");
const path = require("path");
const { networkInterfaces } = require("os");

// Función para obtener IP local (priorizando 192.168.x.x o 10.x.x.x)
function getLocalIP() {
  const nets = networkInterfaces();

  // Primero buscamos IP doméstica típica
  for (const name of Object.keys(nets)) {
    const netArr = nets[name];
    if (!netArr) continue;

    for (const net of netArr) {
      if (net.family === "IPv4" && !net.internal) {
        if (net.address.startsWith("192.168.") || net.address.startsWith("10.")) {
          return net.address;
        }
      }
    }
  }

  // Si no encontramos, devolvemos cualquier IPv4 no interna
  for (const name of Object.keys(nets)) {
    const netArr = nets[name];
    if (!netArr) continue;

    for (const net of netArr) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }

  // Fallback
  return "localhost";
}

const LOCAL_IP = getLocalIP();
//console.log("Usando IP local:", LOCAL_IP);

// Generar .env.local
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = `VITE_API_URL=http://${LOCAL_IP}:8080\n`;

fs.writeFileSync(envPath, envContent);
//console.log(".env.local generado en:", envPath);