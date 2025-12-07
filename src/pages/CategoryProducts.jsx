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
  const navigate = useNavigate();
const { categoryId, subCat } = useParams();

useEffect(() => {
  const fetchData = async () => {
    // 1. Fetch category
    const catData = await getDocumentData("productCategory", categoryId);
    setCategory(catData);

    // 2. Fetch all products
    const productList = await getCollectionData("products");

    // 3. Filter products by category + subcategory (supports array)
    const filtered = productList.filter((p) => {
      const matchCategory = p.categoryId === categoryId;

      const matchSubCategory = Array.isArray(p.subCategory)
        ? p.subCategory.includes(subCat)     // FIX for array
        : p.subCategory === subCat;          // fallback if string

      return matchCategory && matchSubCategory && p.isActive === true;
    });

    setProducts(filtered);

    // 4. Fetch liked products of user
    const userData = getUserData();
    if (userData?.uid) {
      const userDoc = await getDocumentData("users", userData.uid);
      if (userDoc?.likedProducts) {
        setLikedProducts(new Set(userDoc.likedProducts));
      }
    }
  };

  fetchData();
}, [categoryId, subCat]);



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

  const handleBuyNow = (product) => {
    navigate(`/checkout?productId=${product.id}&quantity=1`);
  };

  return (
    <>
      <Header />



      <div className="main-content-wrapper">
<div className="p-4 text-center">

          <h3 className="mb-3 text-capitalize">
          {category?.name}  ({products.length})
        </h3>
           <Link
        to={`/`}
         className="btn btn-outline-primary mb-3"
      >
        ← Back to Categories
      </Link>

  <div className="row g-3 justify-content-center">

  {/* If NO PRODUCTS found */}
  {products.length === 0 && (
    <div className="text-center my-5">
           

      <h5 className="text-muted">No Products Found in this Subcategory</h5>


    </div>
  )}

  {/* If products found */}
  {products.length > 0 &&
    products.map((product) => (
      <div key={product.id} className="col-6 col-md-3">
        <div className="card h-100 shadow-sm">
          <div className="position-relative">
            <img
              src={product.image}
              alt={product.name}
              className="card-img-top"
              style={{
                height: "170px",
                objectFit: "contain",
                backgroundColor: "#f8f9fa",
              }}
            />
            <button
              onClick={() => handleLike(product.id)}
              className="btn btn-light position-absolute top-0 end-0 m-1 p-1 rounded-circle shadow-sm"
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

</div>
      </div>

      <Footer />
    </>
  );
}

export default CategoryProducts;
