import { useState } from "react";
import "./App.css";

const properties = [
  {
    id: 1,
    title: "Luxury Family House",
    location: "DHA Phase 6, Lahore",
    price: "PKR 8.5 Crore",
    type: "sale",
    beds: 5,
    baths: 4,
    area: "1 Kanal",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
  },
];

function App() {
  const [search, setSearch] = useState("");
  const [dealType, setDealType] = useState("buy"); // hero dropdown: buy | rent
  const [filterType, setFilterType] = useState("all"); // tabs: all | sale | rent

  const filteredProperties = properties
    .filter((property) => filterType === "all" || property.type === filterType)
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

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">
          <span>RE</span>
          <div>
            <h2>REAL ESTATE</h2>
            <p>PREMIUM PROPERTIES</p>
          </div>
        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#properties">Properties</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>

        <button className="login-btn">Login</button>
      </header>

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
        </div>

        <div className="property-grid">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <div className="property-card" data-type={property.type} key={property.id}>
                <div className="property-image">
                  <img src={property.image} alt={property.title} />

                  <div className="sale-badge">
                    {property.type === "rent" ? "FOR RENT" : "FOR SALE"}
                  </div>

                  <button className="heart">♡</button>
                </div>

                <div className="property-info">
                  <p className="location">📍 {property.location}</p>

                  <h3>{property.title}</h3>

                  <h2>{property.price}</h2>

                  <div className="property-details">
                    <span>🛏 {property.beds} Beds</span>
                    <span>🚿 {property.baths} Baths</span>
                    <span>📐 {property.area}</span>
                  </div>

                  <button className="details-btn">
                    View Property
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No properties found.</p>
          )}
        </div>
      </section>

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

          <button className="gold-btn">Learn More</button>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="section-heading">
          <p>WHAT WE OFFER</p>
          <h2>Our Services</h2>
        </div>

        <div className="service-grid">
          <div className="service-card">
            <div className="service-icon">🏠</div>
            <h3>Buy Property</h3>
            <p>
              Find your ideal home from our collection of premium properties.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">🔑</div>
            <h3>Rent Property</h3>
            <p>
              Explore quality rental properties in prime locations.
            </p>
          </div>

          <div className="service-card">
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

        <button className="contact-btn">Contact Us</button>
      </section>

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
    </div>
  );
}

export default App;