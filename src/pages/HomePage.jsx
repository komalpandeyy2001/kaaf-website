import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from './Firebase/firebase'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import './homepage.css'

import { toast } from 'react-toastify';

import Footer from '../../Components/Footer';
import Header from '../../Components/Header';
import { getCollectionData, getDocumentData } from './Firebase/CloudFirestore/GetData'
import { updateDocument } from './Firebase/CloudFirestore/SetData'

import { FaHeart, FaRegHeart } from "react-icons/fa";
import { getUserData } from '../utils/userData'



function HomePage() {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [likedProducts, setLikedProducts] = useState(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const itemsPerPage = 4 // Change to 10 when more products are available
    const navigate = useNavigate();

    // Get In Touch form state

useEffect(() => {
    const fetchProducts = async () => {
        try {
            const fetchedProducts = await getCollectionData('products');

            // Sort products by createdAt (latest first)
            const sortedProducts = fetchedProducts.sort((a, b) => {
                const timeA = a.createdAt?.seconds || a.createdAt || 0;
                const timeB = b.createdAt?.seconds || b.createdAt || 0;
                return timeB - timeA; // descending order
            });

            setProducts(sortedProducts);
            setFilteredProducts(sortedProducts);
            setCurrentPage(1); // Reset to first page when products change
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
            setFilteredProducts([]);
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

    fetchProducts();
    fetchUserLikes();
}, []);

useEffect(() => {
    if (searchQuery.trim() === '') {
        setFilteredProducts(products);
    } else {
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredProducts(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
}, [searchQuery, products]);


    const handleLike = async (productId) => {
        const userData = getUserData();
        if (!userData || !userData.uid) {
            toast.error('Please log in to like products');
            return;
        }

        const isLiked = likedProducts.has(productId);
        const newLikedProducts = new Set(likedProducts);

        if (isLiked) {
            newLikedProducts.delete(productId);
        } else {
            newLikedProducts.add(productId);
        }

        setLikedProducts(newLikedProducts);

        try {
            // Update the user's likedProducts in Firestore
            await updateDocument('users', userData.uid, {
                likedProducts: Array.from(newLikedProducts)
            });
            // Show toast notification for like/unlike
            if (!isLiked) {
                toast.success('Product added to wishlist!');
            } else {
                toast.info('Product removed from wishlist');
            }
        } catch (error) {
            console.error('Error updating liked products:', error);
            toast.error('Failed to update likes');
            // Revert the local state on error
            setLikedProducts(likedProducts);
        }
    }

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
    }

    const handleBuyNow = (product) => {
        toast.info(`Redirecting to buy ${product.name}`)
        // Here you can navigate to payment page
    }

    // Pagination logic
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="App">
            {/* Header */}
            <Header />
            <div className='mt-5 '></div>

  {/* Products Section */}
{/* Products Section */}
<section className="py-5 bg-light">
  <div className="px-3 px-md-5">
    <h2 className="text-center mb-4">Our Products</h2>

    {/* Search Bar */}
    <div className="row justify-content-center mb-4">
      <div className="col-md-6">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

        </div>
      </div>
    </div>
    <div className="row g-2">
      {currentProducts.map((product) => (
        <div key={product.id} className="col-6 col-md-4 col-lg-3">
          <div className="card h-100 shadow-sm">
            <div className="position-relative">
              <img
                src={product.image}
                className="card-img-top img-fluid"
                alt={product.name}
                style={{ height: "200px", objectFit: "contain", backgroundColor: "#f8f9fa" }}
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
                          <h5 className="card-title text-truncate text-dark">{product.name}</h5>
                        </Link>
                        <p className="card-text text-muted mb-2">₹{product.price}</p>
                        <div className="d-flex gap-1 mt-auto">
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
                        </div>
                      </div>
          </div>
        </div>
      ))}
    </div>

    {/* Pagination Controls */}
    {totalPages > 1 && (
      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-outline-primary me-2"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="align-self-center mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-outline-primary ms-2"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    )}
  </div>
</section>



            <Footer />
        </div>
    )
}

export default HomePage
