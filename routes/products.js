const express = require("express");

const app = express();

app.post("/get-product", (req, res) => {
  connection.query(
    "call getProducts(?)",
    [req.body.categoryName],
    (error, results, fields) => {
      if (error) {
        res.status(400).json({ message: error, msg: "username error" });
      } else {
        // merging the file
        let cat = results[1];
        let prodDetails = results[0];

        console.log(cat.length);
        for (let i = 0; i < cat.length; i++) {
          var index = prodDetails.findIndex(function (item, j) {
            return item.ID === cat[i].id;
          });
          if (index != -1) {
            if (prodDetails[index].categories == null) {
              prodDetails[index].categories = [];
              prodDetails[index].categories.push(cat[i]);
            } else {
              prodDetails[index].categories.push(cat[i]);
            }
          }
        }

        res.status(200).json(prodDetails);
      }
    }
  );
});

module.exports = app;
