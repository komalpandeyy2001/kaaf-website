import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getUserData } from '../utils/userData'
import { getDocumentData, getCollectionData } from './Firebase/CloudFirestore/GetData'
import { updateDocument } from './Firebase/CloudFirestore/SetData'
import { addDocument } from './Firebase/CloudFirestore/SetData' // Assuming addDocument exists; if not, use updateDocument or create
import { toast } from 'react-toastify'
import Header from '../../Components/Header'
import Footer from '../../Components/Footer'
import '../App.css'

const CheckoutForm = ({ cartItems, total, onSuccess }) => {
  const [processing, setProcessing] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: ''
  })

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    // Simulate dummy payment process
    setTimeout(() => {
      toast.success('Payment processed successfully (Dummy)!')
      onSuccess('dummy_payment_intent_id_' + Date.now())
      setProcessing(false)
    }, 2000) // 2 second delay to simulate processing
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          <h5>Shipping Information</h5>
          <div className="mb-3">
            <input type="text" name="name" placeholder="Full Name" className="form-control" onChange={handleInputChange} required />
          </div>
          <div className="mb-3">
            <input type="email" name="email" placeholder="Email" className="form-control" onChange={handleInputChange} required />
          </div>
          <div className="mb-3">
            <input type="text" name="address" placeholder="Address" className="form-control" onChange={handleInputChange} required />
          </div>
          <div className="mb-3">
            <input type="text" name="city" placeholder="City" className="form-control" onChange={handleInputChange} required />
          </div>
          <div className="mb-3">
            <input type="text" name="zip" placeholder="ZIP Code" className="form-control" onChange={handleInputChange} required />
          </div>
        </div>
        <div className="col-md-6">
          <h5>Payment Information (Dummy)</h5>
          <div className="mb-3">
            <input type="text" placeholder="Card Number" className="form-control" />
          </div>
          <div className="mb-3">
            <input type="text" placeholder="Expiry Date (MM/YY)" className="form-control" />
          </div>
          <div className="mb-3">
            <input type="text" placeholder="CVV" className="form-control" />
          </div>
          <button type="submit" className="btn btn-success w-100" disabled={processing}>
            {processing ? 'Processing...' : `Pay ₹${total}`}
          </button>
        </div>
      </div>
    </form>
  )
}

function CheckoutPage() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const fetchCart = async () => {
      const userData = getUserData()
      if (!userData || !userData.uid) {
        toast.error('Please log in to checkout')
        navigate('/login')
        return
      }

      try {
        const productId = searchParams.get('productId')
        const quantity = searchParams.get('quantity')

        if (productId && quantity) {
          // Buy now flow - single product
          const allProducts = await getCollectionData('products')
          const product = allProducts.find(p => p.id === productId)
          if (product) {
            setCartItems([{
              id: productId,
              quantity: parseInt(quantity),
              product: product
            }])
          } else {
            toast.error('Product not found')
            navigate('/cart')
            return
          }
        } else {
          // Full cart checkout
          const userDoc = await getDocumentData('users', userData.uid)
          const cart = userDoc?.carts || []
          const allProducts = await getCollectionData('products')
          const productMap = allProducts.reduce((map, product) => {
            map[product.id] = product
            return map
          }, {})

          const cartItemsWithDetails = cart.map(cartItem => ({
            ...cartItem,
            product: productMap[cartItem.id]
          })).filter(item => item.product)

          if (cartItemsWithDetails.length === 0) {
            toast.error('Your cart is empty')
            navigate('/cart')
            return
          }

          setCartItems(cartItemsWithDetails)
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
        toast.error('Failed to load checkout')
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [navigate, searchParams])

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0)
  }

  const handlePaymentSuccess = async (paymentIntentId) => {
    const userData = getUserData()
    try {
      // Fetch current user data to get existing orders
      const userDoc = await getDocumentData('users', userData.uid)
      const existingOrders = userDoc?.orders || []

      // Create order data
      const orderData = {
        userId: userData.uid,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        total: getTotalPrice(),
        status: 'paid',
        paymentIntentId,
        timestamp: new Date().toISOString()
      }

      // Add order to orders collection and get the order ID
      const orderId = await addDocument('orders', orderData)

      // Update the order document to include its own ID
      await updateDocument('orders', orderId, { id: orderId })

      // Add order ID to user's orders array
      await updateDocument('users', userData.uid, {
        orders: [...existingOrders, orderId]
      })

      // Clear cart only if it's a full cart checkout (not buy now)
      if (!searchParams.get('productId')) {
        await updateDocument('users', userData.uid, { carts: [] })
        window.dispatchEvent(new Event('cartUpdated'))
      }

      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order')
    }
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

  const total = getTotalPrice()

  return (
    <div className="App">
      <Header />
      <div className="container mt-5 pt-5">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4">Checkout</h1>

            <div className="row">
              <div className="col-lg-8">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Product Summary</h5>
                  </div>
                  <div className="card-body">
                    {cartItems.map((item) => (
                      <div key={item.id} className="d-flex justify-content-between mb-2">
                        <span>{item.product?.name} x{item.quantity}</span>
                        <span>₹{(item.product?.price || 0) * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h5>Checkout Details</h5>
                  </div>
                  <div className="card-body">
                    <CheckoutForm cartItems={cartItems} total={total} onSuccess={handlePaymentSuccess} />
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Payment Summary</h5>
                    <hr />
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>₹{total}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax:</span>
                      <span>₹0</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <strong>Total:</strong>
                      <strong>₹{total}</strong>
                    </div>
                    <Link to="/cart" className="btn btn-outline-primary w-100 mb-2">
                      Back to Cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CheckoutPage
