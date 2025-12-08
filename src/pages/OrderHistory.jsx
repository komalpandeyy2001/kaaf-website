import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserData } from '../utils/userData'
import { getCollectionData } from './Firebase/CloudFirestore/GetData'
import { updateDocument } from './Firebase/CloudFirestore/SetData'
import { toast } from 'react-toastify'
import Header from '../../Components/Header'
import Footer from '../../Components/Footer'
import '../App.css'
import { downloadInvoice, sendCancelEmails } from '../utils/invoiceUtils'
import { UploadImage } from './Firebase/CloudStorage/UploadImages'
import { Timestamp } from 'firebase/firestore'
import { sendReturnEmails } from '../utils/invoiceUtils'

function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [returnReason, setReturnReason] = useState("")
  const [returnImage, setReturnImage] = useState(null)

  // Fetch Orders
useEffect(() => {
  const fetchOrders = async () => {
    const userData = getUserData()
    if (!userData?.uid) {
      toast.error("Please log in to view orders")
      setLoading(false)
      return
    }

    try {
      const allOrders = await getCollectionData("orders")
      const userOrders = allOrders
        .filter(o => o.userId === userData.uid)
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateB - dateA
        })

      setOrders(userOrders)
    } catch (err) {
      toast.error("Failed to load orders")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  fetchOrders()
}, [])


  // Submit Return
const handleReturnSubmit = async () => {
  if (!returnReason.trim()) return toast.error("Please enter return reason");
  if (!returnImage) return toast.error("Please upload product image");

  try {
    const imageURL = await UploadImage(returnImage);

    await updateDocument("orders", selectedOrder.id, {
      deliveryStatus: "Return Initiated",
      returnInfo: {
        reason: returnReason,
        imageURL,
        date: Timestamp.fromDate(new Date())
      }
    });

    // ✅ Send emails to owner and user
    await sendReturnEmails(selectedOrder, returnReason, imageURL);

    toast.success("Return request submitted!");
    setShowReturnModal(false);

    setOrders(prev =>
      prev.map(o =>
        o.id === selectedOrder.id
          ? { ...o, deliveryStatus: "Return Initiated" }
          : o
      )
    );
  } catch (err) {
    toast.error("Failed to submit return request");
    console.error(err);
  }
};
// Cancel Order before it is processed
const handleCancelOrder = async (order) => {
  try {
    // 1️⃣ Update order status in Firestore
    await updateDocument("orders", order.id, {
      deliveryStatus: "Cancelled",
    });

    // 2️⃣ Send cancel notification emails
    await sendCancelEmails(order);

    // 3️⃣ Update local state
    setOrders(prev =>
      prev.map(o =>
        o.id === order.id
          ? { ...o, deliveryStatus: "Cancelled" }
          : o
      )
    );

    toast.success("Order cancelled successfully");
  } catch (err) {
    toast.error("Failed to cancel order");
    console.error(err);
  }
};


  // Cancel Return
  const handleCancelReturn = async (order) => {
    try {
      await updateDocument("orders", order.id, {
        deliveryStatus: "Delivered",
        returnInfo: null
      })

      toast.success("Return request cancelled")

      setOrders(prev =>
        prev.map(o =>
          o.id === order.id
            ? { ...o, deliveryStatus: "Delivered", returnInfo: null }
            : o
        )
      )
    } catch (err) {
      toast.error("Failed to cancel return")
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="App">
        <Header />
        <div className="container mt-5 pt-5 text-center">
          <div className="spinner-border" role="status"></div>
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
            orders.map(order => {
          // If Firestore timestamp, convert to JS Date
const createdDate = order.createdAt?.toDate 
  ? order.createdAt.toDate() 
  : new Date(order.createdAt)
              const today = new Date()
              const diffDays =
                (today - createdDate) / (1000 * 3600 * 24)

              return (
                <div key={order.id} className="card mb-4">
                  <div className="card-header d-flex justify-content-between order-header">
                    <span><strong>Order ID:</strong> {order.id}</span>
                    <span><strong>Date:</strong> {createdDate.toLocaleDateString()}</span>
                  </div>

                  <div className="card-body row">
                    <div className="col-md-8 d-flex">
                      <img
                        src={order.image}
                        alt={order.name}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          background: "#f5f5f5",
                          marginRight: "15px"
                        }}
                      />

                      <div>
                        <h6>{order.name}</h6>
                        <span><strong>Qty:</strong> {order.quantity}</span>

                        <p className="mt-2">
                          <strong>Shipping:</strong>
                          {" "}
                          {order.shippingInfo?.address}, {order.shippingInfo?.city}
                        </p>
                      </div>
                    </div>
<div className="col-md-4 text-md-end text-start">
  <p><strong>Status:</strong> {order.deliveryStatus}</p>
  <p><strong>Total:</strong> ₹{order.price * order.quantity}</p>

  {/* Return Button */}
  {order.deliveryStatus === "Delivered" && diffDays <= 7 && (
    <button
      className="btn btn-danger btn-sm mt-2"
      onClick={() => {
        setSelectedOrder(order)
        setShowReturnModal(true)
      }}
    >
      Return Product
    </button>
  )}

  {/* Cancel Return Button */}
  {order.deliveryStatus === "Return Initiated" && (
    <button
      className="btn btn-warning btn-sm mt-2"
      onClick={() => handleCancelReturn(order)}
    >
      Cancel Return
    </button>
  )}

  {/* Optional note if return period expired */}
  {order.deliveryStatus === "Delivered" && diffDays > 7 && (
    <p className="text-muted mt-2">Return period expired</p>
  )}

  {/* Cancel Order Button */}
  {order.deliveryStatus === "Order Placed" && (
    <button
      className="btn btn-danger btn-sm mt-2"
      onClick={() => handleCancelOrder(order)}
    >
      Cancel Order
    </button>
  )}

  {/* Cancelled message */}
  {order.deliveryStatus === "Cancelled" && (
    <p className="text-danger mt-2"><strong>Your order has been cancelled by you.</strong></p>
  )}

  {/* Download Invoice - only if NOT cancelled */}
  {order.deliveryStatus !== "Cancelled" && (
    <button
      className="btn btn-primary btn-sm mt-2 ms-2"
      onClick={() => downloadInvoice({
        ...order,
        items: [{
          name: order.name,
          quantity: order.quantity,
          price: order.price
        }]
      })}
    >
      Download Invoice
    </button>
  )}
</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <Footer />

      {/* RETURN MODAL */}
      {showReturnModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-custom">
            <h5>Return Product</h5>

            <label className="form-label mt-3">Reason for Return</label>
            <textarea
              className="form-control"
              rows="3"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            />

            <label className="form-label mt-3">Upload Product Image</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setReturnImage(e.target.files[0])}
            />

            <div className="mt-4 d-flex justify-content-between">
              <button className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>
                Cancel
              </button>

              <button className="btn btn-danger" onClick={handleReturnSubmit}>
                Submit Return
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-backdrop-custom {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .modal-custom {
          background: white;
          padding: 20px;
          width: 400px;
          border-radius: 10px;
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default OrderHistory
