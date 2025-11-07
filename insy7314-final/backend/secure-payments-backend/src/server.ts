import https from "https";
import fs from "fs";
import app from "./app";

const port = Number(process.env.PORT ?? 8443);
const keyPath = process.env.SSL_KEY ?? "./certs/localhost-key.pem";
const certPath = process.env.SSL_CERT ?? "./certs/localhost-cert.pem";

const key = fs.readFileSync(keyPath);
const cert = fs.readFileSync(certPath);

https.createServer({ key, cert }, app).listen(port, () => {
  console.log(`Server running on https://localhost:${port}`);
});
