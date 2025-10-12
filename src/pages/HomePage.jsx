import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from './Firebase/firebase'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import './homepage.css'

import { toast } from 'react-toastify';

import Footer from '../../Components/Footer';
import Header from '../../Components/Header';
import { getCollectionData } from './Firebase/CloudFirestore/GetData'
import { FaHeart, FaRegHeart } from "react-icons/fa";



function HomePage() {
    const [products, setProducts] = useState([])
    const [likedProducts, setLikedProducts] = useState(new Set())
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
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts(dummyProducts);
        }
    };

    fetchProducts();
}, []);


    const handleLike = (productId) => {
        setLikedProducts(prev => {
            const newSet = new Set(prev)
            if (newSet.has(productId)) {
                newSet.delete(productId)
            } else {
                newSet.add(productId)
            }
            return newSet
        })
    }

    const handleAddToCart = (product) => {
        toast.success(`${product.name} added to cart!`)
        // Here you can implement actual cart logic
    }

    const handleBuyNow = (product) => {
        toast.info(`Redirecting to buy ${product.name}`)
        // Here you can navigate to payment page
    }


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
    <div className="row g-2">
      {products.map((product) => (
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
              <h5 className="card-title text-truncate ">{product.name}</h5>
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
                  Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>



            <Footer />
        </div>
    )
}

export default HomePage
