import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserData } from '../utils/userData';
import { getDocumentData, getCollectionData } from './Firebase/CloudFirestore/GetData';
import { updateDocument } from './Firebase/CloudFirestore/SetData';
import { toast } from 'react-toastify';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import { FaHeart, FaRegHeart } from "react-icons/fa";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const allProducts = await getCollectionData('products');
        const foundProduct = allProducts.find(p => p.id === id);
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          toast.error('Product not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserLikes = async () => {
      const userData = getUserData();
      if (userData && userData.uid) {
        try {
          const userDoc = await getDocumentData('users', userData.uid);
          if (userDoc && userDoc.likedProducts) {
            setLikedProducts(new Set(userDoc.likedProducts));
          }
        } catch (error) {
          console.error('Error fetching user likes:', error);
        }
      }
    };

    fetchProduct();
    fetchUserLikes();
  }, [id, navigate]);

  const handleLike = async () => {
    const userData = getUserData();
    if (!userData || !userData.uid) {
      toast.error('Please log in to like products');
      return;
    }

    const isLiked = likedProducts.has(product.id);
    const newLikedProducts = new Set(likedProducts);

    if (isLiked) newLikedProducts.delete(product.id);
    else newLikedProducts.add(product.id);

    setLikedProducts(newLikedProducts);

    try {
      await updateDocument('users', userData.uid, {
        likedProducts: Array.from(newLikedProducts),
      });
      toast[isLiked ? 'info' : 'success'](
        isLiked ? 'Product removed from wishlist' : 'Product added to wishlist!'
      );
    } catch (error) {
      console.error('Error updating liked products:', error);
      toast.error('Failed to update likes');
      setLikedProducts(likedProducts);
    }
  };

  const handleAddToCart = async () => {
    const userData = getUserData();
    if (!userData || !userData.uid) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      const userDoc = await getDocumentData('users', userData.uid);
      const currentCart = userDoc?.carts || [];
      const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === product.id);

      let updatedCart;
      if (existingItemIndex >= 0) {
        updatedCart = [...currentCart];
        updatedCart[existingItemIndex].quantity += quantity;
        toast.success(`${product.name} quantity increased in cart!`);
      } else {
        updatedCart = [...currentCart, { id: product.id, quantity }];
        toast.success(`${product.name} added to cart!`);
      }

      await updateDocument('users', userData.uid, { carts: updatedCart });
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleBuyNow = () => {
    navigate(`/checkout?productId=${product.id}&quantity=${quantity}`);
  };

  const updateQuantity = (newQuantity) => {
    if (newQuantity >= 1) setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="App">
        <Header />
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-warning" role="status"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="App">
      <Header />
      <div className="container py-5 mt-5">
        {/* === TOP SECTION === */}
        <div className="row align-items-center border rounded-4 overflow-hidden bg-white p-4">
          {/* Left Image */}
          <div className="col-sm-4 mb-4 mb-sm-0">
            <div className="position-relative border rounded-4 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="img-fluid"
                style={{
                  maxHeight: '300px',
                  width: '100%',
                  objectFit: "cover",
                  backgroundColor: '#fafafa',
                }}
              />
              <button
                onClick={handleLike}
                className="btn btn-light position-absolute top-0 end-0 m-2 py-1 px-2 rounded-circle shadow-sm"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                {likedProducts.has(product.id) ? (
                  <FaHeart className="text-danger" size={16} />
                ) : (
                  <FaRegHeart className="text-dark" size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Right Info */}
          <div className="col-sm-6">
            <h3 className="fw-bold">{product.name}</h3>
            <p className="text-muted mb-2">{product.category}</p>
            <h3 className="text-success fw-semibold mb-4">₹{product.price}</h3>

            {/* <div className="mb-4">
              <label className="form-label fw-semibold">Quantity:</label>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => updateQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="px-3 py-1 border rounded bg-light">{quantity}</span>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => updateQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div> */}

            <div className="d-flex gap-3">
              {product.orderedQty >= product.stockQty ? (
                <button className="btn btn-danger btn-sm flex-fill" disabled>
                  Out of Stock
                </button>
              ) : (
                <>
                  <button className="btn btn-warning btn-sm flex-fill text-white" onClick={handleBuyNow}>
                    Buy Now
                  </button>
                  <button className="btn btn-secondary btn-sm flex-fill" onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* === ACCORDION SECTION BELOW === */}
        <div className="mt-5">
          <h4 className="fw-bold mb-3 text-center">Product Details</h4>

          {/* Description Accordion */}
          {/* Description Accordion */}
<div className="border rounded-3 mb-3">
  <button
    className="btn w-100 text-start d-flex align-items-center justify-content-between"
    onClick={() => setDescriptionOpen(!descriptionOpen)}
  >
    <span><strong>📄 Description</strong></span>
    <span>{descriptionOpen ? '−' : '+'}</span>
  </button>

  {descriptionOpen && (
    <div className="p-3 border-top bg-light small">
      <p className="mb-0 text-muted">
        {product.description || "No description available."}
      </p>
    </div>
  )}
</div>


          {/* Features Accordion */}
     <div className="border rounded-3 mb-3">
  <button
    className="btn w-100 text-start d-flex align-items-center justify-content-between"
    onClick={() => setFeaturesOpen(!featuresOpen)}
  >
    <span><strong>⭐ Features</strong></span>
    <span>{featuresOpen ? '−' : '+'}</span>
  </button>

  {featuresOpen && (
    <div className="p-3 border-top bg-light small">
      <p className="mb-0 text-muted">
        {product.features || "No features listed."}
      </p>
    </div>
  )}
</div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
