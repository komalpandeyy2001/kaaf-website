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
import { sendInvoiceEmail } from '../utils/invoiceUtils'

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
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
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
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const fetchCartAndAddresses = async () => {
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

            // Fetch addresses and lastShippingInfo for direct checkout
            const userDoc = await getDocumentData('users', userData.uid)
            const addresses = userDoc?.addresses || []
            const lastShippingInfo = userDoc?.lastShippingInfo || ""
            setSavedAddresses(addresses)

            if (addresses.length > 0) {
              // Auto-select matching saved address if it exists
              if (lastShippingInfo) {
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
                  setShippingInfo(matchingAddress)
                }
              }
            } else {
              // No saved addresses, show add form with lastShippingInfo if available
              setShowAddAddressForm(true)
              if (lastShippingInfo) {
                setNewAddress(lastShippingInfo)
              }
            }
          } else {
            toast.error('Product not found')
            navigate('/cart')
            return
          }
        } else {
          const userDoc = await getDocumentData('users', userData.uid)
          const cart = userDoc?.carts || []
          const addresses = userDoc?.addresses || []
          const lastShippingInfo = userDoc?.lastShippingInfo || ""
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
          setSavedAddresses(addresses)

          if (addresses.length > 0) {
            // Auto-select last used address if it exists
            if (lastShippingInfo) {
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
                setShippingInfo(matchingAddress)
              }
            }
          } else {
            // No saved addresses, show add form
            setShowAddAddressForm(true)
            if (lastShippingInfo) {
              setNewAddress(lastShippingInfo)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
        toast.error('Failed to load checkout')
      } finally {
        setLoading(false)
      }
    }

    fetchCartAndAddresses()
  }, [navigate, searchParams])

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0)
  }

  const isShippingInfoComplete = () => {
    return shippingInfo.name.trim() &&
      shippingInfo.email.trim() &&
      shippingInfo.address.trim() &&
      shippingInfo.city.trim() &&
      shippingInfo.zip.trim() &&
      shippingInfo.phoneNumber.trim()
  }

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
  }

  const handleNewAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value })
  }

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId)
    if (addressId) {
      const selectedAddress = savedAddresses.find(addr => addr.id === addressId)
      if (selectedAddress) {
        setShippingInfo(selectedAddress)
      }
    } else {
      setShippingInfo({
        name: '',
        email: '',
        address: '',
        city: '',
        zip: '',
        phoneNumber: ''
      })
    }
  }

  const handleAddAddress = async () => {
    const userData = getUserData()
    if (!userData || !userData.uid) {
      toast.error('Please log in to add address')
      return
    }

    try {
      const newAddressWithId = {
        ...newAddress,
        id: Date.now().toString()
      }
      const updatedAddresses = [...savedAddresses, newAddressWithId]
      await updateDocument('users', userData.uid, { addresses: updatedAddresses })
      setSavedAddresses(updatedAddresses)
      setNewAddress({
        name: '',
        email: '',
        address: '',
        city: '',
        zip: '',
        phoneNumber: ''
      })
      setShowAddAddressForm(false)
      toast.success('Address added successfully')
    } catch (error) {
      console.error('Error adding address:', error)
      toast.error('Failed to add address')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    const userData = getUserData()
    if (!userData || !userData.uid) {
      toast.error('Please log in to delete address')
      return
    }

    try {
      const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId)
      await updateDocument('users', userData.uid, { addresses: updatedAddresses })
      setSavedAddresses(updatedAddresses)
      if (selectedAddressId === addressId) {
        setSelectedAddressId('')
        setShippingInfo({
          name: '',
          email: '',
          address: '',
          city: '',
          zip: '',
          phoneNumber: ''
        })
      }
      toast.success('Address deleted successfully')
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address')
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)

    if (paymentMethod === 'cod') {
      await handlePaymentSuccess(null)
      setProcessing(false)
      return
    }

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

      const orderIds = []

      // Loop through each cart item and create a separate order + payment document
      for (const item of cartItems) {
        const orderData = {
          deliveryStatus:"Order Placed",
              createdAt: new Date(),
          userId: userData.uid,
          itemId: item.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          vendorId: item.product.vendorId,
          total: item.product.price * item.quantity,
          status: paymentMethod === 'cod' ? 'pending' : 'paid',
          paymentId: paymentId || "",
          paymentMethod: paymentMethod,
          shippingInfo: shippingInfo,
          // timestamp: new Date().toISOString()
        }

        // Create separate order document
        const orderDocRef = await addDocument('orders', orderData)
        const orderId = orderDocRef.id
        await updateDocument('orders', orderId, { id: orderId })
        orderIds.push(orderId)

        // Create separate payment document for each product
        const paymentData = {
              createdAt: new Date(),
          userId: userData.uid,
          vendorId: item.product.vendorId,
          orderId: orderId,
          paymentMethod: paymentMethod,
          status: paymentMethod === 'cod' ? 'pending' : 'paid',
          paymentId: paymentId || "",
          amount: item.product.price * item.quantity,
          // timestamp: new Date().toISOString()
        }
        await addDocument('payments', paymentData)

        // Increment product ordered quantities
        await incrementNumber('products', item.id, 'orderedQty', item.quantity)

        // Send invoice email for each product order
        await sendInvoiceEmail({
          ...orderData,
          id: orderId,
          items: [{ name: item.product.name, quantity: item.quantity, price: item.product.price }]
        });
      }

      // Update user's orders and last shipping info
      await updateDocument('users', userData.uid, {
        orders: [...existingOrders, ...orderIds],
        lastShippingInfo: shippingInfo,
        carts: [] // clear cart
      })
      window.dispatchEvent(new Event('cartUpdated'))

      toast.success('Orders placed successfully!')
      navigate('/orders')
    } catch (error) {
      console.error('Error creating orders:', error)
      toast.error('Failed to create orders')
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
              <div className="card-header"><h5>Shipping Address</h5></div>
              <div className="card-body">
                {savedAddresses.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Select Saved Address</label>
                    <div className="mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="addressSelection"
                          id="newAddress"
                          value=""
                          checked={selectedAddressId === ''}
                          onChange={() => handleSelectAddress('')}
                        />
                        <label className="form-check-label" htmlFor="newAddress">
                          Enter New Address
                        </label>
                      </div>
                      {savedAddresses.map((addr) => (
                        <div key={addr.id} className="form-check d-flex align-items-start">
                          <input
                            className="form-check-input mt-1"
                            type="radio"
                            name="addressSelection"
                            id={`address-${addr.id}`}
                            value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={() => handleSelectAddress(addr.id)}
                          />
                          <label className="form-check-label ms-2" htmlFor={`address-${addr.id}`}>
                            <div>
                              <strong>{addr.name}</strong><br />
                              {addr.address}, {addr.city}, {addr.zip}<br />
                              {addr.phoneNumber} | {addr.email}
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={() => handleDeleteAddress(addr.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>


                  </div>
                )}

                {!showAddAddressForm && (
                  <div className="mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setShowAddAddressForm(true)}
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {showAddAddressForm && (
                  <div className="mb-3 border p-3 rounded">
                    <h6>Add New Address</h6>
                    <input type="text" name="name" placeholder="Full Name" className="form-control mb-2" onChange={handleNewAddressChange} value={newAddress.name} required />
                    <input type="email" name="email" placeholder="Email" className="form-control mb-2" onChange={handleNewAddressChange} value={newAddress.email} required />
                    <input type="text" name="phoneNumber" placeholder="Phone Number" className="form-control mb-2" onChange={handleNewAddressChange} value={newAddress.phoneNumber} required />
                    <input type="text" name="address" placeholder="Address" className="form-control mb-2" onChange={handleNewAddressChange} value={newAddress.address} required />
                    <input type="text" name="city" placeholder="City" className="form-control mb-2" onChange={handleNewAddressChange} value={newAddress.city} required />
                    <input type="text" name="zip" placeholder="ZIP Code" className="form-control mb-2" onChange={handleNewAddressChange} value={newAddress.zip} required />
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-success btn-sm" onClick={handleAddAddress}>Save Address</button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddAddressForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}

                {selectedAddressId && (
                  <div className="mb-3 p-3 border border-primary rounded bg-light">
                    <h6 className="text-primary mb-2">Selected Shipping Address</h6>
                    {(() => {
                      const selectedAddr = savedAddresses.find(addr => addr.id === selectedAddressId)
                      return selectedAddr ? (
                        <div>
                          <strong>{selectedAddr.name}</strong><br />
                          {selectedAddr.address}, {selectedAddr.city}, {selectedAddr.zip}<br />
                          {selectedAddr.phoneNumber} | {selectedAddr.email}
                        </div>
                      ) : null
                    })()}
                  </div>
                )}

                <form onSubmit={handlePayment}>
                  <div className="mb-3">
                    <label className="form-label">Payment Method</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="razorpay"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="razorpay">
                        Online Payment (Razorpay)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="cod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="cod">
                        Cash on Delivery (COD)
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success w-100" disabled={processing || !isShippingInfoComplete()}>
                    {processing ? 'Processing...' : paymentMethod === 'cod' ? `Place Order ₹${total}` : `Pay ₹${total}`}
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
