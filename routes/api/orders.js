const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

const express = require("express");
const router = express.Router();

const { client } = require("../../config/paypal");

function buildRequestBody($amount = {}) {
  return {
    intent: "CAPTURE",
    application_context: {
      return_url: "https://example.com/return",
      cancel_url: "https://example.com/cancel",
    },
    purchase_units: [{ amount: $amount }],
  };
}

router.post("/create-paypal-transaction", async (req, res) => {
  const totalAmount = req.body.total_amount;

  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.headers["prefer"] = "return=representation";

  request.body = buildRequestBody({
    currency_code: "USD",
    value: totalAmount,
  });

  try {
    const response = await client().execute(request);

    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/capture-order", async (req, res) => {
  const orderId = req.body.paypal_order_id;
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  try {
    const response = await client().execute(request);

    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
