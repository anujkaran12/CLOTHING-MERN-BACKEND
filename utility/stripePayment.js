const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripePayment = async (req, res) => {
  
  try {
    let { amount } = req.body; // amount in INR
    amount = Math.round(Number(amount));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Cart Payment" },
            unit_amount: amount * 100, // in paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success/?session_id={CHECKOUT_SESSION_ID}&address=${req.body.address}`,
      cancel_url: `${process.env.FRONTEND_URL}/success`,
    });

    res.send({ id: session.id });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
};
const checkOutSession = async (req, res) => {
  console.log("Checkout session run")
  const session = await stripe.checkout.sessions.retrieve(req.params.id);
  res.status(200).json(session);
};

module.exports = { stripePayment ,checkOutSession};
