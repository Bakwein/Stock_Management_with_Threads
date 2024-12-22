const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../data/db');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

router.get("/", function(req, res){
    if(req.cookies.token){
        const token = req.cookies.token;
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
            if(err){
                return res.redirect("/user/login_render");
            }
            else
            {
                const dec = decoded;
                if(dec.role == "admin"){
                    return res.redirect("/admin/home_render");
                }
                else if(dec.role == "user"){
                    return res.redirect("/user/home_render");
                }

                
                if (req.cookies.token) {
                    res.clearCookie('token');
                }
                return res.redirect("/user/login_render");
            }
        });
    }
    //if there is a cookie clean it
    if (req.cookies.token) {
        res.clearCookie('token');
    }
    return res.redirect("/user/login_render");

});

module.exports = router;