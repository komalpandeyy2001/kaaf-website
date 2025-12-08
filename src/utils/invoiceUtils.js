import html2pdf from "html2pdf.js";
import emailjs from "@emailjs/browser";

// Initialize EmailJS
emailjs.init("6I-bAuLGsKJtXz3eg");

/**
 * Download invoice as PDF
 */
export const downloadInvoice = (orderData) => {
  const invoiceElement = generateInvoiceElement(orderData);

  html2pdf()
    .set({
      margin: 10,
      filename: `invoice-${orderData.id}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(invoiceElement)
    .save();
};

export const sendInvoiceEmail = async (orderData) => {
  try {
    // Generate items HTML
    const itemsHtml = (orderData.items || []).map(
      (item) =>
        `<li>${item.name} - Qty: ${item.quantity} - Price: ₹${item.price} - Total: ₹${item.price * item.quantity}</li>`
    ).join("");

    // 1️⃣ User Email
    const userMessage = `
      <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
        <h2 style="text-align:center;">Order Placed Successfully</h2>
        <p>Hi <strong>${orderData.shippingInfo.name}</strong>,</p>
        <p>Thank you for shopping with <strong>QAAF</strong>! Your order has been placed successfully.</p>
        <div style="margin-top: 20px; padding: 15px 0; border-width:1px 0; border-style:dashed; border-color: lightgrey;">
          <p><strong>Order ID:</strong> ${orderData.id}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${orderData.total}</p>
        </div>
        <h3>Shipping Info:</h3>
        <p>
          ${orderData.shippingInfo.name}<br/>
          ${orderData.shippingInfo.email}<br/>
          ${orderData.shippingInfo.address}<br/>
          ${orderData.shippingInfo.city}, ${orderData.shippingInfo.zip}<br/>
          ${orderData.shippingInfo.phoneNumber}
        </p>
        <h3>Items Ordered:</h3>
        <ul>${itemsHtml}</ul>
        <p>Your order will be processed shortly. If you have any questions, feel free to reply to this email.</p>
        <p>Thank you,<br/><strong>QAAF Team</strong></p>
      </div>
    `;

    const userEmailParams = {
      to_email: orderData.shippingInfo.email,
      to_name: orderData.shippingInfo.name,
      subject: `Order Placed - ${orderData.id}`,
      message_html: userMessage,
      reply_to: "owner@example.com", // your store email
    };

    // 2️⃣ Owner Email
    const ownerMessage = `
      <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
        <h2>New Order Placed</h2>
        <p>User <strong>${orderData.shippingInfo.name}</strong> (${orderData.shippingInfo.email}) has placed a new order.</p>
        <div style="margin-top: 10px;">
          <p><strong>Order ID:</strong> ${orderData.id}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${orderData.total}</p>
        </div>
        <h3>Shipping Info:</h3>
        <p>
          ${orderData.shippingInfo.name}<br/>
          ${orderData.shippingInfo.email}<br/>
          ${orderData.shippingInfo.address}<br/>
          ${orderData.shippingInfo.city}, ${orderData.shippingInfo.zip}<br/>
          ${orderData.shippingInfo.phoneNumber}
        </p>
        <h3>Items Ordered:</h3>
        <ul>${itemsHtml}</ul>
      </div>
    `;

    const ownerEmailParams = {
      to_email: "zyvolt.india@gmail.com", // replace with your email
      subject: `New Order - ${orderData.id}`,
      message_html: ownerMessage,
    };

    // Send emails
    await emailjs.send("service_c9t2sli", "template_wdc42sw", userEmailParams);
    await emailjs.send("service_c9t2sli", "template_wdc42sw", ownerEmailParams);

    console.log("Order emails sent successfully");
    return true;

  } catch (error) {
    console.error("Error sending order emails:", error);
    return false;
  }
};
/**
 * Generate a DOM element for invoice
 */
const generateInvoiceElement = (orderData) => {
  const div = document.createElement("div");
  div.style.width = "700px";
  div.style.fontFamily = "Arial, sans-serif";
  div.style.padding = "20px";
  div.style.border = "1px solid #ddd";

  div.innerHTML = `
    <h1 style="text-align:center;">INVOICE</h1>
    <h3>QAAF </h3>
    <p>Email: zyvolt.india@gmail.com | Phone: +91 98XXXXXXX</p>

    <div style="margin-top:20px;">
      <strong>Order ID:</strong> ${orderData.id}<br/>
      <strong>Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}<br/>
      <strong>Status:</strong> ${orderData.status.toUpperCase()}
    </div>

    <div style="margin-top:20px;">
      <strong>Bill To:</strong><br/>
      ${orderData.shippingInfo.name}<br/>
      ${orderData.shippingInfo.email}<br/>
      ${orderData.shippingInfo.address}<br/>
      ${orderData.shippingInfo.city}, ${orderData.shippingInfo.zip}<br/>
      ${orderData.shippingInfo.phoneNumber}
    </div>

    <table style="width:100%; border-collapse: collapse; margin-top:20px;">
      <thead>
        <tr style="background-color:#333;color:#fff;">
          <th style="border:1px solid #ddd; padding:8px;">Item</th>
          <th style="border:1px solid #ddd; padding:8px;">Qty</th>
          <th style="border:1px solid #ddd; padding:8px;">Price</th>
          <th style="border:1px solid #ddd; padding:8px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${orderData.items
          .map(
            (item) => `
          <tr>
            <td style="border:1px solid #ddd; padding:8px;">${item.name}</td>
            <td style="border:1px solid #ddd; padding:8px;">${item.quantity}</td>
            <td style="border:1px solid #ddd; padding:8px;">₹${item.price}</td>
            <td style="border:1px solid #ddd; padding:8px;">₹${item.price * item.quantity}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <h3 style="text-align:right; margin-top:20px;">Total: ₹${orderData.total}</h3>

    <p>Payment Method: ${orderData.paymentMethod.toUpperCase()}</p>
    <p>Payment Status: ${orderData.status.toUpperCase()}</p>

    <p style="text-align:center; margin-top:40px;">Thank you for shopping with QAAF !</p>
  `;

  return div;
};

/**
 * Export generateInvoicePDF for backward compatibility
 */
export const generateInvoicePDF = (orderData) => {
  downloadInvoice(orderData);
};


// Send return emails
export const sendReturnEmails = async (order, returnReason, returnImageURL) => {
  try {
    // Owner notification
    const ownerEmailParams = {
      to_email: "zyvolt.india@gmail.com", // replace with your email
      subject: `Product Return Initiated - Order ${order.id}`,
      message_html: `
        <div>
          <h2>Return Initiated</h2>
          <p>User <strong>${order.shippingInfo.name}</strong> (${order.shippingInfo.email}) has initiated a return.</p>
          <p><strong>Product:</strong> ${order.name}</p>
          <p><strong>Quantity:</strong> ${order.quantity}</p>
          <p><strong>Price:</strong> ₹${order.price}</p>
          <p><strong>Reason:</strong> ${returnReason}</p>
          <p><strong>Return Image:</strong><br/><img src="${returnImageURL}" width="150" /></p>
        </div>
      `,
    };

    // User notification
    const userEmailParams = {
      to_email: order.shippingInfo.email,
      subject: `Return Initiated - Order ${order.id}`,
      message_html: `
        <div>
          <h2>Return Initiated</h2>
          <p>Hi <strong>${order.shippingInfo.name}</strong>,</p>
          <p>Your return for <strong>${order.name}</strong> has been initiated successfully.</p>
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Our team will pick up the product within 3-4 days.</li>
            <li>Once we receive the product, your refund will be credited within 5-7 working days.</li>
          </ul>
          <p>Thank you for shopping with us!</p>
        </div>
      `,
    };

    // Send emails
    await emailjs.send("service_c9t2sli", "template_wdc42sw", ownerEmailParams);
    await emailjs.send("service_c9t2sli", "template_wdc42sw", userEmailParams);

    console.log("Return emails sent successfully");
  } catch (error) {
    console.error("Failed to send return emails:", error);
  }
};

export const sendCancelEmails = async (order) => {
  try {
    // Owner email
    const ownerEmailParams = {
      to_email: "zyvolt.india@gmail.com", // replace with your email
      subject: `Order Cancelled - ${order.id}`,
      message_html: `
        <div>
          <h2>Order Cancelled</h2>
          <p>User <strong>${order.shippingInfo.name}</strong> (${order.shippingInfo.email}) has cancelled their order.</p>
          <p><strong>Product:</strong> ${order.name}</p>
          <p><strong>Quantity:</strong> ${order.quantity}</p>
          <p><strong>Price:</strong> ₹${order.price}</p>
        </div>
      `,
    };

    // User email
    const userEmailParams = {
      to_email: order.shippingInfo.email,
      subject: `Your Order Cancelled - ${order.id}`,
      message_html: `
        <div>
          <h2>Order Cancelled</h2>
          <p>Hi <strong>${order.shippingInfo.name}</strong>,</p>
          <p>Your order for <strong>${order.name}</strong> has been cancelled successfully.</p>
          <p>If you have any questions, feel free to contact us.</p>
        </div>
      `,
    };

    // Send emails
    await emailjs.send("service_c9t2sli", "template_wdc42sw", ownerEmailParams);
    await emailjs.send("service_c9t2sli", "template_wdc42sw", userEmailParams);

    console.log("Cancel emails sent successfully");
  } catch (error) {
    console.error("Failed to send cancel emails:", error);
  }
};

