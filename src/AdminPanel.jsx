import { useEffect, useState } from "react";
import "./AdminPanel.css";

const apiUrl = import.meta.env.VITE_API_URL || "/api";
const emptyProperty = {
  title: "", location: "", price: "", purpose: "sale", areaUnit: "marla",
  beds: "", baths: "", area: "", image: "", description: "", openHouseDate: "", openHouseTime: "", status: "published",
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

function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(emptyProperty);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  
  // Realtor state management
  const [realtor, setRealtor] = useState(() => {
    const saved = localStorage.getItem("realtorInfo");
    return saved ? JSON.parse(saved) : initialRealtor;
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

  useEffect(() => { if (token) loadProperties(); }, [token]);

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
      const path = editingId ? `/admin/properties/${editingId}` : "/admin/properties";
      await request(path, { method: editingId ? "PATCH" : "POST", body: JSON.stringify(form) });
      setForm(emptyProperty); setEditingId(""); setMessage("Property saved."); loadProperties();
    } catch (error) { setMessage(error.message); }
  };

  const editProperty = (property) => {
    setEditingId(property.id);
    setForm({ ...emptyProperty, ...property, price: String(property.price), beds: String(property.beds || ""), baths: String(property.baths || ""), area: String(property.area || "") });
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
              <input className="wide" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
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
        ) : (
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
        )}
      </section>
    </main>
  );
}

export default AdminPanel;