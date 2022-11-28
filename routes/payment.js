
const express = require('express');
const router = express.Router();
var PHPUnserialize = require('php-unserialize');

const { v4: uuidv4 } = require('uuid')

const secretkey = process.env.SECRET_KEY
// const stripe = require('stripe')('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')
const stripe = require('stripe')('sk_test_51JhUAaCLSrAhMUuDuhzbYu6Hw6Vvu01CgPYIRjrNYv0dwrJ5Piv7PMLIpzaNCPUqG143uiMtTazbcOU0sogy8dQ0003ab1Fm6v')
// woocommerce setup

// import Stripe from 'stripe';
// const stripe = Stripe(publishkey, { apiVersion: "2020-08-27" })

//method
router.post('/payment', async (req, res) => {
  // console.log(req.body)
  const { product, token, card } = req.body;

  const uuid = uuidv4();

  const idmkey = uuid;
  try {
    const cust = await stripe.customers.create({
      email: req.body.email,
      name: req.body.name,
      description: req.body.description

    });
    let cus_id = cust.id;
    const tokens = await stripe.tokens.create(
      {
        card:
        {
          number: product.number,
          exp_month: product.month,
          exp_year: product.year,
          cvc: product.cvv
        }
      }
    )

    let tok_id = tokens.id;


    const addcard = await stripe.customers.createSource(cus_id, { source: tok_id })
    const chargeadd = await stripe.charges.create({
      amount: req.body.amount * 100,
      currency: 'SGD',
      customer: cus_id,

    }, { idempotencyKey: idmkey });
    res.status(200).json({ "message": chargeadd.status, "status": "Success" });

  }
  catch (error) { console.error(error); res.status(400).json({ "message": error.message, "status": "Failed" }) }
})


router.post("/create-payment-intent", async (req, res) => {

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.Amount * 100, //lowest denomination of particular currency
      currency: "SGD",
      payment_method_types: ["card"], //by default

    });

    console.log(paymentIntent)
    const confirmPaymentIntent = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      { payment_method: 'success' }
    );

    const clientSecret = confirmPaymentIntent.status;
    res.json({
      clientSecret: clientSecret,
    });
  } catch (e) {
    // console.log(stripe);
    res.json({ error: e.message });
  }
});

// flate rate count

// add to whislist
router.post("/getweightbase", (req, res) => {
  connection.query("call getWeightdata(?)", [req.body.country], (error, results, fields) => {

    if (error) {

      res.status(400).json({ Result: "Something went wrong" });

    } else {
      if (results[0].length == 1) {
        let shipAmount = Object.values(PHPUnserialize.unserialize(results[0][0].option_value))
        // getting object size
        var size = Object.keys(shipAmount[1]).length;
        // validating with each data count
        for (let i = 0; i < size; i++) {
          // finding the weight lies between price range for shipment
          if (shipAmount[1][i].conditions.weight.range.min <= req.body.weight && req.body.weight <= shipAmount[1][i].conditions.weight.range.max) {
           return res.status(200).json({ statuscode: 200, cost: shipAmount[1][i].charges.weight.cost, message: "amount exists"});
          } else if (i == size - 1) {
            res.status(200).json({ statuscode: 202, message: "Limit exceed" });
          }

        }
     
      } else {
        res.status(200).json({ "data": "No data available", statuscode: 404 });
      }


    }

  })

})
// call api

// exporting the module
module.exports = router;