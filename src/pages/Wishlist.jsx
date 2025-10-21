import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserData } from '../utils/userData';
import { getDocumentData, getCollectionData } from './Firebase/CloudFirestore/GetData';
import { updateDocument } from './Firebase/CloudFirestore/SetData';
import { toast } from 'react-toastify';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import '../App.css';
import { FaHeart } from "react-icons/fa";

const Wishlist = () => {
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedProducts = async () => {
      const userData = getUserData();
      if (!userData || !userData.uid) {
        toast.error('Please log in to view your wishlist');
        setLoading(false);
        return;
      }

      try {
        // Fetch user's liked products
        const userDoc = await getDocumentData('users', userData.uid);
        const likedProductIds = userDoc?.likedProducts || [];

        // Fetch all products
        const allProducts = await getCollectionData('products');

        // Filter products that are liked
        const likedProductsDetails = allProducts.filter(product =>
          likedProductIds.includes(product.id)
        );

        setLikedProducts(likedProductsDetails);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedProducts();
  }, []);

  const removeFromWishlist = async (productId) => {
    const userData = getUserData();
    if (!userData || !userData.uid) {
      toast.error('Please log in to update wishlist');
      return;
    }

    try {
      const updatedLikedProducts = likedProducts.filter(product => product.id !== productId).map(product => product.id);

      await updateDocument('users', userData.uid, {
        likedProducts: updatedLikedProducts
      });

      setLikedProducts(prev => prev.filter(product => product.id !== productId));
      toast.success('Product removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove product from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    const userData = getUserData();
    if (!userData || !userData.uid) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      // Get current user document to check existing cart
      const userDoc = await getDocumentData('users', userData.uid);
      const currentCart = userDoc?.carts || [];

      // Check if product is already in cart
      const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === product.id);

      let updatedCart;
      if (existingItemIndex >= 0) {
        // Increment quantity
        updatedCart = [...currentCart];
        updatedCart[existingItemIndex].quantity += 1;
        toast.success(`${product.name} quantity increased in cart!`);
      } else {
        // Add new item with only id and quantity
        updatedCart = [...currentCart, {
          id: product.id,
          quantity: 1
        }];
        toast.success(`${product.name} added to cart!`);
      }

      // Update user's cart in Firestore
      await updateDocument('users', userData.uid, {
        carts: updatedCart
      });

      // Dispatch custom event to update cart count in header
      window.dispatchEvent(new Event('cartUpdated'));

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleBuyNow = (product) => {
    toast.info(`Redirecting to buy ${product.name}`);
    // Here you can navigate to payment page
  };

  if (loading) {
    return (
      <div className="App">
        <Header />
        <div className="container mt-5 pt-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <div className="container mt-5 pt-5">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4">My Wishlist</h1>

            {likedProducts.length === 0 ? (
              <div className="text-center py-5">
                <h3>Your wishlist is empty</h3>
                <p className="text-muted">Add some products to your wishlist!</p>
                <Link to="/retail-store" className="btn btn-primary">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="row g-2">
                {likedProducts.map((product) => (
                  <div key={product.id} className="col-6 col-md-4 col-lg-3 my-3">
                    <div className="card h-100 shadow-sm">
                      <div className="position-relative">
                        <img
                          src={product.image}
                          className="card-img-top img-fluid"
                          alt={product.name}
                          style={{ height: "200px", objectFit: "contain", backgroundColor: "#f8f9fa" }}
                        />
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="btn btn-light position-absolute top-0 end-0 m-1 p-1 rounded-circle shadow-sm"
                        >
                          <FaHeart className="text-danger" size={16} />
                        </button>
                      </div>
                      <div className="card-body d-flex flex-column">
                        <Link to={`/product/${product.id}`} className="text-decoration-none">
                          <h5 className="card-title text-truncate text-dark">{product.name}</h5>
                        </Link>
                        <p className="card-text text-muted mb-2">₹{product.price}</p>
                        {/* <div className="d-flex gap-1 mt-auto">
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
                            Cart
                          </button>
                        </div> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
