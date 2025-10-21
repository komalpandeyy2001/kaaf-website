import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserData } from '../utils/userData'
import { getCollectionData } from './Firebase/CloudFirestore/GetData'
import { toast } from 'react-toastify'
import Header from '../../Components/Header'
import Footer from '../../Components/Footer'
import '../App.css'

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
        const userOrders = allOrders.filter(order => order.userId === userData.uid)
        setOrders(userOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
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
            <h1 className="mb-4">Order History</h1>

            {orders.length === 0 ? (
              <div className="text-center py-5">
                <h3>No orders yet</h3>
                <p className="text-muted">Start shopping to see your orders here!</p>
                <Link to="/" className="btn btn-warning btn-sm flex-fill text-white">
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="card mb-4">
                  <div className="card-header">
                    <div className="d-flex justify-content-between">
                      <span><strong>Order ID:</strong> {order.id}</span>
                      <span><strong>Date:</strong> {new Date(order.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-8">
                        <h6>Items:</h6>
                        {order.items.map((item, index) => (
                          <div key={index} className="d-flex justify-content-between mb-1">
                            <span>{item.name} x{item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="col-md-4">
                        <div className="text-end">
                          <p><strong>Status:</strong> {order.status}</p>
                          <p><strong>Total:</strong> ₹{order.total}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default OrderHistory
