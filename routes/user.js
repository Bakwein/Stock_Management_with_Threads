const express = require("express");
const router = express.Router();
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();
const db = require("../data/db");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

function cookie_control(req, res)
{
    if(req.cookies.token)
    {
        const token = req.cookies.token;
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
            if(err){
                res.redirect('/');
                return 1;
            }
        })
    }
    else
    {
        res.redirect('/');
        return 1;
    }
    return 0;
}

function you_have_cookie(req, res)
{
    if(req.cookies.token)
    {
        const token = req.cookies.token;
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
            if(!err){
                if(decoded.role === 'user')
                {
                    res.redirect("/user/home_render");
                    return 1;
                }
                else if(decoded.role === 'admin')
                {
                    res.redirect("/admin/home_render");
                    return 1;
                }
                else
                {
                    res.redirect("/user/logout");
                    return 1;
                }
            }
            else
            {
                res.redirect("/admin/logout");
                return 1;
            }
        })
    }
    return 0;
}


router.get('/home_render', function(req, res)
{
    var ret = cookie_control(req, res);
    if(ret === 1)
    {
        return;
    }
    //const user = verifyToken(req, res);
    res.redirect('/user/home');
});

router.get("/home", function(req, res){
    var ret = cookie_control(req, res);
    if(ret === 1)
    {
        return;
    }
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

router.get("/login_render", function(req, res){
    var ret = you_have_cookie(req, res);
    if(ret === 1)
    {
        return;
    }
    return res.redirect("/user/login");
});

router.get("/login", function(req, res){
    var ret = you_have_cookie(req, res);
    if(ret === 1)
    {
        return;
    }
    res.render("user/login", {
        title: "Giriş Yap",
    });
});


router.get("/logout", function(req, res)
{
    res.clearCookie('token');
    res.redirect("/");
});


module.exports = router;