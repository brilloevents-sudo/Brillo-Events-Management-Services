import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

const rootDir = process.cwd();
const zipPath = path.join(rootDir, "cpanel_deploy.zip");

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const zip = new AdmZip();

const includeDirs = [
  "_next",
  "admin",
  "availability",
  "brand",
  "client-login",
  "corporate",
  "how-booking-works",
  "login",
  "portal",
  "privacy",
  "private-christmas-parties",
  "private-events",
  "proofs",
  "real-beard-santa-for-hire",
  "request-quote",
  "request-status",
  "santa-and-elves",
  "santa-booking-prices",
  "santa-for-corporate-events",
  "santa-for-hotels-and-resorts",
  "santa-for-malls",
  "talents",
  "terms",
  "api",
  "data",
];

console.log("Packaging folders...");
for (const dir of includeDirs) {
  const fullDirPath = path.join(rootDir, dir);
  if (fs.existsSync(fullDirPath)) {
    zip.addLocalFolder(fullDirPath, dir);
  }
}

console.log("Packaging root files...");
const rootFiles = fs.readdirSync(rootDir);
for (const file of rootFiles) {
  if (file.endsWith(".html") || file === "static-db-snapshot.json" || file === ".htaccess") {
    const fullFilePath = path.join(rootDir, file);
    if (fs.statSync(fullFilePath).isFile()) {
      zip.addLocalFile(fullFilePath);
    }
  }
}

zip.writeZip(zipPath);
console.log(`Successfully generated cPanel deployment package: ${zipPath}`);
const stats = fs.statSync(zipPath);
console.log(`Zip size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
