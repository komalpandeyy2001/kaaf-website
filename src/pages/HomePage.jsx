import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { getCollectionData } from "./Firebase/CloudFirestore/GetData";
import "./homepage.css";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [expandedCategory, setExpandedCategory] = useState(null); // clicked category
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetched = await getCollectionData("productCategory");

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
    setVisibleCount(categories.length);
  };

  const handleCategoryClick = (cat) => {
   setExpandedCategory(cat);
setSubCategories(cat.subCategory || []);
  };

  return (
    <>
      <Header />

              {/* ==================== HERO BANNER ==================== */}
        <div className="hero-banner">
          <img
            src="https://t4.ftcdn.net/jpg/02/49/50/15/360_F_249501541_XmWdfAfUbWAvGxBwAM0ba2aYT36ntlpH.jpg"
            alt="Main Banner"
            className="w-100  hero-img"
          />
        </div>

        {/* ==================== INFO BAR ==================== */}
        <div className="mt-md-5 mt-4">
          <div className="row text-center info-bar p-3   gx-0">
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

      <div className="main-content-wrapper">
        <section className="container py-4 mx-auto">
          <h3 className="text-center mb-3">Shop by Category</h3>

      <div className="row g-3 justify-content-center">
  {/* If no category selected → show categories */}
  {!expandedCategory &&
    categories.slice(0, visibleCount).map((cat) => (
      <div key={cat.id} className="col-6 col-md-3">
        <div
          onClick={() => handleCategoryClick(cat)}
          className="category-card cursor-pointer"
        >
          <img
            src={cat.image || "https://via.placeholder.com/300x300?text=Category"}
            alt={cat.name}
            className="category-img"
          />
          <div className="category-label text-capitalize">{cat.name}</div>
        </div>
      </div>
    ))
  }

  {/* If category selected → show only subcategories */}
{/* If category selected → show back button + subcategories */}
{expandedCategory && (
  <>
    {/* Back Button */}
    <div className="col-12 text-center mb-3">
      <button
        className="btn btn-outline-primary"
        onClick={() => setExpandedCategory(null)}
      >
        ← Back to Categories
      </button>
    </div>

    {/* Subcategories */}
    {subCategories.map((sub, idx) => (
      <div key={idx} className="col-6 col-md-3">
        <Link
          to={`/subcategory/${expandedCategory.id}/${sub}`}
          className="text-decoration-none"
        >
          <div className="subcat-card">
            <span className="subcat-text">{sub}</span>
          </div>
        </Link>
      </div>
    ))}
  </>
)}
</div>

      
        </section>
      </div>

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

      <Footer />
    </>
  );
}

export default HomePage;
