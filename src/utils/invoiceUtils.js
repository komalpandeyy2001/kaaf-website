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
    // Ensure orderData.items exists
    const itemsHtml = (orderData.items || []).map(
      (item) =>
        `<li>${item.name} - Qty: ${item.quantity} - Price: ₹${item.price} - Total: ₹${
          item.price * item.quantity
        }</li>`
    ).join("");

    const message = `
      <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
        <h2 style="text-align:center;">Order Invoice</h2>
        <p>Hi <strong>${orderData.shippingInfo.name}</strong>,</p>
        <p>Thank you for shopping with <strong>QAAF</strong>!</p>
        <div style="margin-top: 20px; padding: 15px 0; border-width:1px 0; border-style:dashed; border-color: lightgrey;">
          <p><strong>Order ID:</strong> ${orderData.id}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.timestamp).toLocaleDateString()}</p>
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
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Thank you,<br/><strong>QAAF Team</strong></p>
      </div>
    `;

    const templateParams = {
      to_email: orderData.shippingInfo.email,
      to_name: orderData.shippingInfo.name,
      subject: `Order Invoice - ${orderData.id}`,
      message_html: message,
      reply_to: orderData.shippingInfo.email,
    };

    const result = await emailjs.send(
      "service_c9t2sli",
      "template_wdc42sw",
      templateParams
    );

    console.log("Email sent successfully:", result);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
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
      <strong>Date:</strong> ${new Date(orderData.timestamp).toLocaleDateString()}<br/>
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
