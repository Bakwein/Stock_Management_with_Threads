const express = require("express");
const router = express.Router();
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();
const db = require("../data/db");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { title } = require("process");

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
    res.redirect('/admin/home');
});

router.get("/home", async function(req, res){
    cookie_control(req, res);
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

    const [urunler,] = await db.execute("SELECT * FROM products");

    res.render("admin/home", {
        title: "Anasayfa",
        urunler: urunler 
    });
});

router.get('/home/edit/:id', async function(req, res){

    const id = req.params.id;

    const [urun,] = await db.execute("SELECT * FROM products WHERE ProductID = ?", [id]);

    if(urun.length == 0)
    {
        return res.redirect("/admin/home");
    }

    res.render("admin/product_edit", {
        title: "Ürün Düzenleme",
        urun: urun[0]
    });
});

router.get("/create_product", function(req, res){

    var ret = cookie_control(req, res);
    if(ret === 1)
    {
        return;
    }

    res.render("admin/create_product",{
        title: "Ürün Oluşturma",
        message: "",
        alert_type: ""
    });

});

router.get("/logs", async function(req, res){
    var ret = cookie_control(req, res);
    if(ret === 1)
    {
        return;
    }
    const [loglar,] = await db.execute("SELECT logs.LogID, customers.CustomerNickname, logs.OrderIDR, logs.LogDate, logs.LogType, logs.LogDetails FROM logs JOIN customers ON logs.CustomerIDR = customers.CustomerID");
    res.render("admin/logs", {
        title: "Loglar",
        loglar: loglar
    })
})

router.get("/approve_orders", async function (req, res){
    var ret = cookie_control(req, res);
    if(ret === 1)
    {
        return;
    }
    const [orders,] = await db.execute("SELECT * FROM orders WHERE OrderStatus = 0");
    const [products,] = await db.execute("SELECT * FROM products");
    const [customers,] = await db.execute("SELECT * FROM customers");

    res.render("admin/approve_orders", {
        title: "Onay Bekleyen Siparişler",
        orders: orders,
        products: products,
        customers: customers
    });
});


router.get("/login_render", function(req, res){
    var ret = you_have_cookie(req, res);
    if(ret === 1)
    {
        return;
    }
    res.render("admin/login", {
        title: "Admin Girişi"
    });
});

router.get("/logout", function(req, res)
{
    res.clearCookie('token');
    res.redirect("/");
});

module.exports = router;