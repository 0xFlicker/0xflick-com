import * as jose from 'jose';
import { spawn } from "child_process";
import fs from "fs";
import { join, basename, dirname } from "path";

const name = process.argv[2];

/**
 * @param {string} file
 */
function saveBufferToSecret(file) {
  const s = spawn("sops", ['--encrypt', basename(file)], {
    cwd: dirname(file),
      stdio: "pipe",
  });
const { stdin, stdout, stderr } = s;
if (!stdin) {
  return null;
}
let stdOutLog = "";
stdout.on("data", (data) => {
  stdOutLog += data;
});
let stdErrLog = "";
stderr.on("data", (data) => {
  stdErrLog += data;
});
// wait for the process to finish
return new Promise((resolve, reject) => {
  stdin.on("error", reject);
  s.on("close", (/** @type {number} */ code) => {
    if (code !== 0) {
      console.log(stdOutLog);
      console.log(stdErrLog);
      reject(new Error(`sops exited with code ${code}`));
    }
    resolve(stdOutLog);
  });
  stdin.end();
});
}

const { publicKey, privateKey } = await jose.generateKeyPair('ECDH-ES+A128KW', {
  extractable: true,
  crv: 'P-521',
})
const JWK = await jose.exportJWK(privateKey);
const pkcs8Pem = await jose.exportPKCS8(privateKey);
const spkiPem = await jose.exportSPKI(publicKey);

const payload = {
  JWK: JSON.stringify(JWK),
  publicKey: spkiPem,
  privateKey: pkcs8Pem,
  issuer: `uri://${name}`
}
const inputFile = join("..", "..", "secrets", name, "_jwt.json");
const outputFile = join("..", "..", "secrets", name, "jwt-secrets.json");
await fs.promises.writeFile(inputFile, JSON.stringify(payload, null, 2), "utf8");
await fs.promises.writeFile(outputFile, await saveBufferToSecret(inputFile), "utf8");
await fs.promises.unlink(inputFile);
