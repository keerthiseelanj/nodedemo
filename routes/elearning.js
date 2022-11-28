
// Import express framework
const express = require('express');

var PHPUnserialize = require('php-unserialize');
const { serialize, unserialize } = require('php-serialized');
// calling an router
const router = express.Router();
// ===========================for course list

// get function for course
router.post("/courses", (req, res) => {
    console.log(req.body)
    connection.query("call getCourseList(?)", [req.body.p_userid], (error, results, fields) => {
        if (!error) {
            res.status(200).json(results[0])
        } else {
            res.status(400).json("Failed To Get An Data" + error)
        }
    })
})


// getting course list data

// get function for Projects Employee
router.post("/lessionlist", (req, res) => {

    connection.query("call getLessionList(?,?)", [req.body.courseID, req.body.courseType], (error, results, fields) => {
        if (!error) {
            // console.log("lession list",results)
            res.status(200).json(results[0])
        } else {
            res.status(400).json("Failed To Get An Data" + error)
        }
    }
    )
}
)

// get function for Projects Employee
router.post("/lessiondetails", (req, res) => {

    connection.query("call getLessionDetails(?,?)", [req.body.userid, req.body.lessionID], (error, results, fields) => {
        if (!error) {
            // console.log("lession details",results)
            res.status(200).json(results[0])
        } else {
            res.status(400).json("Failed To Get An Data" + error)
        }
    }
    )
}
)


// get function for Projects Employee
router.post("/usercoursepercentage", (req, res) => {

    connection.query("call addUpdateCoursePercentage(?,?,?,?)", [req.body.p_userID, req.body.p_courseID, req.body.p_lessionID, req.body.p_percentage], (error, results, fields) => {
        if (!error) {
            res.status(200).json(results[0])
        } else {
            res.status(400).json("Failed To Get An Data" + error)
        }
    }
    )
}
)

// get course completed percentage
router.post("/listoffiles", async (req, res) => {


    await connection.query("call listoffiles(?)", [req.body.postID], (error, results) => {
        if (!error) {
            // console.log("list of files",results)
            let responseData = []
            if (results[0][0].meta_value == "no data" || results[0][0].meta_value == '') {
                res.status(200).json(responseData);
            } else {
                let data = JSON.parse(results[0][0].meta_value);
                let dataLength = data.length
                for (let i = 0; i < dataLength; i++) {
                    responseData.push({ id: i + 1, file_name: data[i].lesson_files_label, file_link: JSON.parse(data[i].lesson_files).url })
                }
                res.status(200).json(responseData);
            }

        } else {
            res.status(400).json("Failed To Get Data" + error)

        }
    })
})
//mpeg link api
router.post("/mpeglinks", async (req, res) => {

    await connection.query("call mpeglink(?)", [req.body.id], (error, results) => {

        if (!error) {
            let link = Object.values(PHPUnserialize.unserialize(results[0][0].meta_value))


            let arr1 = link[1];
            let arr2 = link[4];
            let rr = Object.values(link[5]);
            let n = Object.keys(arr1).length;
            let arrdata = [];

            for (let i = 0; i < n; i++) {

                arrdata.push({
                    "title": arr1[i.toString()],
                    "url": arr2[i.toString()], "category": String(Object.values(rr[i]))
                });


            }


            res.status(200).json(arrdata)
        }
        else {
            res.status(400).json(error)
        }

    })
})

//search term api
router.post("/search", (req, res) => {
    let term = req.body.searchterm;

    let term1 = term.split(" ").join("%");

    connection.query("call searchData(?)", [term1], (error, results) => {
        if (!error) {
            res.status(200).json(results)
        } else {
            res.status(400).json("Failed To Get An Data", error)
        }
    })
}
)
//new arrivals
router.get("/newarrivals", (req, res) => {


    connection.query("call newarrivals()", [], (error, results) => {
        if (!error) {
            res.status(200).json(results)
        } else {
            res.status(400).json("Failed To Get An Data", error)
        }
    })
}
)
//billing address

router.post("/billingaddress", (req, res) => {


    connection.query("call billingaddress(?)", [req.body.username], (error, results) => {
        if (!error) {
            res.status(200).json(results)
        } else {
            res.status(400).json("Failed To Get An Data", error)
        }
    })
}
)

router.get("/categorylist", (req, res) => {

    connection.query("call categorylist()", [], (error, results) => {
        if (!error) {
            let cat = Object.values(PHPUnserialize.unserialize(results[0][0].option_value))
            let cat1 = Object.keys(PHPUnserialize.unserialize(results[0][0].option_value))

            let cateogrydata = [];
            let totalcount = cat.length;
            for (let i = 0; i < totalcount; i++) {
                cateogrydata.push({ "id": cat1[i], "name": cat[i] })
            }

            res.status(200).json(cateogrydata)
        } else {
            res.status(400).json("Failed To Get An Data", error)
        }
    })
}
)

router.post("/relatedbooks", (req, res) => {

    let term = req.body.searchterm;

    let searchterms = term.split(" ")



    connection.query("call searchData(?)", [searchterms[0]], (error, results) => {

        if (!error) {

            res.status(200).json(results)

        } else {

            res.status(400).json("Failed To Get An Data", error)

        }

    })

}

)

// getting cart details
router.post("/getCart", (req, res) => {
    connection.query("call getCart(?)", [req.body.userid], (error, results) => {
        if (!error) {

            if (results[0].length > 0) {

                let link = Object.values(PHPUnserialize.unserialize(results[0][0].meta_value))
                console.log("entered 1 ")
                let x = Object.keys(link[0]);
                let cartDetails = []
                for (let i = 0; i < x.length; i++) {
                    connection.query("call getCartDetails(?)", [link[0][x[i]].product_id], (error, results) => {
                        if (!error) {
                            cartDetails.push(results[0][0]);
                            cartDetails[i].count = link[0][x[i]].quantity
                            if (i == x.length - 1) {
                                res.status(200).json(cartDetails)
                            }

                        } else {
                            res.status(400).json("Failed To Get An Data", error)
                        }

                    })
                }
            } else {
                res.status(200).json(results[0])
            }

        } else {
            res.status(400).json("Failed To Get An Data", error)
        }
    })
}
)

router.post("/cartAction", (req, res) => {


    connection.query("call getCart(?)", [req.body.userid], (error, results) => {
        let link = Object.values(PHPUnserialize.unserialize(results[0][0].meta_value));
        console.log(link)
        if (!error) {
            res.status(200).json(link)
        } else {
            res.status(400).json("Failed To Get An Data", error)
        }
    })
}
)
// add to whislist
router.post("/userwishlist", (req, res) => {
    connection.query("call user_wishlist(?,?,?)", [req.body.p_userID, req.body.p_productID, req.body.p_originalPrice], (error, results, fields) => {

        if (error) {

            res.status(400).json({ Result: "Your Wishlist is not added" });

        } else {

            res.status(200).json(results[0]);

        }

    })

})

// get whislist
router.post("/getwishlist", (req, res) => {



    connection.query("call get_wishlist(?)", [req.body.p_userID], (error, results, fields) => {

        if (error) {

            res.status(400).json({ Result: "Your have no Wishlist" });

        } else {

            res.status(200).json(results[0]);

        }

    })

})

router.post("/actionwishlist", (req, res) => {
        connection.query("call delete_wishlist(?,?,?)", [req.body.p_userID, req.body.p_productID, req.body.takeAction], (error, results, fields) => {

        if (error) {

            res.status(400).json(error);

        } else {
            
                res.status(200).json(results[0]);
           
        }

    })

})
// exporting the module
module.exports = router;