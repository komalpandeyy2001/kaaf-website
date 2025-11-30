import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { getCollectionData } from "./Firebase/CloudFirestore/GetData";
import "./homepage.css";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12); // show first 12 cards

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetched = await getCollectionData("productCategory");

        // Sort alphabetically by category name
        const sorted = fetched.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );

        setCategories(sorted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleShowMore = () => {
    setVisibleCount(categories.length); // show all remaining cards
  };

  return (
    <>
      <Header />

      <div className="main-content-wrapper">
        {/* ==================== HERO BANNER ==================== */}
        <div className="hero-banner">
          <img
            src="https://t4.ftcdn.net/jpg/02/49/50/15/360_F_249501541_XmWdfAfUbWAvGxBwAM0ba2aYT36ntlpH.jpg"
            alt="Main Banner"
            className="w-100 rounded hero-img"
          />
        </div>

        {/* ==================== INFO BAR ==================== */}
        <div className="mt-5">
          <div className="row text-center info-bar py-3 rounded shadow-sm">
            <div className="col-4">
              <i className="bi bi-arrow-counterclockwise fs-4"></i>
              <p className="mb-0 small fw-semibold">7-Day Easy Returns</p>
            </div>

            <div className="col-4">
              <i className="bi bi-cash-coin fs-4"></i>
              <p className="mb-0 small fw-semibold">Cash on Delivery</p>
            </div>

            <div className="col-4">
              <i className="bi bi-people fs-4"></i>
              <p className="mb-0 small fw-semibold">Trusted by Millions</p>
            </div>
          </div>
        </div>

        {/* ==================== CATEGORY CARDS ==================== */}
        <section className="container py-4 mx-auto">
          <h3 className="text-center mb-3">Shop by Category</h3>

          <div className="row g-3">
            {categories.slice(0, visibleCount).map((cat) => (
              <div key={cat.id} className="col-6 col-md-3 ">
                <Link to={`/category/${cat.id}`} className="text-decoration-none text-dark">
                  <div className="category-card">
                    <img
                      src={cat.image || "https://via.placeholder.com/300x300?text=Category"}
                      alt={cat.name}
                      className="category-img"
                    />
                    <div className="category-label text-capitalize">{cat.name}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {visibleCount < categories.length && (
            <div className="text-center mt-3">
              <button
                onClick={handleShowMore}
                className="btn btn-outline-primary"
              >
                Show More Category
              </button>
            </div>
          )}
        </section>

        {/* ==================== BRAND LOGO SCROLLER ==================== */}
        <section className="brands-section my-4 py-4">
          <h3 className="text-center mb-3">Original Brands</h3>
          <div className="brands-wrapper">
            <div className="brands-track">
              {["amazon.png", "lg.png", "mi.png", "samsung.png", "havells.png", "bajaj.png", "vivo.png"].map((url, index) => (
                <div key={index} className="brand-logo">
                  <img src={url} alt={`Brand ${index + 1}`} />
                </div>
              ))}
              {/* Duplicate for seamless infinite scroll */}
              {["amazon.png", "lg.png", "mi.png", "samsung.png", "havells.png", "bajaj.png", "vivo.png"].map((url, index) => (
                <div key={"dup-" + index} className="brand-logo">
                  <img src={url} alt={`Brand ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default HomePage;
