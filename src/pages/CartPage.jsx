import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserData } from '../utils/userData'
import { getDocumentData, getCollectionData } from './Firebase/CloudFirestore/GetData'
import { updateDocument } from './Firebase/CloudFirestore/SetData'
import { toast } from 'react-toastify'
import Header from '../../Components/Header'
import Footer from '../../Components/Footer'
import '../App.css'

function CartPage() {
  const [cartItems, setCartItems] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCartAndProducts = async () => {
      const userData = getUserData()
      if (!userData || !userData.uid) {
        toast.error('Please log in to view your cart')
        setLoading(false)
        return
      }

      try {
        // Fetch user's cart
        const userDoc = await getDocumentData('users', userData.uid)
        const cart = userDoc?.carts || []

        // Fetch all products
        const allProducts = await getCollectionData('products')

        // Create a map for quick product lookup
        const productMap = allProducts.reduce((map, product) => {
          map[product.id] = product
          return map
        }, {})

        // Combine cart items with product details
        const cartItemsWithDetails = cart.map(cartItem => ({
          ...cartItem,
          product: productMap[cartItem.id]
        })).filter(item => item.product) // Filter out items where product no longer exists

        setCartItems(cartItemsWithDetails)
        setProducts(allProducts)
      } catch (error) {
        console.error('Error fetching cart:', error)
        toast.error('Failed to load cart')
      } finally {
        setLoading(false)
      }
    }

    fetchCartAndProducts()
  }, [])

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return

    const userData = getUserData()
    if (!userData || !userData.uid) {
      toast.error('Please log in to update cart')
      return
    }

    try {
      const updatedCart = cartItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )

      await updateDocument('users', userData.uid, {
        carts: updatedCart.map(item => ({ id: item.id, quantity: item.quantity }))
      })

      setCartItems(updatedCart)
      window.dispatchEvent(new Event('cartUpdated'))
      toast.success('Cart updated')
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('Failed to update cart')
    }
  }

  const removeFromCart = async (productId) => {
    const userData = getUserData()
    if (!userData || !userData.uid) {
      toast.error('Please log in to update cart')
      return
    }

    try {
      const updatedCart = cartItems.filter(item => item.id !== productId)

      await updateDocument('users', userData.uid, {
        carts: updatedCart.map(item => ({ id: item.id, quantity: item.quantity }))
      })

      setCartItems(updatedCart)
      window.dispatchEvent(new Event('cartUpdated'))
      toast.success('Item removed from cart')
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

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
    )
  }

  return (
    <div className="App">
      <Header />
      <div className="container mt-5 pt-5">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4">Shopping Cart</h1>

            {cartItems.length === 0 ? (
              <div className="text-center py-5">
                <h3>Your cart is empty</h3>
                <p className="text-muted">Add some products to get started!</p>
                <Link to="/" className="btn btn-warning btn-sm flex-fill text-white">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="row">
                  <div className="col-lg-8">
                    {cartItems.map((item) => (
                      <div key={item.id} className="card mb-3">
                        <div className="card-body">
                          <div className="row align-items-center mb-3">
                            <div className="col-md-2">
                              <img
                                src={item.product?.image}
                                alt={item.product?.name}
                                className="img-fluid rounded"
                                style={{ maxHeight: '80px', objectFit: 'contain' }}
                              />
                            </div>
                            <div className="col-md-4">
                              <Link to={`/product/${item.id}`} className="text-decoration-none">
                                <h5 className="card-title text-truncate text-dark">{item.product?.name}</h5>
                              </Link>
                              <p className="text-muted mb-0">₹{item.product?.price}</p>
                            </div>
                            <div className="col-md-3">
                              <div className="d-flex align-items-center">
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="mx-3">{item.quantity}</span>
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <strong>₹{(item.product?.price || 0) * item.quantity}</strong>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Remove
                            </button>
                            <Link to={`/checkout?productId=${item.id}&quantity=${item.quantity}`} className="btn btn-custom-yellow btn-sm">
                              Buy this now
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="col-lg-4">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Order Summary</h5>
                        <hr />
                        <div className="d-flex justify-content-between mb-2">
                          <span>Total Items:</span>
                          <span>{getTotalItems()}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                          <strong>Total Price:</strong>
                          <strong>₹{getTotalPrice()}</strong>
                        </div>
                        <Link to="/checkout" className="btn btn-success w-100 mb-2">
                          Proceed to Checkout
                        </Link>
                        <Link to="/" className="btn btn-outline-primary w-100">
                          Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CartPage
