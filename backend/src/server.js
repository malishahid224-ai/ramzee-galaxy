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

const defaultAbout = {
  id: "default-about",
  image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
  tag: "ABOUT OUR COMPANY",
  heading: "Building Dreams,",
  headingHighlight: "Creating Futures",
  text: "We help families, investors and businesses find exceptional properties. Our experienced team provides trusted real-estate solutions from property search to final purchase.",
  points: ["Verified Properties", "Professional Agents", "Trusted Service"],
  modalParagraphs: [
    "Ramzee-Galaxy was founded on a simple belief: finding a home should feel exciting, not overwhelming. For over 15 years, we've guided families, investors, and businesses across Lahore through every stage of the real-estate journey — from the first property search to the final signature.",
    "Our team of licensed, experienced agents combines local market knowledge with a genuinely personal approach. Every listing on this site is verified, every transaction is handled with full transparency, and every client gets direct access to a dedicated consultant — not a call center.",
    "Whether you're buying your first home, renting a place in the city, or selling a property at the right price, our mission is the same: make it simple, make it trustworthy, and make it feel like home.",
  ],
  updatedAt: new Date().toISOString(),
};

const defaultSiteContent = {
  id: "default-site-content",
  brandName: "Ramzee-Galaxy",
  brandTagline: "PREMIUM PROPERTIES",
  heroSmallTitle: "WELCOME TO YOUR FUTURE",
  heroHeading: "Find Your",
  heroHeadingHighlight: "Dream Home",
  heroText: "Discover exceptional properties in the most desirable locations. Your perfect home is waiting for you.",
  realtorSectionTag: "AUTHORIZED BROKER",
  realtorSectionHeading: "Meet Your Lead Realtor",
  stats: [
    { value: "500+", label: "Properties" },
    { value: "250+", label: "Happy Clients" },
    { value: "50+", label: "Expert Agents" },
    { value: "15+", label: "Years Experience" },
  ],
  propertiesSectionTag: "EXPLORE OUR COLLECTION",
  propertiesSectionHeading: "Featured Properties",
  propertiesSectionSubtitle: "Discover carefully selected properties designed for modern living.",
  servicesSectionTag: "WHAT WE OFFER",
  servicesSectionHeading: "Our Services",
  services: [
    { icon: "🏠", title: "Buy Property", description: "Find your ideal home from our collection of premium properties." },
    { icon: "🔑", title: "Rent Property", description: "Explore quality rental properties in prime locations." },
    { icon: "💰", title: "Sell Property", description: "Get professional assistance to sell your property at the right price." },
  ],
  contactSectionTag: "READY TO FIND YOUR HOME?",
  contactSectionHeading: "Let's Make Your Dream Home a Reality.",
  footerTagline: "Premium Properties & Real Estate Solutions",
  footerCopyright: "© 2026 Real Estate. All Rights Reserved.",
  updatedAt: new Date().toISOString(),
};

let propertiesCollection;
let realtorCollection;
let aboutCollection;
let siteContentCollection;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "25mb" }));

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
  aboutCollection = db.collection("about");
  siteContentCollection = db.collection("siteContent");

  await propertiesCollection.createIndex({ id: 1 }, { unique: true });
  await realtorCollection.createIndex({ id: 1 }, { unique: true });
  await aboutCollection.createIndex({ id: 1 }, { unique: true });
  await siteContentCollection.createIndex({ id: 1 }, { unique: true });

  if ((await propertiesCollection.countDocuments()) === 0) {
    await propertiesCollection.insertMany(sampleProperties);
  }

  if ((await realtorCollection.countDocuments()) === 0) {
    await realtorCollection.insertOne(defaultRealtor);
  }

  if ((await aboutCollection.countDocuments()) === 0) {
    await aboutCollection.insertOne(defaultAbout);
  }

  if ((await siteContentCollection.countDocuments()) === 0) {
    await siteContentCollection.insertOne(defaultSiteContent);
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
    gallery: Array.isArray(input.gallery)
      ? input.gallery.map((item) => String(item)).filter(Boolean)
      : previous.gallery || [],
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

/* ABOUT SECTION ROUTES */

app.get("/api/about", async (_req, res, next) => {
  try {
    const about = await aboutCollection.findOne({}, { projection: { _id: 0 } });
    res.json(about || defaultAbout);
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/about", authenticateAdmin, async (req, res, next) => {
  try {
    const existing = (await aboutCollection.findOne({}, { projection: { _id: 0 } })) || defaultAbout;
    const updated = {
      ...existing,
      image: String(req.body.image || existing.image).trim(),
      tag: String(req.body.tag || existing.tag).trim(),
      heading: String(req.body.heading || existing.heading).trim(),
      headingHighlight: String(req.body.headingHighlight || existing.headingHighlight).trim(),
      text: String(req.body.text || existing.text).trim(),
      points: Array.isArray(req.body.points)
        ? req.body.points.map((point) => String(point).trim()).filter(Boolean)
        : existing.points,
      modalParagraphs: Array.isArray(req.body.modalParagraphs)
        ? req.body.modalParagraphs.map((paragraph) => String(paragraph).trim()).filter(Boolean)
        : existing.modalParagraphs,
      updatedAt: new Date().toISOString(),
    };

    await aboutCollection.updateOne(
      { id: existing.id },
      { $set: updated },
      { upsert: true }
    );

    res.json({ about: updated });
  } catch (error) {
    next(error);
  }
});

/* SITE CONTENT ROUTES */

app.get("/api/site-content", async (_req, res, next) => {
  try {
    const content = await siteContentCollection.findOne({}, { projection: { _id: 0 } });
    res.json(content || defaultSiteContent);
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/site-content", authenticateAdmin, async (req, res, next) => {
  try {
    const existing = (await siteContentCollection.findOne({}, { projection: { _id: 0 } })) || defaultSiteContent;
    const textField = (key) => String(req.body[key] ?? existing[key]).trim();
    const arrayField = (key) => (Array.isArray(req.body[key]) ? req.body[key] : existing[key]);

    const updated = {
      ...existing,
      brandName: textField("brandName"),
      brandTagline: textField("brandTagline"),
      heroSmallTitle: textField("heroSmallTitle"),
      heroHeading: textField("heroHeading"),
      heroHeadingHighlight: textField("heroHeadingHighlight"),
      heroText: textField("heroText"),
      realtorSectionTag: textField("realtorSectionTag"),
      realtorSectionHeading: textField("realtorSectionHeading"),
      stats: arrayField("stats"),
      propertiesSectionTag: textField("propertiesSectionTag"),
      propertiesSectionHeading: textField("propertiesSectionHeading"),
      propertiesSectionSubtitle: textField("propertiesSectionSubtitle"),
      servicesSectionTag: textField("servicesSectionTag"),
      servicesSectionHeading: textField("servicesSectionHeading"),
      services: arrayField("services"),
      contactSectionTag: textField("contactSectionTag"),
      contactSectionHeading: textField("contactSectionHeading"),
      footerTagline: textField("footerTagline"),
      footerCopyright: textField("footerCopyright"),
      updatedAt: new Date().toISOString(),
    };

    await siteContentCollection.updateOne(
      { id: existing.id },
      { $set: updated },
      { upsert: true }
    );

    res.json({ siteContent: updated });
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