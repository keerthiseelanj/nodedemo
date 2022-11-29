// Import express framework
const express = require('express');
const nodemailer = require("nodemailer");
// calling an router
var hasher = require('wordpress-hash-node');
const request = require('request');
const router = express.Router();


// async..await is not allowed in global scope, must use a wrapper
router.post("/userexisting", async (req, res) => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let otpNumber = Math.floor((Math.random() * 900000) + 100000);
    let transporter = nodemailer.createTransport({
        // service: 'gmail',
        // host: 'smtp.gmail.com',
        // auth: {
        //     user: "keerthidevelopment@gmail.com",
        //     pass: "indraamma18"
        // }
        host: "smtp.ethereal.email",

        port: 587,

        secure: false,

        service: 'gmail',
        auth: {
            user: "websgfairfield@gmail.com",
            pass: "uvodstchsqjinrtd"
        }


    });
    connection.query("call user_existing(?)", [req.body.user_existing], (error, results, fields) => {

        if (!error) {
            if (results[0][0].Result == "YOUR EXISTING") {
                const mailOptions = {
                    from: "purchasing@cce.com.sg", // sender address
                    to: results[0][0].user_email, // list of receivers
                    subject: "OTP ", // Subject line
                    html: `<h4>Dear Sir/Madam,</h4>
                <br>
                <p>Please use the otp given below for reset the password</p>   
                <h4>${otpNumber}</h4>
                <p>Thanks and Regards</p>
                <p>Fairfield Team</p>`
                };
                // send mail with defined transport object
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        res.status(400).json({ Result: err, otp: 'failed to send mail', code: 1 });
                    } else {
                        res.status(200).json({ Result: 'mail send', otp: otpNumber, code: 2 });
                    }
                })
            } else {
                res.status(200).json({ Result: 'User Not Exists', code: 1 });
            }

        } else {
            res.status(400).json({ Result: 'something went wrong', code: 0 })
        }
    }
    )


})

router.post("/updatepassword", (req, res) => {

    var hash = hasher.HashPassword(req.body.p_NewPassword);

    connection.query("call update_password(?,?)", [hash, req.body.p_InputUser], (error, results, fields) => {

        if (error) {

            res.status(400).json({ Result: "Password is Not updated" });

        } else {

            res.status(200).json({ Result: "Password has been successfully changed" });

        }

    })

})

router.post("/userdetail", (req, res) => {

    console.log(req.body)

    connection.query("call user_detail(?)", [req.body.p_UserID], (error, results, fields) => {

        if (error) {

            res.status(400).json({ Result: "Your Info is Not Existing" });

        } else {

            res.status(200).json(results[0]);

        }

    })

})


router.post("/userlogin", (req, res) => {
   console.log(req.body.username)
    connection.query("call userLogin(?)", [req.body.username], (error, results, fields) => {

        if (error) {

            res.status(404).json({ message: error,msg:"username error" });

        } else {
            console.log(results)
            if (results[0][0].Result) {
                console.log(req.body)
                var checked = hasher.CheckPassword(req.body.password, results[0][0].user_pass);
                if (checked) {
                    res.status(200).json({ message: "success", user_id: results[0][0].ID });
                } else {
                    res.status(200).json({ message: "Wrong Password" });
                }

            }
            else {
                res.status(200).json({ message: "user not exists" });
            }

        }

    })

})

router.post("/usersignup", (req, res) => {
    var hash = hasher.HashPassword(req.body.p_Pass);
    connection.query("call user_signup(?,?,?)", [req.body.p_UserInput, hash, req.body.p_Email], (error, results, fields) => {

        if (error) {

            res.status(400).json([{ message: "Something went Wrong" }]);

        } else {

            res.status(200).json(results[0]);

        }

    })

})


// woocommerce api



