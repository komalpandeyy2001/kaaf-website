import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserData } from '../utils/userData'
import { getCollectionData } from './Firebase/CloudFirestore/GetData'
import { toast } from 'react-toastify'
import Header from '../../Components/Header'
import Footer from '../../Components/Footer'
import '../App.css'
import { downloadInvoice } from '../utils/invoiceUtils'

function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const userData = getUserData()
      if (!userData || !userData.uid) {
        toast.error('Please log in to view orders')
        setLoading(false)
        return
      }

      try {
        const allOrders = await getCollectionData('orders')
        const userOrders = allOrders
          .filter(order => order.userId === userData.uid)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        setOrders(userOrders)
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

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

  return (
    <div className="App">
      <Header />
      <div className="main-content-wrapper">
<div className='p-4'>
          <h1 className="mb-4">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-5">
            <h3>No orders yet</h3>
            <p className="text-muted">Start shopping to see your orders here!</p>
            <Link to="/" className="btn btn-warning btn-sm text-white">
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="card mb-4">
              <div className="card-header d-flex justify-content-between">
                <span><strong>Order ID:</strong> {order.id}</span>
                <span><strong>Date:</strong> {new Date(order.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="card-body row">
                <div className="col-md-8">
                  <h6>Item:</h6>
                  <div className="d-flex justify-content-between mb-1">
                    <span>{order.name}</span>
                    <span>Qty: {order.quantity}</span>
                    <span>₹{order.price * order.quantity}</span>
                  </div>
                  {/* <p className="mt-2"><strong>Vendor ID:</strong> {order.vendorId}</p> */}
                  <p><strong>Shipping:</strong> {order.shippingInfo?.address}, {order.shippingInfo?.city}</p>
                </div>
                <div className="col-md-4 text-end">
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Total:</strong> ₹{order.price * order.quantity}</p>
                  <button
                    className="btn btn-primary btn-sm mt-2"
                    onClick={() => downloadInvoice({
                      ...order,
                      items: [{ name: order.name, quantity: order.quantity, price: order.price }]
                    })}
                  >
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
</div>
      </div>
      <Footer />
    </div>
  )
}

export default OrderHistory
