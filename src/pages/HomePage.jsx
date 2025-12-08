import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { getCollectionData, getDocumentData } from "./Firebase/CloudFirestore/GetData";
import "./homepage.css";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [bannerImages, setBannerImages] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loadingCategories, setLoadingCategories] = useState(true);

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
    } finally {
      setLoadingCategories(false); // Important
    }
  };
  fetchCategories();
}, []);

  // Fetch banner images
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const bannerDoc = await getDocumentData("mainBanner", "ksUBIAg4UUqTD9IaRzIg");
        if (bannerDoc) {
          const images = [bannerDoc.imageUrl1, bannerDoc.imageUrl2, bannerDoc.imageUrl3].filter(Boolean);
          setBannerImages(images);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBanner();
  }, []);

  // Auto-slide banner every 3 seconds
  useEffect(() => {
    if (bannerImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % bannerImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [bannerImages]);

  const handleShowMore = () => setVisibleCount(categories.length);
  const handleCategoryClick = (cat) => {
    setExpandedCategory(cat);
    setSubCategories(cat.subCategory || []);
  };

  return (
    <>
      <Header />
      <div className="main-content-wrapper">

        {/* ==================== HERO BANNER ==================== */}
<div
  className="hero-banner"
  style={{ position: "relative", height: "400px", overflow: "hidden" }}
>
  {bannerImages.map((img, index) => (
    <img
      key={index}
      src={img}
      alt={`Banner ${index + 1}`}
      className={`w-100  ${index === currentBannerIndex ? "active" : ""}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "opacity 1s ease-in-out",
        opacity: index === currentBannerIndex ? 1 : 0,
      }}
    />
  ))}


</div>
  {/* ==================== Navigation Dots ==================== */}
  <div
    className="banner-dots py-2 bg-light border justify-content-center d-flex gap-4"
    
  >
    {bannerImages.map((_, index) => (
      <span
        key={index}
        onClick={() => setCurrentBannerIndex(index)}
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: index === currentBannerIndex ? "#f1d143ff" : "rgba(32, 141, 163, 0.5)",
          cursor: "pointer",
          transition: "background 0.3s",
        }}
      ></span>
    ))}
  </div>



        {/* ==================== INFO BAR ==================== */}
        <div className="">
          <div className="row text-center info-bar p-3 gx-0">
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

        {/* ==================== SHOP BY CATEGORY ==================== */}
     <section className="container py-5 mx-auto">
  <h3 className="text-center mb-3">
    {expandedCategory ? `Shop by Sub-Category` : `Shop by Category`}
  </h3>

  {loadingCategories ? (
    <div className="text-center py-4">
      <div className="spinner-border text-warning"></div>
      <p className="mt-2 text-muted">Loading categories...</p>
    </div>
  ) : (
    <div className="row g-3 justify-content-center">
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
        ))}

      {expandedCategory && (
        <>
          <div className="col-12 text-center mb-3">
            <button
              className="btn btn-warning btn-sm flex-fill text-white"
              onClick={() => setExpandedCategory(null)}
            >
              ← Back to Categories
            </button>
          </div>

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
