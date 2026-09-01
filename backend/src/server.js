import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const jwtSecret = process.env.JWT_SECRET || "development-secret-change-me";
const adminEmail = (process.env.ADMIN_EMAIL || "admin@abc.com").toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const mongoUri = process.env.MONGODB_URI;
const mongoDatabaseName = process.env.MONGODB_DB || "ticketing";

let propertiesCollection;
let realtorCollection;

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

const defaultRealtor = {
  id: "default-realtor",
  name: "Alexander Vance",
  title: "Principal Realtor & Property Consultant",
  licenseNo: "RL-94820-PK",
  phone: "+92 300 1234567",
  altPhone: "+92 42 35789000",
  email: "contact@realestatepremium.com",
  photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
  offices: [
    { city: "Lahore Head Office", address: "Suite 402, Al-Hafeez Heights, Gulberg III, Lahore" },
    { city: "DHA Branch", address: "Commercial Plaza #14, Sector CCA, DHA Phase 6, Lahore" },
  ],
  updatedAt: new Date().toISOString(),
};

async function connectDatabase() {
  if (!mongoUri) throw new Error("MONGODB_URI must be set in .env.");
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(mongoDatabaseName);

  propertiesCollection = db.collection("properties");
  realtorCollection = db.collection("realtor");

  await propertiesCollection.createIndex({ id: 1 }, { unique: true });
  await realtorCollection.createIndex({ id: 1 }, { unique: true });

  if ((await propertiesCollection.countDocuments()) === 0) {
    await propertiesCollection.insertMany(sampleProperties);
  }

  if ((await realtorCollection.countDocuments()) === 0) {
    await realtorCollection.insertOne(defaultRealtor);
  }
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

/* PROPERTIES ROUTES */

app.get("/api/properties", async (req, res, next) => {
  try {
    const { purpose, search } = req.query;
    const filter = { status: "published" };
    if (purpose) filter.purpose = purpose;
    if (search) {
      const term = String(search).trim();
      filter.$or = [
        { title: { $regex: term, $options: "i" } },
        { location: { $regex: term, $options: "i" } },
      ];
    }
    const properties = await propertiesCollection
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ properties });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/properties", authenticateAdmin, async (_req, res, next) => {
  try {
    const properties = await propertiesCollection
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ properties });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/properties", authenticateAdmin, async (req, res, next) => {
  try {
    const validationError = validateProperty(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    const now = new Date().toISOString();
    const property = { id: randomUUID(), ...normalizeProperty(req.body), createdAt: now, updatedAt: now };
    await propertiesCollection.insertOne(property);
    res.status(201).json({ property });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/properties/:id", authenticateAdmin, async (req, res, next) => {
  try {
    const existing = await propertiesCollection.findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!existing) return res.status(404).json({ message: "Property not found." });
    const candidate = { ...existing, ...req.body };
    const validationError = validateProperty(candidate);
    if (validationError) return res.status(400).json({ message: validationError });
    const property = normalizeProperty(candidate, existing);
    await propertiesCollection.replaceOne({ id: req.params.id }, property);
    res.json({ property });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/properties/:id", authenticateAdmin, async (req, res, next) => {
  try {
    const result = await propertiesCollection.deleteOne({ id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ message: "Property not found." });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/* REALTOR ROUTES */

app.get("/api/realtor", async (_req, res, next) => {
  try {
    const realtor = await realtorCollection.findOne({}, { projection: { _id: 0 } });
    res.json(realtor || defaultRealtor);
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/realtor", authenticateAdmin, async (req, res, next) => {
  try {
    const existing = (await realtorCollection.findOne({}, { projection: { _id: 0 } })) || defaultRealtor;
    const updated = {
      ...existing,
      name: String(req.body.name || existing.name).trim(),
      title: String(req.body.title || existing.title).trim(),
      licenseNo: String(req.body.licenseNo || existing.licenseNo).trim(),
      phone: String(req.body.phone || existing.phone).trim(),
      altPhone: String(req.body.altPhone || existing.altPhone).trim(),
      email: String(req.body.email || existing.email).trim(),
      photo: String(req.body.photo || existing.photo).trim(),
      offices: Array.isArray(req.body.offices) ? req.body.offices : existing.offices,
      updatedAt: new Date().toISOString(),
    };

    await realtorCollection.updateOne(
      { id: existing.id },
      { $set: updated },
      { upsert: true }
    );

    res.json({ realtor: updated });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

connectDatabase()
  .then(() => app.listen(port, () => console.log(`API running at http://localhost:${port}`)))
  .catch((error) => {
    console.error("Unable to start API", error);
    process.exit(1);
  });