router.post('/ordermail', async (req, res) => {
    // setting the mail 
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        service: 'gmail',

        auth: {
            user: "websgfairfield@gmail.com",
            pass: "Abitech123!@#"
        }
    });
    // getting order data
    const options = {
        url: `https://fairfieldbooks.com.sg/wp-json/wc/v3/orders/${req.body.id}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Basic Y2tfOWQwZGU1YTc5Y2ZlNzE4ZmEyNzQyNjRmZDQ1OGUwN2I5MmQ0MmM1YTpjc19jNGI5OTEyNzhiMWJlN2I3MzBjZTQzN2RmMGY0ZTNkMDMwNzk3YmI2"

        }
    };
    request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const responsedata = JSON.parse(body);
            let datalength = responsedata.line_items
            let tableRow = ''
            // mail template
            for(let i=0;i<datalength.length;i++){
                tableRow +=` <tr>
                <td style=" border: 2px solid #dddddd">${datalength[i].name}</td>
                <td style=" border: 2px solid #dddddd">${datalength[i].quantity}</td>
                <td style=" border: 2px solid #dddddd">$ ${datalength[i].price}</td>
              </tr>`
            }
            // send the mail(action)
            var mailOptions = {
                from: 'Fairfield books',
                to: `keerthiseelanj@gmail.com, ${responsedata.billing.email}`,
                subject: 'Order Details',
                html: `
                
                <h2 style="color:#9B5C8F">New Order: #${responsedata.id}</h2>
                <table style="border-collapse: collapse;">
                <tr>
                  <th style=" border: 2px solid #dddddd">Product</th>
                  <th style=" border: 2px solid #dddddd">Quantity</th>
                  <th style=" border: 2px solid #dddddd">Price</th>
                </tr>
             ${tableRow}
             <tr>
             <td style=" border: 2px solid #dddddd" colspan="2">Subtotal</td>
             <td style=" border: 2px solid #dddddd">$ ${datalength[0].subtotal}</td>
             
             
             </tr>
             <tr>
             <td style=" border: 2px solid #dddddd" colspan="2">Shipping</td>
             <td style=" border: 2px solid #dddddd">$ ${responsedata.shipping_lines[0].total} via ${responsedata.shipping_lines[0].method_title}</td>
             
             
             </tr>
             <tr>
             <td style=" border: 2px solid #dddddd" colspan="2">Payment Method</td>
             <td style=" border: 2px solid #dddddd">${responsedata.payment_method_title}</td>
             
             
             </tr>
             <tr>
             <td style=" border: 2px solid #dddddd" colspan="2">Total</td>
             <td style=" border: 2px solid #dddddd">$ ${responsedata.total}</td>
             
             
             </tr>
              </table>
              <div style="display: flex;">
<div>
<h3 style="color:#9B5C8F">Billing address</h3>
<p>First name: ${responsedata.billing.first_name}</p>
<p>Last name: ${responsedata.billing.last_name}</p>
<p>comapny: ${responsedata.billing.company}</p>
<p>address2: ${responsedata.billing.address_1}</p>
<p>address2: ${responsedata.billing.address_2}</p>
<p>city: ${responsedata.billing.city}</p>
<p>state: ${responsedata.billing.state}</p>
<p>postcode: ${responsedata.billing.postcode}</p>
<p>country: ${responsedata.billing.country}</p>
<p>email: ${responsedata.billing.email}</p>
<p>phone: ${responsedata.billing.phone}</p>
</div>
<div>
<h3 style="color:#9B5C8F">shipping address</h3>
<p>First name: ${responsedata.shipping.first_name}</p>
<p>Last name: ${responsedata.shipping.last_name}</p>
<p>comapny: ${responsedata.shipping.company}</p>
<p>address2: ${responsedata.shipping.address_1}</p>
<p>address2: ${responsedata.shipping.address_2}</p>
<p>city: ${responsedata.shipping.city}</p>
<p>state: ${responsedata.shipping.state}</p>
<p>postcode: ${responsedata.shipping.postcode}</p>
<p>country: ${responsedata.shipping.country}</p>
</div>
</div>
              
              `

            
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    res.status(400).json("something went wrong");
                } else {
                    res.status(200).json("Mail send");
                }
            });



        } else {
            res.status(400).json(error);
        }
    });
})
module.exports = router;