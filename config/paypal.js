"use strict";

/**
 *
 * PayPal Node JS SDK dependency
 */
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

/**
 *
 * Returns PayPal HTTP client instance with environment that has access
 * credentials context. Use this instance to invoke PayPal APIs, provided the
 * credentials have access.
 */
function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

/**
 *
 * Set up and return PayPal JavaScript SDK environment with PayPal access credentials.
 * This sample uses SandboxEnvironment. In production, use LiveEnvironment.
 *
 */
function environment() {
  let clientId =
    process.env.PAYPAL_CLIENT_ID ||
    "AR694T3JeoIRRDOL2WaYEEbXlxvFIbtqBFt53M47OgWQLRPUlDJAD0J-ENrROvh5EUrsQPTO9g64Qh1t";
  let clientSecret =
    process.env.PAYPAL_CLIENT_SECRET ||
    "EBagsqXj6EIl43eZo5QT1W6ezZSUyOgj6MqCW73w7gj2O251R7Kqb8VlMlXWZnmdI8UXB0Mf03RN5HkE";

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

async function prettyPrint(jsonData, pre = "") {
  let pretty = "";
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  for (let key in jsonData) {
    if (jsonData.hasOwnProperty(key)) {
      if (isNaN(key)) pretty += pre + capitalize(key) + ": ";
      else pretty += pre + (parseInt(key) + 1) + ": ";
      if (typeof jsonData[key] === "object") {
        pretty += "\n";
        pretty += await prettyPrint(jsonData[key], pre + "    ");
      } else {
        pretty += jsonData[key] + "\n";
      }
    }
  }
  return pretty;
}

module.exports = { client: client, prettyPrint: prettyPrint };
