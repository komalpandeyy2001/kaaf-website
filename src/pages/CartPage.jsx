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
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [showAddAddressForm, setShowAddAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    phoneNumber: ''
  })

  useEffect(() => {
    const fetchCartAndProducts = async () => {
      const userData = getUserData()
      if (!userData || !userData.uid) {
        toast.error('Please log in to view your cart')
        setLoading(false)
        return
      }

      try {
        // Fetch user's cart and addresses
        const userDoc = await getDocumentData('users', userData.uid)
        const cart = userDoc?.carts || []
        const addresses = userDoc?.addresses || []
        const lastShippingInfo = userDoc?.lastShippingInfo || null

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
        setSavedAddresses(addresses)

        // Auto-select last used address if it exists
        if (lastShippingInfo && addresses.length > 0) {
          const matchingAddress = addresses.find(addr =>
            addr.name === lastShippingInfo.name &&
            addr.email === lastShippingInfo.email &&
            addr.address === lastShippingInfo.address &&
            addr.city === lastShippingInfo.city &&
            addr.zip === lastShippingInfo.zip &&
            addr.phoneNumber === lastShippingInfo.phoneNumber
          )
          if (matchingAddress) {
            setSelectedAddressId(matchingAddress.id)
          }
        }
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
  <div className="main-content-wrapper">
          <div className="container  pt-3">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
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
    <div className="main-content-wrapper">
        <div className="container  pt-3">
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
  {/* Cart Items */}
  <div className="col-lg-8">
    {cartItems.length === 0 ? (
      <div className="text-center py-5">
        <h4>Your cart is empty 🛒</h4>
        <Link to="/" className="btn btn-primary mt-3">
          Continue Shopping
        </Link>
      </div>
    ) : (
      cartItems.map((item) => (
        <div key={item.id} className="card mb-3 shadow-sm border-0">
          <div className="card-body">
            <div className="row align-items-center">
              {/* Product Image */}
              <div className="col-md-2 text-center">
                <img
                  src={item.product?.image}
                  alt={item.product?.name}
                  className="img-fluid rounded"
                  style={{ maxHeight: "80px", objectFit: "contain" }}
                />
              </div>

              {/* Product Details */}
              <div className="col-md-4">
                <Link
                  to={`/product/${item.id}`}
                  className="text-decoration-none"
                >
                  <h5 className="card-title text-dark mb-1 text-truncate mt-3">
                    {item.product?.name}
                  </h5>
                </Link>
                <p className="text-muted small mb-0">
                  Price: <strong>₹{item.product?.price}</strong>
                </p>
                   <p className="text-muted small mb-0">
                  Qty: <strong>{item.quantity}</strong>
                </p>
              </div>

              {/* Quantity Controls */}
              {/* <div className="col-md-3 text-center">
                <div className="d-inline-flex align-items-center border rounded px-2">
                  <button
                    className="btn btn-sm btn-light"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="mx-2 fw-bold">{item.quantity}</span>
                  <button
                    className="btn btn-sm btn-light"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={
                      item.quantity >=
                      (item.product.stockQty - item.product.orderedQty)
                    }
                  >
                    +
                  </button>
                </div>
              </div> */}

              {/* Total Price */}
              <div className="col-md-3 text-end">
                <h5 className="text-success mb-0">
                  ₹{(item.product?.price || 0) * item.quantity}
                </h5>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
              {item.product.orderedQty >= item.product.stockQty ? (
                <span className="text-danger fw-bold">Out of Stock</span>
              ) : (
                <Link
                  to={`/checkout?productId=${item.id}&quantity=${item.quantity}`}
                  className="btn btn-warning btn-sm"
                >
                  Buy this now
                </Link>
              )}
            </div>
          </div>
        </div>
      ))
    )}
  </div>

  {/* Order Summary */}
  <div className="col-lg-4">
    <div className="card shadow-sm border-0 sticky-top" style={{ top: "100px" }}>
      <div className="card-body">
        <h5 className="card-title fw-bold mb-3">Order Summary</h5>
        <hr />
        <div className="d-flex justify-content-between mb-2">
          <span>Total Items:</span>
          <span>{getTotalItems()}</span>
        </div>
        <div className="d-flex justify-content-between mb-3">
          <strong>Total Price:</strong>
          <strong>₹{getTotalPrice()}</strong>
        </div>

        {savedAddresses.length > 0 && selectedAddressId && (
          <div className="mb-3">
            <small className="text-muted">Shipping to:</small>
            <div className="border rounded p-2 bg-light">
              {(() => {
                const selectedAddr = savedAddresses.find(addr => addr.id === selectedAddressId)
                return selectedAddr ? (
                  <div>
                    <strong>{selectedAddr.name}</strong><br />
                    {selectedAddr.address}, {selectedAddr.city}, {selectedAddr.zip}<br />
                    {selectedAddr.phoneNumber}
                  </div>
                ) : null
              })()}
            </div>
          </div>
        )}

        {cartItems.some(
          (item) => item.product.orderedQty >= item.product.stockQty
        ) ? (
          <button className="btn btn-danger w-100 mb-2" disabled>
            Some items out of stock
          </button>
        ) : (
          <Link to="/checkout" className="btn btn-success w-100 mb-2">
            Proceed to Checkout
          </Link>
        )}
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
    </div>
      <Footer />
    </div>
  )
}

export default CartPage
