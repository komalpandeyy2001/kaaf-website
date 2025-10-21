# TODO: Implement Full Purchase Flow

## Tasks
- [x] Create src/pages/CheckoutPage.jsx: Product summary, payment summary, checkout details form, Stripe integration for dummy payment, order creation on success.
- [x] Create src/pages/OrderHistory.jsx: Fetch and display user's orders from Firestore.
- [x] Update src/services/stripeService.js: Add functions for product payment intent creation and confirmation.
- [x] Update src/pages/CartPage.jsx: Link "Proceed to Checkout" button to /checkout.
- [x] Update src/App.jsx: Add imports and routes for CheckoutPage and OrderHistory.

## Followup Steps
- [ ] Test the flow: Run dev server, add items to cart, proceed to checkout, complete dummy payment, verify order in history.
- [ ] Test "Buy Now" flow: Click "Buy this now" on individual products, verify only that product is checked out, cart remains intact.
- [ ] Verify Firestore: Check 'orders' collection for new docs with order IDs, user's 'orders' array updated, cart cleared only on full checkout in 'users'.
- [ ] Edge cases: Handle empty cart, unauthenticated users, payment failures, invalid product IDs.
- [ ] Note: Payment is now dummy (no Stripe/Razorpay integration yet), ready for future implementation.
