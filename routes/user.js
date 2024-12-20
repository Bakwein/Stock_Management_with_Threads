const express = require("express");
const router = express.Router();
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();
const db = require("../data/db");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

router.get('/home_render', function(req, res)
{
    //cookie_control(req, res);
    //const user = verifyToken(req, res);
    res.redirect('/user/home');
});

router.get("/home", function(req, res){
    //cookie_control(req, res);
    /*
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const id = decoded.id;

    const [results,] = await db.execute("SELECT * FROM kullanıcılar where idkullanıcılar = ?", [id]);
    if(results.length === 0)
    {
        res.redirect("/user/logout");
    }
    */

    res.render("user/home", {
        title: "Anasayfa",
    });
});


module.exports = router;