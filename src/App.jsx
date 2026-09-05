import { useEffect, useState } from "react";
import "./App.css";
import ChatWidget from "./ChatWidget.jsx";
import AdminPanel from "./AdminPanel.jsx";

const apiUrl = import.meta.env.VITE_API_URL || "/api";

const initialProperties = [
  {
    id: 1,
    title: "Luxury Family House",
    location: "DHA Phase 6, Lahore",
    price: "PKR 8.5 Crore",
    type: "sale",
    beds: 5,
    baths: 4,
    area: "1 Kanal",
    description:
      "Stunning contemporary 1 Kanal luxury house featuring high-end architecture, designer fittings, imported marble flooring, dual kitchens, spacious lawn, and dedicated servant quarters.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: 2,
    title: "Modern Villa",
    location: "Bahria Town, Lahore",
    price: "PKR 5.2 Crore",
    type: "sale",
    beds: 4,
    baths: 4,
    area: "10 Marla",
    description:
      "Elegantly designed modern villa located in a prime sector. Offers open-plan living rooms, a rooftop terrace, smartly planned storage spaces, and garage parking for 2 cars.",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: 3,
    title: "Contemporary House",
    location: "Gulberg, Lahore",
    price: "PKR 12 Crore",
    type: "sale",
    beds: 6,
    baths: 5,
    area: "2 Kanal",
    description:
      "Palatial home in the heart of Gulberg. Features custom woodwork, private swimming pool, smart home automation, expansive garden, and basement entertainment hall.",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: 4,
    title: "Cozy City Apartment",
    location: "Johar Town, Lahore",
    price: "PKR 85,000 / month",
    type: "rent",
    beds: 2,
    baths: 2,
    area: "5 Marla",
    description:
      "Stylish 2-bed apartment in a secure gated building. Close to top universities, shopping malls, and main avenues. Includes dedicated basement parking and 24/7 backup power.",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: 5,
    title: "Furnished Family Home",
    location: "DHA Phase 5, Lahore",
    price: "PKR 220,000 / month",
    type: "rent",
    beds: 4,
    baths: 3,
    area: "10 Marla",
    description:
      "Fully furnished residence ready for immediate move-in. Complete with modern appliances, stylish furniture sets, central air conditioning, and a beautiful front lawn.",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: 6,
    title: "Executive Penthouse",
    location: "Gulberg, Lahore",
    price: "PKR 350,000 / month",
    type: "rent",
    beds: 3,
    baths: 3,
    area: "8 Marla",
    description:
      "Top-floor luxury penthouse with panoramic city views, private Jacuzzi, open kitchen bar, private elevator access, and premium concierge services.",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

const defaultRealtorInfo = {
  name: "Alexander Vance",
  title: "Principal Realtor & Property Consultant",
  licenseNo: "RL-94820-PK",
  phone: "+92 300 1234567",
  altPhone: "+92 42 35789000",
  email: "contact@realestatepremium.com",
  photo:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
  offices: [
    {
      city: "Lahore Head Office",
      address: "Suite 402, Al-Hafeez Heights, Gulberg III, Lahore",
    },
    {
      city: "DHA Branch",
      address: "Commercial Plaza #14, Sector CCA, DHA Phase 6, Lahore",
    },
  ],
};

function App() {
  if (window.location.pathname.startsWith("/admin")) {
    return <AdminPanel />;
  }

  const [properties, setProperties] = useState(initialProperties);
  const [propertiesError, setPropertiesError] = useState("");
  const [search, setSearch] = useState("");
  const [dealType, setDealType] = useState("buy");
  const [filterType, setFilterType] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  const [realtorInfo, setRealtorInfo] = useState(() => {
    const saved = localStorage.getItem("realtorInfo");
    return saved ? JSON.parse(saved) : defaultRealtorInfo;
  });

  useEffect(() => {
    fetch(`${apiUrl}/properties`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load listings.");
        return response.json();
      })
      .then((data) => {
        if (data.properties && data.properties.length > 0) {
          setProperties(data.properties);
        }
      })
      .catch((error) => setPropertiesError(error.message));

    fetch(`${apiUrl}/realtor`)
      .then((res) => res.ok && res.json())
      .then((data) => data && setRealtorInfo(data))
      .catch(() => {});
  }, []);

  const filteredProperties = properties
    .filter(
      (property) =>
        filterType === "all" || (property.purpose || property.type) === filterType
    )
    .filter((property) =>
      `${property.title} ${property.location}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const handleHeroSearch = () => {
    setFilterType(dealType === "rent" ? "rent" : "sale");
    document
      .getElementById("properties")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const goToProperties = (type) => {
    setFilterType(type);
    document
      .getElementById("properties")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const openModal = (property) => {
    setSelectedProperty(property);
    setActiveImage(
      property.image ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"
    );
  };

  const closeModal = () => {
    setSelectedProperty(null);
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">
          <span>RE</span>
          <div>
            <h2>Ramzee-Galaxy</h2>
            <p>PREMIUM PROPERTIES</p>
          </div>
        </div>

        <nav className={menuOpen ? "open" : ""}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#realtor" onClick={() => setMenuOpen(false)}>Realtor Profile</a>
          <a href="#properties" onClick={() => setMenuOpen(false)}>Properties</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>

        <button
          className={`nav-toggle ${menuOpen ? "active" : ""}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {menuOpen && (
        <div className="nav-backdrop" onClick={() => setMenuOpen(false)}></div>
      )}

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-bg">
          <video
            className="hero-video"
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1800&q=90"
          >
            <source
              src="https://assets.mixkit.co/videos/30461/30461-720.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <p className="small-title">WELCOME TO YOUR FUTURE</p>

          <h1>
            Find Your
            <span> Dream Home</span>
          </h1>

          <p className="hero-text">
            Discover exceptional properties in the most desirable locations.
            Your perfect home is waiting for you.
          </p>

          {/* SEARCH BOX */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by property or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={dealType}
              onChange={(e) => setDealType(e.target.value)}
            >
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>

            <button onClick={handleHeroSearch}>Search Property</button>
          </div>
        </div>
      </section>

      {/* REALTOR PROFILE SECTION */}
      <section className="realtor-section" id="realtor">
        <div className="section-heading">
          <p>AUTHORIZED BROKER</p>
          <h2>Meet Your Lead Realtor</h2>
        </div>

        <div className="realtor-card">
          <div className="realtor-photo">
            <img src={realtorInfo.photo} alt={realtorInfo.name} />
            <div className="license-badge">
              <span>LICENSED AGENT</span>
              <strong>{realtorInfo.licenseNo}</strong>
            </div>
          </div>

          <div className="realtor-details">
            <h2>{realtorInfo.name}</h2>
            <p className="realtor-title">{realtorInfo.title}</p>

            <div className="realtor-contact-grid">
              <div className="contact-item">
                <span className="icon">📞</span>
                <div>
                  <small>Phone & WhatsApp</small>
                  <p>{realtorInfo.phone}</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="icon">☎️</span>
                <div>
                  <small>Office Telephone</small>
                  <p>{realtorInfo.altPhone}</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="icon">✉️</span>
                <div>
                  <small>Email Address</small>
                  <p>{realtorInfo.email}</p>
                </div>
              </div>
            </div>

            <div className="office-addresses">
              <h3>Office Locations</h3>
              <div className="office-list">
                {realtorInfo.offices.map((office, idx) => (
                  <div className="office-card" key={idx}>
                    <strong>📍 {office.city}</strong>
                    <p>{office.address}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div>
          <h2>500+</h2>
          <p>Properties</p>
        </div>

        <div>
          <h2>250+</h2>
          <p>Happy Clients</p>
        </div>

        <div>
          <h2>50+</h2>
          <p>Expert Agents</p>
        </div>

        <div>
          <h2>15+</h2>
          <p>Years Experience</p>
        </div>
      </section>

      {/* PROPERTIES */}
      <section className="properties-section" id="properties">
        <div className="section-heading">
          <p>EXPLORE OUR COLLECTION</p>
          <h2>Featured Properties</h2>
          <span>
            Discover carefully selected properties designed for modern living.
          </span>
        </div>

        <div className="property-tabs">
          <button
            className={`tab-btn ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All
          </button>
          <button
            className={`tab-btn ${filterType === "sale" ? "active" : ""}`}
            onClick={() => setFilterType("sale")}
          >
            For Sale
          </button>
          <button
            className={`tab-btn ${filterType === "rent" ? "active" : ""}`}
            onClick={() => setFilterType("rent")}
          >
            For Rent
          </button>
          <button
            className={`tab-btn ${filterType === "open-house" ? "active" : ""}`}
            onClick={() => setFilterType("open-house")}
          >
            Open Houses
          </button>
        </div>

        <div className="property-grid">
          {propertiesError ? (
            <p className="no-results">
              {propertiesError} Showing local offline listings.
            </p>
          ) : null}

          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => {
              const purpose = property.purpose || property.type;
              return (
                <div
                  className="property-card"
                  data-type={purpose}
                  key={property.id}
                >
                  <div className="property-image">
                    <img
                      src={
                        property.image ||
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"
                      }
                      alt={property.title}
                    />

                    <div className="sale-badge">
                      {purpose === "open-house"
                        ? "OPEN HOUSE"
                        : purpose === "rent"
                        ? "FOR RENT"
                        : "FOR SALE"}
                    </div>

                    <button className="heart">♡</button>
                  </div>

                  <div className="property-info">
                    <p className="location">📍 {property.location}</p>

                    <h3>{property.title}</h3>

                    <h2>
                      {typeof property.price === "number"
                        ? `${property.currency || "PKR"} ${property.price.toLocaleString()}`
                        : property.price}
                    </h2>

                    {purpose === "open-house" && (
                      <p className="location">
                        Open house: {property.openHouseDate}
                        {property.openHouseTime ? ` at ${property.openHouseTime}` : ""}
                      </p>
                    )}

                    <div className="property-details">
                      <span>🛏 {property.beds} Beds</span>
                      <span>🚿 {property.baths} Baths</span>
                      <span>📐 {property.area}</span>
                    </div>

                    <button
                      className="details-btn"
                      onClick={() => openModal(property)}
                    >
                      View Property
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-results">No properties found.</p>
          )}
        </div>
      </section>

      {/* PROPERTY DETAILS MODAL POPUP */}
      {selectedProperty && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>

            <div className="modal-content">
              <div className="modal-gallery">
                <div className="main-image">
                  <img src={activeImage} alt={selectedProperty.title} />
                </div>
                <div className="thumbnail-list">
                  {(
                    selectedProperty.gallery || [
                      selectedProperty.image ||
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
                    ]
                  ).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className={activeImage === img ? "active" : ""}
                      onClick={() => setActiveImage(img)}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-info">
                <span className="modal-badge">
                  {(selectedProperty.purpose || selectedProperty.type) ===
                  "open-house"
                    ? "OPEN HOUSE"
                    : (selectedProperty.purpose || selectedProperty.type) ===
                      "rent"
                    ? "FOR RENT"
                    : "FOR SALE"}
                </span>

                <h2>{selectedProperty.title}</h2>
                <p className="modal-location">
                  📍 {selectedProperty.location}
                </p>

                <h3 className="modal-price">
                  {typeof selectedProperty.price === "number"
                    ? `${selectedProperty.currency || "PKR"} ${selectedProperty.price.toLocaleString()}`
                    : selectedProperty.price}
                </h3>

                <div className="modal-specs">
                  <div>
                    <strong>{selectedProperty.beds}</strong>
                    <span>Bedrooms</span>
                  </div>
                  <div>
                    <strong>{selectedProperty.baths}</strong>
                    <span>Bathrooms</span>
                  </div>
                  <div>
                    <strong>{selectedProperty.area}</strong>
                    <span>Total Area</span>
                  </div>
                </div>

                <div className="modal-description">
                  <h4>Property Description</h4>
                  <p>
                    {selectedProperty.description ||
                      "No detailed description available for this listing."}
                  </p>
                </div>

                <div className="modal-agent">
                  <small>Contact Listing Agent:</small>
                  <p>
                    <strong>{realtorInfo.name}</strong> ({realtorInfo.phone})
                  </p>
                </div>

                <button
                  className="gold-btn modal-action"
                  onClick={() =>
                    alert(
                      `Inquiry sent for ${selectedProperty.title}! Agent ${realtorInfo.name} will contact you shortly.`
                    )
                  }
                >
                  Schedule a Viewing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80"
            alt="Luxury Interior"
          />
        </div>

        <div className="about-content">
          <p>ABOUT OUR COMPANY</p>

          <h2>
            Building Dreams,
            <span> Creating Futures</span>
          </h2>

          <p className="about-text">
            We help families, investors and businesses find exceptional
            properties. Our experienced team provides trusted real-estate
            solutions from property search to final purchase.
          </p>

          <div className="about-points">
            <div>
              <strong>✓</strong>
              <span>Verified Properties</span>
            </div>

            <div>
              <strong>✓</strong>
              <span>Professional Agents</span>
            </div>

            <div>
              <strong>✓</strong>
              <span>Trusted Service</span>
            </div>
          </div>

          <button className="gold-btn" onClick={() => setAboutModalOpen(true)}>
            Learn More
          </button>
        </div>
      </section>

      {/* ABOUT COMPANY POPUP */}
      {aboutModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setAboutModalOpen(false)}
        >
          <div className="about-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setAboutModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <p className="about-modal-tag">ABOUT OUR COMPANY</p>
            <h2>
              Building Dreams, <span>Creating Futures</span>
            </h2>

            <p className="about-modal-text">
              Ramzee-Galaxy was founded on a simple belief: finding a home
              should feel exciting, not overwhelming. For over 15 years,
              we've guided families, investors, and businesses across Lahore
              through every stage of the real-estate journey — from the
              first property search to the final signature.
            </p>

            <p className="about-modal-text">
              Our team of licensed, experienced agents combines local market
              knowledge with a genuinely personal approach. Every listing on
              this site is verified, every transaction is handled with full
              transparency, and every client gets direct access to a
              dedicated consultant — not a call center.
            </p>

            <p className="about-modal-text">
              Whether you're buying your first home, renting a place in the
              city, or selling a property at the right price, our mission is
              the same: make it simple, make it trustworthy, and make it
              feel like home.
            </p>

            <div className="about-modal-points">
              <span>✓ Verified Properties</span>
              <span>✓ Professional Agents</span>
              <span>✓ Trusted Service</span>
            </div>
          </div>
        </div>
      )}

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="section-heading">
          <p>WHAT WE OFFER</p>
          <h2>Our Services</h2>
        </div>

        <div className="service-grid">
          <div
            className="service-card"
            onClick={() => goToProperties("sale")}
          >
            <div className="service-icon">🏠</div>
            <h3>Buy Property</h3>
            <p>
              Find your ideal home from our collection of premium properties.
            </p>
          </div>

          <div
            className="service-card"
            onClick={() => goToProperties("rent")}
          >
            <div className="service-icon">🔑</div>
            <h3>Rent Property</h3>
            <p>
              Explore quality rental properties in prime locations.
            </p>
          </div>

          <div
            className="service-card"
            onClick={() => setContactModalOpen(true)}
          >
            <div className="service-icon">💰</div>
            <h3>Sell Property</h3>
            <p>
              Get professional assistance to sell your property at the right
              price.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="contact">
        <div>
          <p>READY TO FIND YOUR HOME?</p>
          <h2>Let's Make Your Dream Home a Reality.</h2>
        </div>

        <button className="contact-btn" onClick={() => setContactModalOpen(true)}>
          Contact Us
        </button>
      </section>

      {/* CONTACT INFO POPUP */}
      {contactModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setContactModalOpen(false)}
        >
          <div
            className="contact-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setContactModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <h2>Get In Touch</h2>
            <p className="contact-modal-sub">
              Reach out to {realtorInfo.name} directly.
            </p>

            <a className="contact-modal-item" href={`tel:${realtorInfo.phone}`}>
              <span className="icon">📞</span>
              <div>
                <small>Phone</small>
                <p>{realtorInfo.phone}</p>
              </div>
            </a>

            <a
              className="contact-modal-item"
              href={`mailto:${realtorInfo.email}`}
            >
              <span className="icon">✉️</span>
              <div>
                <small>Email</small>
                <p>{realtorInfo.email}</p>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <div>
          <h2>REAL ESTATE</h2>
          <p>Premium Properties & Real Estate Solutions</p>
        </div>

        <div>
          <p>© 2026 Real Estate. All Rights Reserved.</p>
        </div>
      </footer>

      {/* CHAT WIDGET */}
      <ChatWidget />
    </div>
  );
}

export default App;