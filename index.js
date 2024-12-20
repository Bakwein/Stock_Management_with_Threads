const express = require("express");

const app = express();

app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const path = require("path");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const loginRoutes = require("./routes/login");

const db = require("./data/db");
const jwt = require('jsonwebtoken');

app.use("/libs", express.static(path.join(__dirname,"node_modules")));
app.use("/static", express.static(path.join(__dirname,"public")));

const moment = require('moment');

//routes
app.use(loginRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

const bodyParser = require('body-parser');

require("./createtables");























app.post("/api/create_product", async function(req,res)
{
    const product_data = req.body;
    console.log(product_data);

    await db.execute("INSERT INTO products (ProductName, Stock, Price) VALUES (?,?,?)", [product_data.urunAdi, product_data.stokMiktari, product_data.fiyat]);

    res.json({ message: 'Ürün başarıyla oluşturuldu!', hata: 0, product_data });
});

app.listen(3001, function()
{
    console.log("listening on port 3001");
});