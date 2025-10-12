import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { getCollectionData } from './Firebase/CloudFirestore/GetData';
import Footer from '../../Components/Footer';
import Header from '../../Components/Header';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getOrders = async () => {
        try {
            setLoading(true);
            const data = await getCollectionData('orders');
            console.log(orders);
            setOrders(data);
            setError(null);
            console.log(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getOrders();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'text-success';
            case 'pending':
                return 'text-warning';
            case 'cancelled':
                return 'text-danger';
            default:
                return 'text-secondary';
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="container mt-5">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading orders...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="container mt-5">
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                    <button onClick={getOrders} className="btn btn-primary">
                        Retry
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            
            <div className="container-fluid mt-5">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h1 className="h2">Orders Management</h1>
                            <Link to="/orders/new" className="btn btn-primary">
                                Create New Order
                            </Link>
                        </div>

{orders.length === 0 ? (
    <div className="text-center py-5">
        <h3>No orders found</h3>
        <p className="text-muted">There are no orders in the system yet.</p>
    </div>
) : (
    <div className="table-responsive">
        <table className="table table-hover">
            <thead className="table-light">
                <tr>
                    <th>Document ID</th>
                    <th>Order ID</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => (
                    <tr key={order.id}>
                        <td>
                            <Link to={`/orders/${order.id}`} className="text-decoration-none">
                                {order.id.substring(0, 8)}...
                            </Link>
                        </td>
                        <td>{order.orderId || 'N/A'}</td>
                        <td>{order.productName || 'N/A'}</td>
                        <td>{order.quantity || 0}</td>
                        <td>{formatDate(order.date)}</td>
                        <td>
                            <div className="btn-group" role="group">
                                <Link 
                                    to={`/orders/${order.id}`} 
                                    className="btn btn-sm btn-outline-primary"
                                    title="View Details"
                                >
                                    <FaEye />
                                </Link>
                                <Link 
                                    to={`/orders/${order.id}/edit`} 
                                    className="btn btn-sm btn-outline-secondary"
                                    title="Edit"
                                >
                                    <FaEdit />
                                </Link>
                                <button 
                                    className="btn btn-sm btn-outline-danger"
                                    title="Delete"
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this order?')) {
                                            // Handle delete logic here
                                        }
                                    }}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default Orders;
