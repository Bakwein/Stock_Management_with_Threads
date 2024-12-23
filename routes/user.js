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

router.get("/home", async function(req, res){
    var ret = cookie_control(req, res);
    if(ret === 1)
    {
        return;
    }
    
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const id = decoded.id;

    const [results,] = await db.execute("SELECT * FROM customers where CustomerID = ?", [id]);
    if(results.length === 0)
    {
        res.redirect("/user/logout");
    }
    const butce = results[0].Budget;
    console.log("Bütçe: " + butce);
    
    const [urunler,] = await db.execute("SELECT * FROM products");



    res.render("user/home", {
        title: "Anasayfa",
        urunler: urunler,
        butce: butce,
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


//thread denemesi

const {Worker} = require('worker_threads');

router.get("/non-blocking", function(req, res){
    res.status(200).send("Non-blocking");
});

router.get("/blocking", async function(req, res){
    /*let counter = 0;
    for(let i = 0; i < 20000000000; i++)
    {
        counter++;
    }
     //res.status(200).send(`the res is ${counter}`);


     //blocking uzun sürdüğünden blocking takıldığında hepsi takılmış olur çünkü main thread'i bloklar ve timout'a düşerler
    */

    const worker = new Worker('./worker.js');
    worker.on('message', (data) => {
        res.status(200).send(`the res is ${data}`);
    });

    worker.on('error', (error) => {
        res.status(404).send(`An error occured: ${error}`);
    });

    //worker ile birlikte bu kısım hala blocklu normal olarak ama non-blocking kısmı çalışına erişilebilir
   
});

router.get("/register_render", function(req, res){
    var ret = you_have_cookie(req, res);
    if(ret === 1)
    {
        return;
    }
    return res.redirect("/user/register");
});

router.get("/register", function(req, res){
    var ret = you_have_cookie(req, res);
    if(ret == 1)
    {
        return;
    }
    res.render("user/register", {
       title: "Kayıt Ol" 
    });
});

router.get("/orders", async function(req, res){
    var ret = cookie_control(req, res);
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const id = decoded.id;
    if(ret == 1)
    {
        return;
    }

    console.log(id);
    const [iptal,] = await db.execute("SELECT orders.TotalPrice, orders.OrderID, customers.CustomerNickname, products.ProductName, orders.Quantity, orders.OrderDate FROM orders JOIN customers ON orders.CustomerIDR = customers.CustomerID JOIN products ON orders.ProductIDR = products.ProductID WHERE CustomerIDR = ? AND OrderStatus = ?", [id, -1]);
    const [bekliyor,] = await db.execute("SELECT orders.TotalPrice, orders.OrderID, customers.CustomerNickname, products.ProductName, orders.Quantity, orders.OrderDate FROM orders JOIN customers ON orders.CustomerIDR = customers.CustomerID JOIN products ON orders.ProductIDR = products.ProductID WHERE CustomerIDR = ? AND OrderStatus = ?", [id, 0]);
    const [isleniyor,] = await db.execute("SELECT orders.TotalPrice, orders.OrderID, customers.CustomerNickname, products.ProductName, orders.Quantity, orders.OrderDate FROM orders JOIN customers ON orders.CustomerIDR = customers.CustomerID JOIN products ON orders.ProductIDR = products.ProductID WHERE CustomerIDR = ? AND OrderStatus = ?", [id, 1]);
    const [tamamlandi,] = await db.execute("SELECT orders.TotalPrice, orders.OrderID, customers.CustomerNickname, products.ProductName, orders.Quantity, orders.OrderDate FROM orders JOIN customers ON orders.CustomerIDR = customers.CustomerID JOIN products ON orders.ProductIDR = products.ProductID WHERE CustomerIDR = ? AND OrderStatus = ?", [id, 2]);

    res.render("user/orders", {
        title: "Siparişlerim",
        iptal: iptal,
        bekliyor: bekliyor,
        isleniyor: isleniyor,
        tamamlandi: tamamlandi
    });
});


router.get('/profile_update', async function(req, res)
{
    var ret = cookie_control(req, res);
    if(ret === 1)
    {
        return;
    }

    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const id = decoded.id;

    const [kullanici,] = await db.execute("SELECT * FROM customers WHERE CustomerID = ?", [id]);
    if(kullanici.length === 0)
    {
        res.redirect("/user/logout");
    }

    res.render("user/profile_update", {
        title: "Profil Güncelleme",
        kullanici: kullanici[0],
    });
});

router.get("/profile", async function(req,res){
    var ret = cookie_control(req, res);
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const id = decoded.id;
    if(ret == 1)
    {
        return;
    }
    const [kullanici,] = await db.execute("SELECT * FROM customers WHERE CustomerID = ?", [id]);
    const [siparisler,] = await db.execute("SELECT * FROM orders WHERE CustomerIDR = ?", [id]); //onaylanmışa göre sonra bakılacak

    res.render("user/profile", {
        title: "Profilim",
        kullanici: kullanici[0],
        siparisler: siparisler,
    });
});




module.exports = router;