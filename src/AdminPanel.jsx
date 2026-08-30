import { useEffect, useState } from "react";
import "./AdminPanel.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const emptyProperty = {
  title: "", location: "", price: "", purpose: "sale", areaUnit: "marla",
  beds: "", baths: "", area: "", image: "", description: "", openHouseDate: "", openHouseTime: "", status: "published",
};

function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(emptyProperty);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

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

  if (!token) return <main className="admin-shell"><section className="admin-login"><p>RAMZEE-GALAXY</p><h1>Admin sign in</h1><form onSubmit={login}><input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} /><input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} /><button>Sign in</button></form>{message && <p className="admin-message">{message}</p>}</section></main>;

  return <main className="admin-shell"><section className="admin-dashboard"><header><div><p>RAMZEE-GALAXY</p><h1>Property listings</h1></div><button className="secondary" onClick={() => { localStorage.removeItem("adminToken"); setToken(""); }}>Sign out</button></header><p className="admin-message">{message}</p><form className="property-form" onSubmit={saveProperty}><h2>{editingId ? "Edit listing" : "Add a listing"}</h2><input required placeholder="Property title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><input required placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /><input required type="number" min="0" placeholder="Price (PKR)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /><select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}><option value="sale">For sale</option><option value="rent">For rent</option><option value="open-house">Open house event</option></select>{form.purpose === "open-house" && <><input required type="date" aria-label="Open house date" value={form.openHouseDate} onChange={(e) => setForm({ ...form, openHouseDate: e.target.value })} /><input type="time" aria-label="Open house time" value={form.openHouseTime} onChange={(e) => setForm({ ...form, openHouseTime: e.target.value })} /></>}<input required placeholder="Area unit (e.g. marla)" value={form.areaUnit} onChange={(e) => setForm({ ...form, areaUnit: e.target.value })} /><input type="number" min="0" placeholder="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /><input type="number" min="0" placeholder="Bedrooms" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} /><input type="number" min="0" placeholder="Bathrooms" value={form.baths} onChange={(e) => setForm({ ...form, baths: e.target.value })} /><input className="wide" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /><textarea className="wide" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="published">Published</option><option value="draft">Draft</option></select><div><button>{editingId ? "Update listing" : "Create listing"}</button>{editingId && <button type="button" className="secondary" onClick={() => { setEditingId(""); setForm(emptyProperty); }}>Cancel</button>}</div></form><section className="listing-table"><h2>All listings ({properties.length})</h2>{properties.map((property) => <article key={property.id}><div><strong>{property.title}</strong><span>{property.location} · {property.purpose} · {property.status}</span></div><div><button className="secondary" onClick={() => editProperty(property)}>Edit</button><button className="danger" onClick={() => removeProperty(property.id)}>Delete</button></div></article>)}</section></section></main>;
}

export default AdminPanel;
