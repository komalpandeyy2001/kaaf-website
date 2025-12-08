import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCollectionData, getDocumentData } from "./Firebase/CloudFirestore/GetData";
import { updateDocument } from "./Firebase/CloudFirestore/SetData";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { getUserData } from "../utils/userData";

function CategoryProducts() {

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { categoryId, subCat } = useParams();

  // ===================== FETCH DATA =====================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch category
      const catData = await getDocumentData("productCategory", categoryId);
      setCategory(catData);

      // 2. Fetch products
      const productList = await getCollectionData("products");

      const filtered = productList.filter((p) => {
        const matchCategory = p.categoryId === categoryId;

        const matchSubCategory = Array.isArray(p.subCategory)
          ? p.subCategory.includes(subCat)
          : p.subCategory === subCat;

        return matchCategory && matchSubCategory && p.isActive === true;
      });

      setProducts(filtered);

      // 3. Fetch liked items for user
      const userData = getUserData();
      if (userData?.uid) {
        const userDoc = await getDocumentData("users", userData.uid);
        if (userDoc?.likedProducts) {
          setLikedProducts(new Set(userDoc.likedProducts));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [categoryId, subCat]);

  // ===================== LIKE HANDLER =====================
  const handleLike = async (productId) => {
    const userData = getUserData();
    if (!userData || !userData.uid) {
      toast.error('Please log in to like products');
      return;
    }

    const isLiked = likedProducts.has(productId);
    const newLikedProducts = new Set(likedProducts);

    if (isLiked) newLikedProducts.delete(productId);
    else newLikedProducts.add(productId);

    setLikedProducts(newLikedProducts);

    try {
      await updateDocument('users', userData.uid, {
        likedProducts: Array.from(newLikedProducts)
      });

      toast[!isLiked ? 'success' : 'info'](
        !isLiked ? 'Product added to wishlist!' : 'Product removed from wishlist'
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to update likes');
      setLikedProducts(likedProducts); // revert
    }
  };

  // ===================== ADD TO CART =====================
  const handleAddToCart = async (product) => {
    const userData = getUserData();
    if (!userData || !userData.uid) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      const userDoc = await getDocumentData('users', userData.uid);
      const currentCart = userDoc?.carts || [];

      const existingIndex = currentCart.findIndex(item => item.id === product.id);
      let updatedCart = [...currentCart];

      if (existingIndex >= 0) {
        updatedCart[existingIndex].quantity += 1;
        toast.success(`${product.name} quantity increased in cart!`);
      } else {
        updatedCart.push({ id: product.id, quantity: 1 });
        toast.success(`${product.name} added to cart!`);
      }

      await updateDocument('users', userData.uid, { carts: updatedCart });
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to add item to cart');
    }
  };

  // ===================== BUY NOW =====================
  const handleBuyNow = (product) => {
    navigate(`/checkout?productId=${product.id}&quantity=1`);
  };

  return (
    <>
      <Header />

      <div className="main-content-wrapper">
        <div className="p-4 text-center">

          {/* ==================== HEADING ==================== */}
          <h3 className="mb-2 text-capitalize">
            {category?.name}
            {!loading && ` (${products.length})`}
          </h3>

          {/* ==================== BACK BUTTON ==================== */}
          <Link
            to={`/`}
            className="btn btn-warning btn-sm flex-fill text-white mb-4"

          >
            ← Back to Categories
          </Link>

          {/* ==================== LOADING SKELETON ==================== */}
          {loading && (
            <div className="text-center py-4">
              <div className="spinner-border text-warning"></div>
              <p className="mt-2 text-muted">Loading categories...</p>
            </div>
          )}

          {/* ==================== SHOW PRODUCTS ==================== */}
          {!loading && (
            <div className="row g-3 justify-content-center">

              {/* If NO products */}
              {products.length === 0 && (
                <div className="text-center my-5">
                  <h4 className="text-muted fw-bold">No Products Found</h4>
                  <p className="text-muted">Try browsing other categories.</p>
                </div>
              )}

              {/* If products found */}
              {products.length > 0 &&
                products.map((product) => (
                  <div key={product.id} className="col-6 col-lg-3">
                    <div className="card h-100 shadow-sm">
                      <div className="position-relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="card-img-top"
                          style={{
                            height: "170px",
                            objectFit: "cover",
                            backgroundColor: "#f8f9fa",
                          }}
                        />

                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(product.id)}
                          className="btn btn-light position-absolute top-0 end-0 m-2 py-1 px-2 rounded-circle shadow-sm"
                        >
                          {likedProducts.has(product.id) ? (
                            <FaHeart className="text-danger" size={16} />
                          ) : (
                            <FaRegHeart className="text-secondary" size={16} />
                          )}
                        </button>
                      </div>

                      <div className="card-body d-flex flex-column">
                        <Link to={`/product/${product.id}`} className="text-decoration-none">
                          <h6 className="text-dark text-truncate text-capitalize">
                            {product.name}
                          </h6>
                        </Link>

                        <p className="text-muted mb-2">₹{product.price}</p>

                        <div className="d-flex gap-1 mt-auto">
                          {product.orderedQty >= product.stockQty ? (
                            <button className="btn btn-danger btn-sm flex-fill" disabled>
                              Out of Stock
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleBuyNow(product)}
                                className="btn btn-warning btn-sm flex-fill text-white"
                              >
                                Buy Now
                              </button>
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="btn btn-secondary btn-sm flex-fill"
                              >
                                Add to Cart
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}

export default CategoryProducts;
