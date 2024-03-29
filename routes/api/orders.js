const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const express = require("express");
const passport = require("passport");

const Order = require("../../models/Order");
const { isAdmin } = require("../../middlewares/role");
const { isCustomer } = require("../../middlewares/role");
const router = express.Router();

const { client } = require("../../config/paypal");
const { sendOrderConfirmationEmail } = require("../../services/sendEmail");

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

router.post(
  "/create-paypal-transaction",
  passport.authenticate("jwt", { session: false }),
  isCustomer(),
  async (req, res) => {
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
  }
);

router.post(
  "/capture-order",
  passport.authenticate("jwt", { session: false }),
  isCustomer(),
  async (req, res) => {
    const user = req.user;
    const body = req.body;
    const orderData = body.order;
    const paypalOrderId = body.paypal_order_id;
    try {
      let response = { success: true, message: "Order created successfully" };

      const order = new Order({
        items: orderData.items.map(({ quantity, total_amount, _id }) => ({
          product: _id,
          quantity,
          total_amount,
        })),
        total_amount: orderData.total_amount,
        user: user.id,
        paypal_order_id: paypalOrderId,
        status: "pending",
      });
      await order.save();
      if (paypalOrderId) {
        const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(
          paypalOrderId
        );
        request.requestBody({});
        response = await client().execute(request);
      }
      const newOrder = await Order.findById(order._id)
        .populate("items.product")
        .populate("user")
        .lean();
      newOrder.items = newOrder.items.map((item) => {
        const filename = item.product.images[0].filename;

        return {
          ...item,
          imageUrl: `${req.protocol}://${req.get("host")}/static/${filename}`,
        };
      });

      sendOrderConfirmationEmail(user.email, newOrder.items, {
        logo_link: `${req.protocol}://${req.get("host")}/assets/logo.png`,
        facebook_link: `${req.protocol}://${req.get(
          "host"
        )}/assets/facebook.png`,
        instagram_link: `${req.protocol}://${req.get("host")}/assets/insta.png`,
      });

      res.status(200).json(response);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
);

router.put(
  "/:id/status",
  passport.authenticate("jwt", { session: false }),
  isAdmin(),
  async (req, res) => {
    const orderId = req.params.id;
    const status = req.body.status;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw { status: 404, message: "Order not found" };
      }
      order.status = status;
      await order.save();

      res.json({ message: "Order status updated successfully" });
    } catch (e) {
      const status = e.status || 400;
      res.status(status).json({ message: e.message });
    }
  }
);

const getAllOrders = async () =>
  await Order.find().populate("items.product").populate("user").lean();

const getCustomerOrders = async (user) =>
  await Order.find({ user: user.id }).populate("items.product").lean();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const orders =
        user.role === "customer"
          ? await getCustomerOrders(user)
          : await getAllOrders();

      const formattedOrders = orders.map((orderItem) => {
        const { items, ...order } = orderItem;

        const formattedItems = items
          .filter((item) => item.product)
          .map((item) => {
            const { product, ...others } = item;

            product.images =
              (product.images &&
                product.images.map(({ originalname, filename }) => ({
                  originalFileName: originalname,
                  url: `${req.protocol}://${req.get(
                    "host"
                  )}/static/${filename}`,
                }))) ||
              [];

            return {
              product,
              ...others,
            };
          });

        return {
          ...order,
          items: formattedItems,
        };
      });

      res.json(formattedOrders);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
);

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const order = await Order.findById(req.params.id)
        .populate("items.product")
        .populate("user")
        .lean();
      if (!order) {
        throw { status: 404, message: "Order not found" };
      }
      if (user.role === "customer" && order.role !== user.role) {
        throw { status: 403, message: "Forbidden access" };
      }
      const { items, ...rest } = order;

      res.json({
        ...rest,
        items: items
          .filter((item) => item.product)
          .map((item) => {
            const { product, ...others } = item;

            product.images =
              (product.images &&
                product.images.map(({ originalname, filename }) => ({
                  originalFileName: originalname,
                  url: `${req.protocol}://${req.get(
                    "host"
                  )}/static/${filename}`,
                }))) ||
              [];

            return {
              product,
              ...others,
            };
          }),
      });
    } catch (e) {
      const status = e.status || 400;
      res.status(status).json({ message: e.message });
    }
  }
);

module.exports = router;
