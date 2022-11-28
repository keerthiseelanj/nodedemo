
// Import express framework
const express = require('express');
const { NULL } = require('mysql/lib/protocol/constants/types');
// calling an router
const router = express.Router();
var PHPUnserialize = require('php-unserialize');
// ===========================for quizz list
// get function for Projects Employee
// router.post("/quizzQuestionAnswer", (req, res) => {

//     connection.query("call getQuizzQA(?)", [req.body.quizzId], (error, results, fields) => {
//         if (!error) {
//             res.status(200).json(results[0])
//         } else {
//             res.status(400).json("Failed To Get An Data" + error)
//         }
//     }
//     )
// }
// )

// getting the data for api

router.post("/quizzQuestionAnswer", async (req, res) => {
    let arr = new Array()
    await connection.query("call quizzQuestion(?,?,?,?)", [req.body.postid, req.body.userid, req.body.courseid, req.body.quizid], (error, qresults, fields) => {
        if (!error) {

            arr = qresults[0];
            connection.query("call quizzData(?)", [req.body.postid], (error, results, fields) => {


                if (!error) {
                    for (let i = 0; i < qresults[0].length; i++) {

                        for (let j = 0; j < results[0].length; j++) {

                            if (results[0][j].post_id == arr[i].ID && results[0][j].meta_key == "answers") {

                                arr[i].answer = Object.values(PHPUnserialize.unserialize(results[0][j].meta_value))

                            }
                            if (results[0][j].post_id == arr[i].ID && results[0][j].meta_key == "image") {

                                try {
                                    if (results[0][j].meta_value != '') {
                                        let imageUrl = Object.values(PHPUnserialize.unserialize(results[0][j].meta_value))

                                        arr[i].link = imageUrl[1];
                                    } else {
                                        arr[i].link = null;
                                    }

                                }
                                catch (e) {
                                    console.error(e);
                                }
                            }
                            if (results[0][j].post_id == arr[i].ID && results[0][j].meta_key == "type") {

                                arr[i].q_type = results[0][j].meta_value

                            }

                        }
                    }


                    res.status(200).json(arr)
                } else {
                    res.status(400).json("Failed To Get An Data" + error)
                }
            }
            )
        } else {
            res.status(400).json("Failed To Get An Data" + error)
        }
    }
    )
}
)
//fetch quiz records api
router.get("/getQuizData", (req, res) => {
    connection.query("call getQuizData(?,?,?)", [req.body.userid, req.body.courseid, req.body.quizid], (error, results) => {
        if (!error) {
            res.status(200).json(results)
        } else {
            res.status(400).json("Failed To Get Data" + error)
        }
    }
    )
}
)

//quiz process update api
router.post("/updatequiz", async (req, res) => {
    var arrData = req.body.data;
    console.log(arrData)
    for (let i = 0; i < arrData.length; i++) {
        if (i < arrData.length) {
            connection.query("call updateQuizData(?,?,?,?,?,?,?,?,?)", [req.body.userid, req.body.courseid, req.body.quizid, 
                req.body.progress, req.body.status, 
                arrData[i].questionid, arrData[i].userAnswer, arrData[i].correctAnswer, 
                arrData[i].attemptNumber], (error, results) => {

                if (i == arrData.length - 1) {
                    res.status(200).json(results);
                }
            })
        } else {

            res.status(200).json(results);
        }
    }
})
//quiz status checking api

router.post("/statuscheck", (req, res) => {
    connection.query("call statuscheck(?,?)", [req.body.userid, req.body.quizid], (error, results) => {
        if (!error) {
            res.status(200).json(results)
        } else {
            res.status(400).json("Failed To Get Data" + error)
        }
    }
    )
}
)
router.post("/viewquiz", async (req, res) => {
    let arr = new Array()
    await connection.query("call test(?,?,?,?)", [req.body.postid, req.body.userid, req.body.courseid, req.body.quizid], (error, qresults, fields) => {
        if (!error) {

            arr = qresults[0];
            connection.query("call quizzData(?)", [req.body.postid], (error, results, fields) => {


                if (!error) {
                    for (let i = 0; i < qresults[0].length; i++) {

                        for (let j = 0; j < results[0].length; j++) {

                            if (results[0][j].post_id == arr[i].ID && results[0][j].meta_key == "answers") {

                                arr[i].answer = Object.values(PHPUnserialize.unserialize(results[0][j].meta_value))

                            }
                            if (results[0][j].post_id == arr[i].ID && results[0][j].meta_key == "image") {

                                try {
                                    if (results[0][j].meta_value != '') {
                                        let imageUrl = Object.values(PHPUnserialize.unserialize(results[0][j].meta_value))

                                        arr[i].link = imageUrl[1];
                                    } else {
                                        arr[i].link = null;
                                    }

                                }
                                catch (e) {
                                    console.error(e);
                                }
                            }
                            if (results[0][j].post_id == arr[i].ID && results[0][j].meta_key == "type") {

                                arr[i].q_type = results[0][j].meta_value

                            }

                        }
                    }


                    res.status(200).json(arr)
                } else {
                    res.status(400).json("Failed To Get An Data" + error)
                }
            }
            )
        } else {
            res.status(400).json("Failed To Get An Data" + error)
        }
    }
    )
}
)

router.post("/userreview", (req, res) => {
    connection.query("call user_review(?)", [req.body.p_User_Review], (error, results, fields) => {
        if (error) { res.status(400).json({ Result: "Your Review is Not updated" }); } 
        else { res.status(200).json(results[0]); }
    })
})


router.post("/userinsertreview", (req, res) => {
    connection.query("call insert_user_review(?,?,?,?,?,?)", [req.body.p_CommentPostID, req.body.p_CommentAuthor, req.body.p_CommentAuthorEmail, req.body.p_CommentContent, req.body.p_UserId,req.body.p_Rating], (error, results, fields) => { 
        if (error) { res.status(400).json(error); } 
        else { res.status(200).json(results); } })
})

// for isbn and number of page
router.post("/isbn_noofpage", (req, res) => {
    connection.query("call isbn_noofpage(?)", [req.body.p_PostID], (error, results, fields) => {
   
           if (error) {
   
               res.status(400).json(error);
   
           } else {
           let des = []
            if(typeof results[0][0] != 'undefined'){
                  des = Object.entries(PHPUnserialize.unserialize(results[0][0].meta_value));
                console.log(des)
                res.status(200).json(des);
                 }else{
                     des.push([])
                     des.push([])
                     res.status(200).json(des);
                 }
               
   
           }
   
       })
   
   })
  router.post("/bookauthor", (req, res) => {
    connection.query("call bookauthor(?)", [req.body.p_PostID], (error, results, fields) => {
   
           if (error) {
   
               res.status(400).json(error);
   
           } else {
   
               res.status(200).json(results[0]);
   
           }
   
       })
   
   })

router.post("/productdescription", (req, res) => {
connection.query("call product_description(?)", [req.body.p_PostID], (error, results, fields) => {
   if (error) {

            res.status(400).json({Result:"Something went wrong"});
 } else 
       
        {
   
            res.status(200).json(results[0]);

           

        }

    })

})
// exporting the module
module.exports = router;