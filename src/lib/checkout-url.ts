export function stripeCheckoutUrl(value: string): string {
  const url = new URL(value);
  if (url.origin !== "https://checkout.stripe.com" || url.username || url.password) {
    throw new Error("Invalid checkout destination");
  }
  return url.href;
}
