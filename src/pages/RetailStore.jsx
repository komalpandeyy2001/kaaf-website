import React from 'react'

function RetailStore() {
  return (
    <div className="container mt-5">
      <h1>Retail Store</h1>
      <p>Welcome to our retail store! Here you can find tennis and pickleball equipment, apparel, and accessories.</p>
      <div className="row mt-4">
        <div className="col-md-6">
          <h3>Featured Products</h3>
          <ul>
            <li>Tennis Rackets</li>
            <li>Pickleball Paddles</li>
            <li>Athletic Wear</li>
            <li>Shoes & Accessories</li>
          </ul>
        </div>
        <div className="col-md-6">
          <h3>Store Hours</h3>
          <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
          <p>Saturday - Sunday: 10:00 AM - 6:00 PM</p>
        </div>
      </div>
    </div>
  )
}

export default RetailStore
