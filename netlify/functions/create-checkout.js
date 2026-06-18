// netlify/functions/create-checkout.js
// Builds a Stripe Checkout Session from the basket. No npm packages needed —
// it calls the Stripe API directly with fetch, so it works on drag-and-drop deploys.
// Prices are set HERE on the server, so the browser can't change the total.

const PRICES = {
  "Brownie": 3.50,
  "Strawberry Brownie": 4.50,
  "Oreo Brownie": 4.50,
  "Kinder Bueno Brownie": 4.50,
  "Lotus Brownie": 4.50,
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { items } = JSON.parse(event.body || '{}');
    if (!Array.isArray(items) || !items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Your basket is empty.' }) };
    }

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${process.env.URL}/success.html`);
    params.append('cancel_url', `${process.env.URL}/index.html`);
    params.append('shipping_address_collection[allowed_countries][0]', 'ES');

    items.forEach((it, i) => {
      const price = PRICES[it.nm];                 // look up the real price on the server
      if (price === undefined) throw new Error('Unknown product: ' + it.nm);
      const qty = Math.max(1, parseInt(it.qty, 10) || 1);
      params.append(`line_items[${i}][quantity]`, qty);
      params.append(`line_items[${i}][price_data][currency]`, 'eur');
      params.append(`line_items[${i}][price_data][unit_amount]`, Math.round(price * 100));
      params.append(`line_items[${i}][price_data][product_data][name]`, it.nm);
    });

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await res.json();
    if (!res.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: (session.error && session.error.message) || 'Stripe error' }) };
    }
    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
