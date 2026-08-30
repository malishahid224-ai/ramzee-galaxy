import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const jwtSecret = process.env.JWT_SECRET || "development-secret-change-me";
const adminEmail = (process.env.ADMIN_EMAIL || "admin@ramzeegalaxy.com").toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "RamzeeAdmin#2026!";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(__dirname, "..", "data");
const propertiesFile = path.join(dataDirectory, "properties.json");

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const sampleProperties = [
  {
    id: "property-1",
    title: "Luxury Family House",
    location: "DHA Phase 6, Lahore",
    price: 85000000,
    currency: "PKR",
    purpose: "sale",
    beds: 5,
    baths: 4,
    area: 1,
    areaUnit: "kanal",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    description: "A spacious family home in a prime location.",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function ensureStore() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    await readFile(propertiesFile, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(propertiesFile, JSON.stringify(sampleProperties, null, 2));
  }
}

async function getProperties() {
  await ensureStore();
  return JSON.parse(await readFile(propertiesFile, "utf8"));
}

async function saveProperties(properties) {
  await ensureStore();
  await writeFile(propertiesFile, JSON.stringify(properties, null, 2));
}

function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Admin authentication is required." });

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (payload.role !== "admin") throw new Error("Not an admin");
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ message: "Your session is invalid or has expired." });
  }
}

function validateProperty(input) {
  const requiredText = ["title", "location", "purpose", "areaUnit"];
  const missing = requiredText.filter((field) => !String(input[field] || "").trim());
  if (missing.length) return `${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} required.`;
  if (!["sale", "rent", "open-house"].includes(input.purpose)) return "purpose must be sale, rent, or open-house.";
  if (input.purpose === "open-house" && !String(input.openHouseDate || "").trim()) return "An open-house date is required for open house events.";
  if (!Number.isFinite(Number(input.price)) || Number(input.price) < 0) return "price must be a valid positive number.";
  return null;
}

function normalizeProperty(input, previous = {}) {
  return {
    ...previous,
    title: String(input.title).trim(),
    location: String(input.location).trim(),
    price: Number(input.price),
    currency: String(input.currency || "PKR").trim(),
    purpose: input.purpose,
    beds: Number(input.beds || 0),
    baths: Number(input.baths || 0),
    area: Number(input.area || 0),
    areaUnit: String(input.areaUnit).trim(),
    image: String(input.image || "").trim(),
    description: String(input.description || "").trim(),
    openHouseDate: String(input.openHouseDate || "").trim(),
    openHouseTime: String(input.openHouseTime || "").trim(),
    status: input.status === "draft" ? "draft" : "published",
    updatedAt: new Date().toISOString(),
  };
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/auth/admin/login", async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const password = String(req.body.password || "");
  const passwordMatches = await bcrypt.compare(password, await bcrypt.hash(adminPassword, 10));

  if (email !== adminEmail || !passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = jwt.sign({ email: adminEmail, role: "admin" }, jwtSecret, { expiresIn: "8h" });
  res.json({ token, admin: { email: adminEmail, role: "admin" } });
});

app.get("/api/properties", async (req, res, next) => {
  try {
    let properties = await getProperties();
    const { purpose, search } = req.query;
    if (purpose) properties = properties.filter((property) => property.purpose === purpose);
    properties = properties.filter((property) => property.status === "published");
    if (search) {
      const term = String(search).toLowerCase();
      properties = properties.filter((property) => `${property.title} ${property.location}`.toLowerCase().includes(term));
    }
    res.json({ properties });
  } catch (error) { next(error); }
});

app.get("/api/admin/properties", authenticateAdmin, async (_req, res, next) => {
  try { res.json({ properties: await getProperties() }); } catch (error) { next(error); }
});

app.post("/api/admin/properties", authenticateAdmin, async (req, res, next) => {
  try {
    const validationError = validateProperty(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    const properties = await getProperties();
    const now = new Date().toISOString();
    const property = { id: randomUUID(), ...normalizeProperty(req.body), createdAt: now, updatedAt: now };
    properties.unshift(property);
    await saveProperties(properties);
    res.status(201).json({ property });
  } catch (error) { next(error); }
});

app.patch("/api/admin/properties/:id", authenticateAdmin, async (req, res, next) => {
  try {
    const properties = await getProperties();
    const index = properties.findIndex((property) => property.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Property not found." });
    const candidate = { ...properties[index], ...req.body };
    const validationError = validateProperty(candidate);
    if (validationError) return res.status(400).json({ message: validationError });
    properties[index] = normalizeProperty(candidate, properties[index]);
    await saveProperties(properties);
    res.json({ property: properties[index] });
  } catch (error) { next(error); }
});

app.delete("/api/admin/properties/:id", authenticateAdmin, async (req, res, next) => {
  try {
    const properties = await getProperties();
    const remaining = properties.filter((property) => property.id !== req.params.id);
    if (remaining.length === properties.length) return res.status(404).json({ message: "Property not found." });
    await saveProperties(remaining);
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

ensureStore()
  .then(() => app.listen(port, () => console.log(`API running at http://localhost:${port}`)))
  .catch((error) => {
    console.error("Unable to start API", error);
    process.exit(1);
  });
