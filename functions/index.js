// Load environment variables
require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const cors = require("cors")({ origin: true });

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get Razorpay keys from environment variables
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  throw new Error("Razorpay keys are not set in environment variables!");
}

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

// Create Razorpay order
exports.createRazorpayOrder = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).send({ error: "Only POST requests are allowed" });
        }

        const { amount, currency, receipt, notes } = req.body;

        if (!amount || !currency) {
          return res.status(400).send({ error: "Amount and currency are required" });
        }

        const order = await razorpay.orders.create({
          amount: amount * 100, // convert to smallest currency unit
          currency,
          receipt,
          payment_capture: 1,
          notes: notes || {},
        });

        res.status(200).send({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: razorpay.key_id,
          notes: order.notes,
        });
      } catch (err) {
        console.error("Razorpay order creation error:", err);
        res.status(500).send({ error: err.message });
      }
    });
  });
