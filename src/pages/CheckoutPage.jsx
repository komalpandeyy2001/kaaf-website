import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getUserData } from '../utils/userData'
import { getDocumentData, getCollectionData } from './Firebase/CloudFirestore/GetData'
import { updateDocument, addDocument } from './Firebase/CloudFirestore/SetData'
import { incrementNumber } from './Firebase/CloudFirestore/UpdateData'
import { toast } from 'react-toastify'
import Header from '../../Components/Header'
import Footer from '../../Components/Footer'
import '../App.css'

function CheckoutPage() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    phoneNumber: ''
  })
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

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const response = await fetch(
        'https://us-central1-kaaf-3f07d.cloudfunctions.net/createRazorpayOrder',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: getTotalPrice(),
            currency: 'INR',
            receipt: 'receipt_' + Date.now(),
            notes: { ...shippingInfo }
          })
        }
      )

      const data = await response.json()

      if (response.status !== 200) {
        throw new Error(data.error || 'Failed to create Razorpay order')
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Your Company Name',
        description: 'Order Payment',
        order_id: data.orderId,
        handler: function (res) {
          handlePaymentSuccess(res.razorpay_payment_id)
        },
        prefill: {
          name: shippingInfo.name,
          email: shippingInfo.email,
          contact: shippingInfo.phoneNumber
        },
        theme: {
          color: '#3399cc'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error('Razorpay error:', err)
      toast.error(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentSuccess = async (paymentId) => {
    const userData = getUserData()
    try {
      const userDoc = await getDocumentData('users', userData.uid)
      const existingOrders = userDoc?.orders || []

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
        paymentIntentId: paymentId,
        timestamp: new Date().toISOString()
      }

      const orderDocRef = await addDocument('orders', orderData)
      const orderId = orderDocRef.id
      await updateDocument('orders', orderId, { id: orderId })

      await updateDocument('users', userData.uid, {
        orders: [...existingOrders, orderId]
      })

      if (!searchParams.get('productId')) {
        await updateDocument('users', userData.uid, { carts: [] })
        window.dispatchEvent(new Event('cartUpdated'))
      }

      const updatePromises = cartItems.map(item =>
        incrementNumber('products', item.id, 'orderedQty', item.quantity)
      )
      await Promise.all(updatePromises)

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
        <div className="container mt-5 pt-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
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
      <div className="container my-5 pt-5">
        <h1 className="mb-4">Checkout</h1>
        <div className="row">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-header"><h5>Product Summary</h5></div>
              <div className="card-body">
                {cartItems.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between mb-2">
                    <span>{item.product?.name} x{item.quantity}</span>
                    <span>QTY:{item.quantity}</span>
                    <span>₹{(item.product?.price || 0) * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h5>Checkout Details</h5></div>
              <div className="card-body">
                <form onSubmit={handlePayment}>
                  <input type="text" name="name" placeholder="Full Name" className="form-control mb-2" onChange={handleInputChange} required />
                  <input type="email" name="email" placeholder="Email" className="form-control mb-2" onChange={handleInputChange} required />
                  <input type="text" name="phoneNumber" placeholder="Phone Number" className="form-control mb-2" onChange={handleInputChange} required />
                  <input type="text" name="address" placeholder="Address" className="form-control mb-2" onChange={handleInputChange} required />
                  <input type="text" name="city" placeholder="City" className="form-control mb-2" onChange={handleInputChange} required />
                  <input type="text" name="zip" placeholder="ZIP Code" className="form-control mb-2" onChange={handleInputChange} required />
                  <button type="submit" className="btn btn-success w-100" disabled={processing}>
                    {processing ? 'Processing...' : `Pay ₹${total}`}
                  </button>
                </form>
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
      <Footer />
    </div>
  )
}

export default CheckoutPage
