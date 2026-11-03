import assert from "node:assert/strict";
import { test } from "node:test";
import { stripeCheckoutUrl } from "../src/lib/checkout-url.ts";

test("Stripe-hosted checkout redirects retain the session path", () => {
  assert.equal(stripeCheckoutUrl("https://checkout.stripe.com/c/pay/cs_test_example"), "https://checkout.stripe.com/c/pay/cs_test_example");
});
test("checkout rejects insecure, credentialed and foreign destinations", () => {
  for (const url of ["http://checkout.stripe.com/c/pay/a", "https://checkout.stripe.com.evil.test/pay",
    "https://evil.test", "javascript:alert(1)", "https://user@checkout.stripe.com/pay", "https://checkout.stripe.com:8443/pay"]) {
    assert.throws(() => stripeCheckoutUrl(url));
  }
});
