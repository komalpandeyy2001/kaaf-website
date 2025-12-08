import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { getCollectionData, getDocumentData } from "./Firebase/CloudFirestore/GetData";
import { updateDocument } from "./Firebase/CloudFirestore/SetData";
import { getUserData } from "../utils/userData";
import { toast } from "react-toastify";
import "./homepage.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";

function HomePage() {
  const navigate = useNavigate();

  // UI states
  const [categories, setCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Banner states
  const [bannerImages, setBannerImages] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Product states (MERGED from CategoryProducts)
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [activeSubCategory, setActiveSubCategory] = useState(null);

  /* ===================== FETCH CATEGORIES ===================== */
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
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  /* ===================== FETCH BANNER ===================== */
  useEffect(() => {
    const fetchBanner = async () => {
      const bannerDoc = await getDocumentData("mainBanner", "ksUBIAg4UUqTD9IaRzIg");
      if (bannerDoc) {
        const imgs = [
          bannerDoc.imageUrl1,
          bannerDoc.imageUrl2,
          bannerDoc.imageUrl3,
        ].filter(Boolean);
        setBannerImages(imgs);
      }
    };
    fetchBanner();
  }, []);

  /* ===================== AUTO SLIDE ===================== */
  useEffect(() => {
    if (bannerImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [bannerImages]);

  /* ===================== CLICK CATEGORY → SHOW SUB-CATS ===================== */
  const handleCategoryClick = (cat) => {
    setExpandedCategory(cat);
    setSubCategories(cat.subCategory || []);
    setProducts([]);
    setActiveSubCategory(null);
  };

  /* ===================== CLICK SUB CATEGORY → FETCH PRODUCTS ===================== */
  const handleSubCategoryClick = async (sub) => {
    setActiveSubCategory(sub);
    setLoadingProducts(true);

    const allProducts = await getCollectionData("products");

    const filtered = allProducts.filter((p) => {
      const matchCategory = p.categoryId === expandedCategory.id;
      const matchSub = p.subCategory?.includes(sub);
      return matchCategory && matchSub && p.isActive === true;
    });

    setProducts(filtered);
    setLoadingProducts(false);

    // Load liked items
    const userData = getUserData();
    if (userData?.uid) {
      const userDoc = await getDocumentData("users", userData.uid);
      if (userDoc?.likedProducts) {
        setLikedProducts(new Set(userDoc.likedProducts));
      }
    }
  };

  /* ===================== LIKE PRODUCT ===================== */
  const handleLike = async (productId) => {
    const userData = getUserData();
    if (!userData?.uid) return toast.error("Please log in first");

    const newSet = new Set(likedProducts);
    const isLiked = newSet.has(productId);

    if (isLiked) newSet.delete(productId);
    else newSet.add(productId);

    setLikedProducts(newSet);

    await updateDocument("users", userData.uid, {
      likedProducts: Array.from(newSet),
    });

    toast[isLiked ? "info" : "success"](
      isLiked ? "Removed from wishlist" : "Added to wishlist"
    );
  };

  /* ===================== ADD TO CART ===================== */
  const handleAddToCart = async (product) => {
    const userData = getUserData();
    if (!userData?.uid) return toast.error("Please log in");

    try {
      const userDoc = await getDocumentData("users", userData.uid);
      const currentCart = userDoc?.carts || [];

      const index = currentCart.findIndex((i) => i.id === product.id);
      let updated = [...currentCart];

      if (index >= 0) {
        updated[index].quantity += 1;
      } else {
        updated.push({ id: product.id, quantity: 1 });
      }

      await updateDocument("users", userData.uid, { carts: updated });
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Added to cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  /* ===================== BUY NOW ===================== */
  const handleBuyNow = (product) => {
    navigate(`/checkout?productId=${product.id}&quantity=1`);
  };

  return (
    <>
      <Header />

      <div className="main-content-wrapper">
{!activeSubCategory && (
  <>
          {/* ===================== HERO SLIDER ===================== */}
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


        {/* ===================== DOTS ===================== */}
        <div className="banner-dots py-2 bg-light border d-flex justify-content-center gap-3">
          {bannerImages.map((_, i) => (
            <span
              key={i}
              onClick={() => setCurrentBannerIndex(i)}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: i === currentBannerIndex ? "#f1d143" : "#ccc",
                cursor: "pointer",
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
        </>

)}

        {/* ===================== CATEGORY SECTION ===================== */}
        <section className="container ">
          <h3 className=" mb-3">
           
          </h3>

          {/* LOADING CATEGORIES */}
          {loadingCategories ? (
            <div className="text-center py-4">
              <div className="spinner-border text-warning"></div>
            </div>
          ) : !expandedCategory ? (
            /* ================= CATEGORIES LIST ================= */
            <div className="row g-3 py-5 ">
              {categories.map((cat) => (
                <div key={cat.id} className="col-6 col-md-3">
                  <div
                    className="category-card"
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <img src={cat.image} className="category-img" />
                    <div className="category-label">{cat.name}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : !activeSubCategory ? (
            /* ================= SUB CATEGORY LIST ================= */
            <div className="row g-3 py-5 ">
              <div className="col-12  mb-3">
                <button
                  className="btn btn-warning text-white"
                  onClick={() => setExpandedCategory(null)}
                >
                  ← Back to Categories
                </button>
                <h3>Shop by Sub-Category</h3>
              </div>

              {subCategories.map((sub, i) => (
                <div
                  key={i}
                  className="col-6 col-md-3"
                  onClick={() => handleSubCategoryClick(sub)}
                >
                  <div className="subcat-card text-center">{sub}</div>
                </div>
              ))}
            </div>
          ) : (
            /* ================= PRODUCT GRID (MERGED) ================= */
            <div className="row g-3 ">
              <div className="col-12 mb-3">
                <button
                  className="btn btn-warning text-white"
                  onClick={() => setActiveSubCategory(null)}
                >
                  ← Back to sub-categories
                </button>
                <h3> {activeSubCategory} Products</h3>
              </div>

              {/* LOADING PRODUCTS */}
              {loadingProducts && (
                <div className="text-center py-4">
                  <div className="spinner-border text-warning"></div>
                </div>
              )}

              {/* NO PRODUCTS */}
              {!loadingProducts && products.length === 0 && (
                <h4 className="text-center text-muted my-5">
                  No Products Found
                </h4>
              )}

              {/* PRODUCT LIST */}
              {products.map((product) => (
                <div key={product.id} className="col-6 col-lg-3">
                  <div className="card h-100">
                    <div className="position-relative">
                      <img
                        src={product.image}
                        className="card-img-top"
                        style={{ height: "170px", objectFit: "cover" }}
                      />

                      <button
                        onClick={() => handleLike(product.id)}
                        className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle"
                      >
                        {likedProducts.has(product.id) ? (
                          <FaHeart className="text-danger" />
                        ) : (
                          <FaRegHeart className="text-secondary" />
                        )}
                      </button>
                    </div>

                    <div className="card-body d-flex flex-column">
                      <h6 className="text-capitalize text-truncate">
                        {product.name}
                      </h6>

                      <p className="text-muted">₹{product.price}</p>

                      <div className="d-flex gap-1 mt-auto">
                        <button
                          onClick={() => handleBuyNow(product)}
                          className="btn btn-warning text-white btn-sm flex-fill"
                        >
                          Buy Now
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="btn btn-secondary btn-sm flex-fill"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
{!activeSubCategory && (
<>
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
        </>
)}
      </div>

      <Footer />
    </>
  );
}

export default HomePage;
