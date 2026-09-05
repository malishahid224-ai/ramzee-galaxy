import { useEffect, useState } from "react";
import "./AdminPanel.css";

const apiUrl = import.meta.env.VITE_API_URL || "/api";
const emptyProperty = {
  title: "", location: "", price: "", purpose: "sale", areaUnit: "marla",
  beds: "", baths: "", area: "", image: "", gallery: [], description: "", openHouseDate: "", openHouseTime: "", status: "published",
};

const initialRealtor = {
  name: "Alexander Vance",
  title: "Principal Realtor & Property Consultant",
  licenseNo: "RL-94820-PK",
  phone: "+92 300 1234567",
  altPhone: "+92 42 35789000",
  email: "contact@realestatepremium.com",
  photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
  offices: [
    { city: "Lahore Head Office", address: "Suite 402, Al-Hafeez Heights, Gulberg III, Lahore" },
    { city: "DHA Branch", address: "Commercial Plaza #14, Sector CCA, DHA Phase 6, Lahore" }
  ]
};

const initialAbout = {
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
};

const initialSiteContent = {
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
};

function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(emptyProperty);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  
  // Realtor state management
  const [realtor, setRealtor] = useState(() => {
    const saved = localStorage.getItem("realtorInfo");
    return saved ? JSON.parse(saved) : initialRealtor;
  });

  // About section state management
  const [about, setAbout] = useState(() => {
    const saved = localStorage.getItem("aboutInfo");
    return saved ? JSON.parse(saved) : initialAbout;
  });

  // Site-wide page content (navbar, hero, stats, section headings, services, footer)
  const [siteContent, setSiteContent] = useState(() => {
    const saved = localStorage.getItem("siteContent");
    return saved ? JSON.parse(saved) : initialSiteContent;
  });

  const [activeTab, setActiveTab] = useState("properties");

  const request = async (path, options = {}) => {
    const response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    });
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(data?.message || "Request failed.");
    return data;
  };

  const loadProperties = async () => {
    try { setProperties((await request("/admin/properties")).properties); }
    catch (error) { setMessage(error.message); }
  };

  useEffect(() => {
    if (token) {
      loadProperties();
      request("/about").then((data) => data && setAbout(data)).catch(() => {});
      request("/site-content").then((data) => data && setSiteContent(data)).catch(() => {});
    }
  }, [token]);

  const login = async (event) => {
    event.preventDefault(); setMessage("");
    try {
      const data = await request("/auth/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("adminToken", data.token); setToken(data.token);
    } catch (error) { setMessage(error.message); }
  };

  const saveProperty = async (event) => {
    event.preventDefault(); setMessage("");
    try {
      const payload = { ...form, image: (form.gallery && form.gallery[0]) || form.image || "" };
      const path = editingId ? `/admin/properties/${editingId}` : "/admin/properties";
      await request(path, { method: editingId ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setForm(emptyProperty); setEditingId(""); setMessage("Property saved."); loadProperties();
    } catch (error) { setMessage(error.message); }
  };

  const handleImageFiles = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    ).then((results) => {
      setForm((prev) => ({ ...prev, gallery: [...(prev.gallery || []), ...results] }));
    });
  };

  const addImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({ ...prev, gallery: [...(prev.gallery || []), trimmed] }));
    setImageUrlInput("");
  };

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  const editProperty = (property) => {
    setEditingId(property.id);
    setForm({
      ...emptyProperty,
      ...property,
      price: String(property.price),
      beds: String(property.beds || ""),
      baths: String(property.baths || ""),
      area: String(property.area || ""),
      gallery: property.gallery && property.gallery.length ? property.gallery : (property.image ? [property.image] : []),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeProperty = async (id) => {
    if (!window.confirm("Delete this property listing?")) return;
    try { await request(`/admin/properties/${id}`, { method: "DELETE" }); setMessage("Property deleted."); loadProperties(); }
    catch (error) { setMessage(error.message); }
  };

  // Save Realtor Profile Handler
  const saveRealtorProfile = async (e) => {
    e.preventDefault();
    try {
      // Send to backend API if available, or persist in local storage
      await request("/admin/realtor", { method: "PUT", body: JSON.stringify(realtor) }).catch(() => {});
      localStorage.setItem("realtorInfo", JSON.stringify(realtor));
      setMessage("Realtor profile updated successfully!");
    } catch (error) {
      setMessage("Saved locally: " + error.message);
    }
  };

  const handleOfficeChange = (index, field, value) => {
    const updatedOffices = [...realtor.offices];
    updatedOffices[index][field] = value;
    setRealtor({ ...realtor, offices: updatedOffices });
  };

  const addOffice = () => {
    setRealtor({
      ...realtor,
      offices: [...realtor.offices, { city: "", address: "" }],
    });
  };

  const removeOffice = (index) => {
    const updatedOffices = realtor.offices.filter((_, i) => i !== index);
    setRealtor({ ...realtor, offices: updatedOffices });
  };

  // About section handlers
  const saveAboutSection = async (e) => {
    e.preventDefault();
    try {
      await request("/admin/about", { method: "PUT", body: JSON.stringify(about) }).catch(() => {});
      localStorage.setItem("aboutInfo", JSON.stringify(about));
      setMessage("About section updated successfully!");
    } catch (error) {
      setMessage("Saved locally: " + error.message);
    }
  };

  const handleAboutImageFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAbout((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const updatePoint = (index, value) => {
    const updated = [...about.points];
    updated[index] = value;
    setAbout({ ...about, points: updated });
  };

  const addPoint = () => setAbout({ ...about, points: [...about.points, ""] });

  const removePoint = (index) => setAbout({ ...about, points: about.points.filter((_, i) => i !== index) });

  const updateParagraph = (index, value) => {
    const updated = [...about.modalParagraphs];
    updated[index] = value;
    setAbout({ ...about, modalParagraphs: updated });
  };

  const addParagraph = () => setAbout({ ...about, modalParagraphs: [...about.modalParagraphs, ""] });

  const removeParagraph = (index) =>
    setAbout({ ...about, modalParagraphs: about.modalParagraphs.filter((_, i) => i !== index) });

  // Site content handlers
  const saveSiteContent = async (e) => {
    e.preventDefault();
    try {
      await request("/admin/site-content", { method: "PUT", body: JSON.stringify(siteContent) }).catch(() => {});
      localStorage.setItem("siteContent", JSON.stringify(siteContent));
      setMessage("Page content updated successfully!");
    } catch (error) {
      setMessage("Saved locally: " + error.message);
    }
  };

  const updateStat = (index, field, value) => {
    const updated = [...siteContent.stats];
    updated[index] = { ...updated[index], [field]: value };
    setSiteContent({ ...siteContent, stats: updated });
  };

  const addStat = () =>
    setSiteContent({ ...siteContent, stats: [...siteContent.stats, { value: "", label: "" }] });

  const removeStat = (index) =>
    setSiteContent({ ...siteContent, stats: siteContent.stats.filter((_, i) => i !== index) });

  const updateService = (index, field, value) => {
    const updated = [...siteContent.services];
    updated[index] = { ...updated[index], [field]: value };
    setSiteContent({ ...siteContent, services: updated });
  };

  const addService = () =>
    setSiteContent({
      ...siteContent,
      services: [...siteContent.services, { icon: "🏠", title: "", description: "" }],
    });

  const removeService = (index) =>
    setSiteContent({ ...siteContent, services: siteContent.services.filter((_, i) => i !== index) });

  if (!token) return <main className="admin-shell"><section className="admin-login"><p>RAMZEE-GALAXY</p><h1>Admin sign in</h1><form onSubmit={login}><input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} /><input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} /><button>Sign in</button></form>{message && <p className="admin-message">{message}</p>}</section></main>;

  return (
    <main className="admin-shell">
      <section className="admin-dashboard">
        <header>
          <div>
            <p>RAMZEE-GALAXY</p>
            <h1>Admin Management Dashboard</h1>
          </div>
          <button className="secondary" onClick={() => { localStorage.removeItem("adminToken"); setToken(""); }}>Sign out</button>
        </header>

        {/* Tab Selection Navigation */}
        <div style={{ display: "flex", gap: "10px", margin: "1rem 0" }}>
          <button type="button" className={activeTab === "properties" ? "" : "secondary"} onClick={() => setActiveTab("properties")}>Manage Properties</button>
          <button type="button" className={activeTab === "realtor" ? "" : "secondary"} onClick={() => setActiveTab("realtor")}>Manage Realtor Profile</button>
          <button type="button" className={activeTab === "about" ? "" : "secondary"} onClick={() => setActiveTab("about")}>Manage About Section</button>
          <button type="button" className={activeTab === "content" ? "" : "secondary"} onClick={() => setActiveTab("content")}>Manage Page Content</button>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {activeTab === "properties" ? (
          <>
            <form className="property-form" onSubmit={saveProperty}>
              <h2>{editingId ? "Edit listing" : "Add a listing"}</h2>
              <input required placeholder="Property title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input required placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <input required type="number" min="0" placeholder="Price (PKR)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
                <option value="sale">For sale</option>
                <option value="rent">For rent</option>
                <option value="open-house">Open house event</option>
              </select>
              {form.purpose === "open-house" && (
                <>
                  <input required type="date" aria-label="Open house date" value={form.openHouseDate} onChange={(e) => setForm({ ...form, openHouseDate: e.target.value })} />
                  <input type="time" aria-label="Open house time" value={form.openHouseTime} onChange={(e) => setForm({ ...form, openHouseTime: e.target.value })} />
                </>
              )}
              <input required placeholder="Area unit (e.g. marla)" value={form.areaUnit} onChange={(e) => setForm({ ...form, areaUnit: e.target.value })} />
              <input type="number" min="0" placeholder="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
              <input type="number" min="0" placeholder="Bedrooms" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} />
              <input type="number" min="0" placeholder="Bathrooms" value={form.baths} onChange={(e) => setForm({ ...form, baths: e.target.value })} />
              <div className="wide image-manager">
                <label>Property Images</label>
                <input type="file" accept="image/*" multiple onChange={handleImageFiles} />

                <div className="image-url-row">
                  <input
                    placeholder="Or paste an image URL"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                  />
                  <button type="button" className="secondary" onClick={addImageUrl}>Add</button>
                </div>

                {form.gallery && form.gallery.length > 0 && (
                  <div className="image-preview-grid">
                    {form.gallery.map((img, idx) => (
                      <div className="image-preview-item" key={idx}>
                        <img src={img} alt={`Property image ${idx + 1}`} />
                        {idx === 0 && <span className="cover-badge">Cover</span>}
                        <button type="button" className="remove-image-btn" onClick={() => removeImage(idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <textarea className="wide" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <div>
                <button>{editingId ? "Update listing" : "Create listing"}</button>
                {editingId && <button type="button" className="secondary" onClick={() => { setEditingId(""); setForm(emptyProperty); }}>Cancel</button>}
              </div>
            </form>

            <section className="listing-table">
              <h2>All listings ({properties.length})</h2>
              {properties.map((property) => (
                <article key={property.id}>
                  <div>
                    <strong>{property.title}</strong>
                    <span>{property.location} · {property.purpose} · {property.status}</span>
                  </div>
                  <div>
                    <button className="secondary" onClick={() => editProperty(property)}>Edit</button>
                    <button className="danger" onClick={() => removeProperty(property.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : activeTab === "realtor" ? (
          /* Realtor Details Form */
          <form className="property-form" onSubmit={saveRealtorProfile}>
            <h2>Edit Realtor Profile Details</h2>
            <input required placeholder="Realtor Name" value={realtor.name} onChange={(e) => setRealtor({ ...realtor, name: e.target.value })} />
            <input required placeholder="Professional Title" value={realtor.title} onChange={(e) => setRealtor({ ...realtor, title: e.target.value })} />
            <input required placeholder="License Number" value={realtor.licenseNo} onChange={(e) => setRealtor({ ...realtor, licenseNo: e.target.value })} />
            <input required placeholder="Email Address" type="email" value={realtor.email} onChange={(e) => setRealtor({ ...realtor, email: e.target.value })} />
            <input required placeholder="Primary Phone Number" value={realtor.phone} onChange={(e) => setRealtor({ ...realtor, phone: e.target.value })} />
            <input placeholder="Alternate Phone Number" value={realtor.altPhone} onChange={(e) => setRealtor({ ...realtor, altPhone: e.target.value })} />
            <input className="wide" placeholder="Photo URL" value={realtor.photo} onChange={(e) => setRealtor({ ...realtor, photo: e.target.value })} />

            <div className="wide" style={{ marginTop: "1rem" }}>
              <h3>Office Locations</h3>
              {realtor.offices.map((office, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: "10px", margin: "8px 0" }}>
                  <input placeholder="City / Branch Name" value={office.city} onChange={(e) => handleOfficeChange(idx, "city", e.target.value)} required />
                  <input placeholder="Full Address" value={office.address} onChange={(e) => handleOfficeChange(idx, "address", e.target.value)} required />
                  <button type="button" className="danger" onClick={() => removeOffice(idx)}>Remove</button>
                </div>
              ))}
              <button type="button" className="secondary" onClick={addOffice} style={{ marginTop: "8px" }}>+ Add Office Location</button>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <button type="submit">Save Profile Changes</button>
            </div>
          </form>
        ) : activeTab === "about" ? (
          /* About Section Form */
          <form className="property-form" onSubmit={saveAboutSection}>
            <h2>Edit About Section</h2>

            <div className="wide image-manager">
              <label>About Section Image</label>
              <input type="file" accept="image/*" onChange={handleAboutImageFile} />
              <input
                className="wide"
                placeholder="Or paste an image URL"
                value={about.image}
                onChange={(e) => setAbout({ ...about, image: e.target.value })}
              />
              {about.image && (
                <div className="image-preview-grid">
                  <div className="image-preview-item">
                    <img src={about.image} alt="About section preview" />
                  </div>
                </div>
              )}
            </div>

            <input required placeholder="Small tag (e.g. ABOUT OUR COMPANY)" className="wide" value={about.tag} onChange={(e) => setAbout({ ...about, tag: e.target.value })} />
            <input required placeholder="Heading (first line)" value={about.heading} onChange={(e) => setAbout({ ...about, heading: e.target.value })} />
            <input required placeholder="Heading highlight (gold text)" value={about.headingHighlight} onChange={(e) => setAbout({ ...about, headingHighlight: e.target.value })} />
            <textarea required className="wide" placeholder="Short description shown on the page" value={about.text} onChange={(e) => setAbout({ ...about, text: e.target.value })} />

            <div className="wide" style={{ marginTop: "1rem" }}>
              <h3>Checklist Points</h3>
              <p style={{ color: "#777", fontSize: "13px", marginBottom: "8px" }}>
                Shown with a checkmark on the page and inside the "Learn More" popup.
              </p>
              {about.points.map((point, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", margin: "8px 0" }}>
                  <input placeholder="e.g. Verified Properties" value={point} onChange={(e) => updatePoint(idx, e.target.value)} required />
                  <button type="button" className="danger" onClick={() => removePoint(idx)}>Remove</button>
                </div>
              ))}
              <button type="button" className="secondary" onClick={addPoint} style={{ marginTop: "8px" }}>+ Add Point</button>
            </div>

            <div className="wide" style={{ marginTop: "1rem" }}>
              <h3>"Learn More" Popup Description</h3>
              <p style={{ color: "#777", fontSize: "13px", marginBottom: "8px" }}>
                Each paragraph appears one after another in the popup.
              </p>
              {about.modalParagraphs.map((paragraph, idx) => (
                <div key={idx} style={{ margin: "8px 0" }}>
                  <textarea
                    placeholder={`Paragraph ${idx + 1}`}
                    value={paragraph}
                    onChange={(e) => updateParagraph(idx, e.target.value)}
                    required
                  />
                  <button type="button" className="danger" style={{ marginTop: "6px" }} onClick={() => removeParagraph(idx)}>Remove Paragraph</button>
                </div>
              ))}
              <button type="button" className="secondary" onClick={addParagraph} style={{ marginTop: "8px" }}>+ Add Paragraph</button>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <button type="submit">Save About Section</button>
            </div>
          </form>
        ) : (
          /* Site-Wide Page Content Form */
          <form className="property-form" onSubmit={saveSiteContent}>
            <h2>Edit Page Content</h2>

            <div className="wide">
              <h3>Navbar & Branding</h3>
            </div>
            <input required placeholder="Brand Name (e.g. Ramzee-Galaxy)" value={siteContent.brandName} onChange={(e) => setSiteContent({ ...siteContent, brandName: e.target.value })} />
            <input required placeholder="Brand Tagline (e.g. PREMIUM PROPERTIES)" value={siteContent.brandTagline} onChange={(e) => setSiteContent({ ...siteContent, brandTagline: e.target.value })} />

            <div className="wide" style={{ marginTop: "1rem" }}>
              <h3>Hero Section</h3>
            </div>
            <input required className="wide" placeholder="Small title above the headline" value={siteContent.heroSmallTitle} onChange={(e) => setSiteContent({ ...siteContent, heroSmallTitle: e.target.value })} />
            <input required placeholder="Headline (first line)" value={siteContent.heroHeading} onChange={(e) => setSiteContent({ ...siteContent, heroHeading: e.target.value })} />
            <input required placeholder="Headline highlight (gold text)" value={siteContent.heroHeadingHighlight} onChange={(e) => setSiteContent({ ...siteContent, heroHeadingHighlight: e.target.value })} />
            <textarea required className="wide" placeholder="Hero description text" value={siteContent.heroText} onChange={(e) => setSiteContent({ ...siteContent, heroText: e.target.value })} />

            <div className="wide" style={{ marginTop: "1rem" }}>
              <h3>Stats Bar</h3>
              {siteContent.stats.map((stat, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: "10px", margin: "8px 0" }}>
                  <input placeholder="Value (e.g. 500+)" value={stat.value} onChange={(e) => updateStat(idx, "value", e.target.value)} required />
                  <input placeholder="Label (e.g. Properties)" value={stat.label} onChange={(e) => updateStat(idx, "label", e.target.value)} required />
                  <button type="button" className="danger" onClick={() => removeStat(idx)}>Remove</button>
                </div>
              ))}
              <button type="button" className="secondary" onClick={addStat} style={{ marginTop: "8px" }}>+ Add Stat</button>
            </div>

            <div className="wide" style={{ marginTop: "1rem" }}>
              <h3>Realtor Section Heading</h3>
            </div>
            <input required placeholder="Small tag (e.g. AUTHORIZED BROKER)" value={siteContent.realtorSectionTag} onChange={(e) => setSiteContent({ ...siteContent, realtorSectionTag: e.target.value })} />
            <input required placeholder="Heading" value={siteContent.realtorSectionHeading} onChange={(e) => setSiteContent({ ...siteContent, realtorSectionHeading: e.target.value })} />

            <div className="wide" style={{ marginTop: "1rem" }}>
              <h3>Properties Section Heading</h3>
            </div>
            <input required placeholder="Small tag" value={siteContent.propertiesSectionTag} onChange={(e) => setSiteContent({ ...siteContent, propertiesSectionTag: e.target.value })} />
            <input required placeholder="Heading" value={siteContent.propertiesSectionHeading} onChange={(e) => setSiteContent({ ...siteContent, propertiesSectionHeading: e.target.value })} />
            <textarea required className="wide" placeholder="Subtitle text" value={siteContent.propertiesSectionSubtitle} onChange={(e) => setSiteContent({ ...siteContent, propertiesSectionSubtitle: e.target.value })} />

            <div className="wide" style={{ marginTop: "1rem" }}>
              <h3>Services Section</h3>
            </div>
            <input required placeholder="Small tag (e.g. WHAT WE OFFER)" value={siteContent.servicesSectionTag} onChange={(e) => setSiteContent({ ...siteContent, servicesSectionTag: e.target.value })} />
            <input required placeholder="Heading (e.g. Our Services)" value={siteContent.servicesSectionHeading} onChange={(e) => setSiteContent({ ...siteContent, servicesSectionHeading: e.target.value })} />

            <div className="wide" style={{ marginTop: "0.5rem" }}>
              <p style={{ color: "#777", fontSize: "13px", marginBottom: "8px" }}>
                First card links to "For Sale" listings, second links to "For Rent" listings, third opens the contact popup — editing the text here doesn't change that behavior.
              </p>
              {siteContent.services.map((service, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "10px", margin: "8px 0", alignItems: "start" }}>
                  <input placeholder="Icon" value={service.icon} onChange={(e) => updateService(idx, "icon", e.target.value)} />
                  <div style={{ display: "grid", gap: "8px" }}>
                    <input placeholder="Card title" value={service.title} onChange={(e) => updateService(idx, "title", e.target.value)} required />
                    <textarea placeholder="Card description" value={service.description} onChange={(e) => updateService(idx, "description", e.target.value)} required />
                  </div>
                  <button type="button" className="danger" onClick={() => removeService(idx)}>Remove</button>
                </div>
              ))}
              <button type="button" className="secondary" onClick={addService} style={{ marginTop: "8px" }}>+ Add Service Card</button>
            </div>

            <div className="wide" style={{ marginTop: "1rem" }}>
              <h3>Contact Section Heading</h3>
            </div>
            <input required placeholder="Small tag" value={siteContent.contactSectionTag} onChange={(e) => setSiteContent({ ...siteContent, contactSectionTag: e.target.value })} />
            <input required placeholder="Heading" value={siteContent.contactSectionHeading} onChange={(e) => setSiteContent({ ...siteContent, contactSectionHeading: e.target.value })} />

            <div className="wide" style={{ marginTop: "1rem" }}>
              <h3>Footer</h3>
            </div>
            <input required placeholder="Footer tagline" value={siteContent.footerTagline} onChange={(e) => setSiteContent({ ...siteContent, footerTagline: e.target.value })} />
            <input required className="wide" placeholder="Copyright line" value={siteContent.footerCopyright} onChange={(e) => setSiteContent({ ...siteContent, footerCopyright: e.target.value })} />

            <div style={{ marginTop: "1rem" }}>
              <button type="submit">Save Page Content</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

export default AdminPanel;