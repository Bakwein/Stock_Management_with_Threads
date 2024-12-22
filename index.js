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
const bcrypt = require('bcryptjs');

app.use("/libs", express.static(path.join(__dirname,"node_modules")));
app.use("/static", express.static(path.join(__dirname,"public")));

const moment = require('moment');

const { Worker } = require('worker_threads');
const workers = new Map();

//routes
app.use(loginRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

const bodyParser = require('body-parser');

require("./createtables");


app.post("/api/create_product", async function(req,res)
{
    try{
        const product_data = req.body;
        //console.log(product_data);

        await db.execute("INSERT INTO products (ProductName, Stock, Price) VALUES (?,?,?)", [product_data.urunAdi, product_data.stokMiktari, product_data.fiyat]);

        res.json({ message: 'Ürün başarıyla oluşturuldu!', hata: 0, product_data });
    }
    catch(e)
    {
        res.json({ message: 'Bir hata oluştu: ' + e.toString(), hata: 1 });
    }   
    
});


app.post("/api/user/login", async function(req,res) {
    const { name, password } = req.body;
    //console.log(name, password);

    if(name.length > 255 || name.length <= 0)
    {
        res.json({ message: 'Kullanıcı adı 255 karakterden uzun olamaz!', hata: 1 });
        return;
    }
    if(password.length <= 0)
    {
        res.json({ message: 'Şifre boş olamaz!', hata: 1 });
        return;
    }

    try{
        const [users] = await db.execute("SELECT * FROM customers WHERE CustomerNickname = ?", [name]);

        if (users.length > 0) {
            const user = users[0];
            const userPass = user.Password;
            
            if(await bcrypt.compare(password, userPass))
            {
                const user_id = user.CustomerID;
                const token = jwt.sign({ id: user_id, role: "user" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                res.cookie('token', token, { httpOnly: true, secure: process.env.isHttps === 'true' });

                res.json({ message: 'Giriş başarılı!', hata: 0 });
            }
            else
            {
                res.json({ message: 'Kullanıcı adı veya şifre hatalı!', hata: 1 });
                console.log("bcrypt");
            }
        } else {
            res.json({ message: 'Kullanıcı adı veya şifre hatalı!', hata: 1 });
            console.log("user yok");
        }
    }
    catch(e)
    {
        res.json({ message: 'Bir hata oluştu: ' + e.toString(), hata: 1 });
    }

    
});

app.post("/api/admin/login", async function(req,res) {
    const { name, password } = req.body;
    //console.log(name, password);

    if(name.length > 255 || name.length <= 0)
    {
        res.json({ message: 'Kullanıcı adı 255 karakterden uzun olamaz!', hata: 1 });
        return;
    }
    if(password.length <= 0)
    {
        res.json({ message: 'Şifre boş olamaz!', hata: 1 });
        return;
    }

    try{
        const [admins] = await db.execute("SELECT * FROM admin WHERE Nickname = ?", [name]);
        //console.log(admins);

        if (admins.length > 0) {
            //console.log(admins);
            const admin = admins[0];
            const adminPass = admin.Password;
            
            if(await bcrypt.compare(password, adminPass))
            {
                const admin_id = admin.EmployeeID;
                const token = jwt.sign({ id: admin_id, role: "admin" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                res.cookie('token', token, { httpOnly: true, secure: process.env.isHttps === 'true' });

                res.json({ message: 'Giriş başarılı!', hata: 0 });
            }
            else
            {
                res.json({ message: 'Kullanıcı adı veya şifre hatalı!', hata: 1 });
            }
        } else {
            res.json({ message: 'Kullanıcı adı veya şifre hatalı!', hata: 1 });
        }
    }
    catch(e)
    {
        res.json({ message: 'Bir hata oluştu: ' + e.toString(), hata: 1 });
    }
    

});

function butgetGenerator()
{
    let butget = Math.floor(Math.random() * 2501) + 500; // 500-3000
    return butget;
}


app.post("/api/user_reset", async function(req,res) {

    try{
        //tüm kullanıcıları sil
        await db.execute("DELETE FROM customers");

        let userCount = Math.floor(Math.random() * 6) + 5; // 5- 10
        console.log("Toplam kullanıcı sayısı: " + userCount);

        let premiumUserCount = Math.floor(Math.random() * 9) + 2; // 2-10
        console.log("Toplam premium kullanıcı sayısı: " + premiumUserCount);
        let normalUserCount = userCount - premiumUserCount;
        console.log("Toplam normal kullanıcı sayısı: " + normalUserCount);

        let num = 1;

        for(let i = 0; i < premiumUserCount; i++)
        {
            let butget = butgetGenerator();
            let customerName = "Müşteri " + num;
            let customerNickname = "musteri" + num;
            let password = "123";
            let hashedPassword = await bcrypt.hash(password, 10);


            await db.execute("INSERT INTO customers (Budget, CustomerType, CustomerName, TotalSpent, Password, CustomerNickname) VALUES (?,?,?,?,?,?)", [butget, "Premium", customerName, 0, hashedPassword, customerNickname]);
            num++;
        }

        for(let i = 0; i < normalUserCount; i++)
        {
            let butget = butgetGenerator();
            let customerName = "Müşteri " + num;
            let customerNickname = "musteri" + num;
            let password = "123";
            let hashedPassword = await bcrypt.hash(password, 10);

            await db.execute("INSERT INTO customers (Budget, CustomerType, CustomerName, TotalSpent, Password, CustomerNickname) VALUES (?,?,?,?,?,?)", [butget, "Normal", customerName, 0, hashedPassword, customerNickname]);
            num++;
        }
        res.json({ message: 'Kullanıcılar başarıyla oluşturuldu!', hata: 0 });
    }
    catch(e)
    {
        res.json({ message: 'Bir hata oluştu: ' + e.toString(), hata: 1 });
    }
});


app.post("/api/reset_products", async function(req,res) {
        try{
            //tum urunleri sil
            await db.execute("DELETE FROM products");

            //default urunler
            await db.execute("INSERT INTO products (ProductName, Stock, Price) VALUES (?,?,?)", ["Product1", 500, 100]);
            await db.execute("INSERT INTO products (ProductName, Stock, Price) VALUES (?,?,?)", ["Product2", 10, 50]);
            await db.execute("INSERT INTO products (ProductName, Stock, Price) VALUES (?,?,?)", ["Product3", 200, 45]);
            await db.execute("INSERT INTO products (ProductName, Stock, Price) VALUES (?,?,?)", ["Product4", 75, 75]);
            await db.execute("INSERT INTO products (ProductName, Stock, Price) VALUES (?,?,?)", ["Product5", 0, 500]);
            res.json({ message: 'Ürünler başarıyla oluşturuldu!', hata: 0 });
        } 
        catch(e)
        {
            res.json({ message: 'Bir hata oluştu: ' + e.toString(), hata: 1 });
        }
});

app.post('/api/stocks', async function(req, res){
    const [urunler,] = await db.execute("SELECT ProductName, Stock FROM products");

    if(urunler.length == 0)
    {
        res.status(500).send('Veritabanı hatası');
        return;
    }

    res.json({urunler: urunler});
});

app.get("/api/delete_product/:id", async function(req, res) {

    const id = req.params.id;
    console.log(id);

    const [kontrol,] = await db.execute("SELECT * FROM products WHERE ProductID = ?", [id]);

    if(kontrol.length == 0)
    {
        res.status(404).json({ success: false, message: 'Ürün bulunamadı.' });
    }

    await db.execute("DELETE FROM products WHERE ProductID = ?", [id]);

    res.status(200).json({ success: true, message: 'Ürün başarıyla silindi.' });

});

app.post("/api/edit/:id", async function(req, res) {

    const product_data = req.body;
    const id = req.params.id;
    console.log(product_data);
    console.log(id);

    const [kontrol,] = await db.execute("SELECT * FROM products WHERE ProductID = ?", [id]);

    if(kontrol.length == 0)
    {
        res.status(404).json({ success: false, message: 'Ürün bulunamadı.' });
    }

    await db.execute("UPDATE products SET ProductName = ?, Stock = ?, Price = ? WHERE ProductID = ?", [product_data.urunAdi, product_data.stok, product_data.fiyat, id]);

    res.status(200).json({ success: true, message: 'Ürün başarıyla güncellendi. '});
});

app.post("/api/user/register", async function(req,res) {
    const { nick, isim, tip, password, repassword } = req.body;
    console.log(nick, isim, tip, password, repassword);

    if(nick.length > 255 || nick.length <= 0)
    {
        res.json({ message: 'Kullanıcı adı 255 karakterden uzun olamaz!', hata: 1 });
        return;
    }
    if(password.length <= 0)
    {
        res.json({ message: 'Şifre boş olamaz!', hata: 1 });
        return;
    }
    if(isim.length <= 0)
    {
        res.json({ message: 'İsim boş olamaz!', hata: 1 });
    }
    if(password != repassword)
    {
        res.json({ message: 'Şifreler eşleşmiyor!', hata: 1 });
    }

    if(tip == 0)
    {
        tiptype = 'Normal';
    }
    else if(tip == 1)
    {
        tiptype = 'Premium';
    }

    try{

        const [kullanici,] = await db.execute("SELECT * FROM customers WHERE CustomerNickname = ?", [nick]);

        if(kullanici != 0)
        {
            res.json({ message: 'Nickname önceden alınmış!', hata: 1 });
        }

        let hashedPassword = await bcrypt.hash(password, 10);

        await db.execute("INSERT INTO customers (CustomerNickname, CustomerName, CustomerType, Password, Budget, TotalSpent) VALUES (?,?,?,?,0,0)", [nick, isim, tiptype, hashedPassword]);

        res.json({ message: 'Kayıt Oluşturuldu.', hata: 0 });
    }
    catch(e)
    {
        res.json({ message: 'Bir hata oluştu: ' + e.toString(), hata: 1 });
    }
});

app.post('/api/increase-budget', async (req, res) => {
    const { customerId } = req.body; // Gövde verisinden müşteri ID'sini alın
    console.log(customerId);
    if (!customerId) {
        return res.status(400).json({ error: 'CustomerID gerekli!' });
    }

    try {
        // Veritabanında Budget değerini artır
        const [result] = await db.execute(`
            UPDATE customers 
            SET Budget = Budget + 1 
            WHERE CustomerID = ?`
        , [customerId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Müşteri bulunamadı!' });
        }

        res.json({ success: true, message: 'Budget artırıldı!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});


app.post("/api/siparis_olustur", async function(req, res) {
    //console.log(req.body);
    const { urunAdi , adet } = req.body;
    console.log(urunAdi, adet);

    try{
        const [urunler,] = await db.execute("SELECT * FROM products WHERE ProductID = ?", [urunAdi]);

        if(urunler.length == 0)
        {
            res.json({ message: 'Ürün bulunamadı.', hata: 1 });
            return;
        }

        const urun = urunler[0];
        const ProductIDR = urun.ProductID;
        const urunFiyat = urun.Price;
        const totalPrice = urunFiyat * adet;
        console.log(totalPrice);

        /*if(adet > urunStok)
        {
            res.json({ message: 'Stok yetersiz.', hata: 1 });
            return;
        }*/

        const [kontrol,] = await db.execute("SELECT * FROM orders WHERE ProductIDR = ? AND OrderStatus = ?", [ProductIDR, 0]);

        if(kontrol.length > 0)
        {
            res.json({ message: 'Bu ürün için zaten bekleyen sipariş var.', hata: 1 });
            return;
        }

        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const CustomerIDR = decoded.id;

        const [musteri,] = await db.execute("SELECT * FROM customers WHERE CustomerID = ?", [CustomerIDR]);
        if(musteri.length == 0)
        {
            res.json({ message: 'Müşteri bulunamadı.', hata: 1 });
            return;
        }
        const musteriAdi = musteri[0].CustomerName;
        const musteriTipi = musteri[0].CustomerType;
        const dateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        console.log(dateTime);

        //siparis olusturma
        await db.execute("INSERT INTO orders (ProductIDR, OrderDate, OrderStatus, Quantity, TotalPrice, CustomerIDR) VALUES (?,?,?,?,?,?)", [ProductIDR, dateTime, 0, adet, totalPrice, CustomerIDR]);
        console.log("xd");

        const [orders,] = await db.execute("SELECT * FROM orders WHERE OrderDate = ?", [dateTime]);
        if(orders.length == 0)
        {
            res.json({ message: 'Sipariş oluşturulamadı.', hata: 1 });
            return;
        }

        
        const orderID = orders[0].OrderID;
        console.log(orderID);
        const log_string = musteriAdi + " (" + musteriTipi + ") " + " adlı müşteri " + urun.ProductName + " ürününden " + adet + " adet sipariş verdi";
        //log olusturma
        await db.execute("INSERT INTO logs (CustomerIDR, OrderIDR, LogDate, LogType, LogDetails) VALUES (?,?,?,?,?)", [CustomerIDR, orderID, dateTime, 0, log_string]);

        //thread
        const worker = new Worker('./orderWorker.js', {
            workerData: {
                orderId: orderID,
                customerId: CustomerIDR,
                timeout: 1 * 60 * 1000 // 5 dakika
            }
        });

        workers.set(orderID, worker); //liste thread'i ekle
        
        worker.on('message', async function(message){
            if(message.type === "timeout")
            {
                console.log(`${message.orderId} idli sipariş iptal edildi.`);
                workers.delete(orderID);
                /*
                const [order,] = await db.execute(`SELECT * FROM orders WHERE OrderID = ?`, [message.orderId]);
                if(order.length > 0 && order[0].OrderStatus === 0)
                {
                    await db.execute(`UPDATE orders SET OrderStatus = ? WHERE OrderID = ?`, [-1, message.orderId]);
                    const time = moment().format('YYYY-MM-DD HH:mm:ss');
                    const text = message.orderId + " idli sipariş zaman aşımından dolayı iptal edildi";
                    //log olusturma
                    await db.execute("INSERT INTO logs (CustomerIDR, OrderIDR, LogDate, LogType, LogDetails) VALUES (?, ?, ?, ?, ?)", [CustomerIDR, message.orderId, time, -1, text]);
                }
                */
            }
        });

        worker.on('error', function(err){
            console.log(err.message);
            workers.delete(orderID);
        });

        worker.on('exit', function(code){
            if(code !== 0)
            {
                console.log(`Worker thread hatasıyla kapatıldı. Code: ${code}`);
            }
            workers.delete(orderID);
        });

        res.json({ message: 'Sipariş başarıyla oluşturuldu.', hata: 0 });
    }
    catch(e)
    {
        res.json({ message: 'Bir hata oluştu: ' + e.toString(), hata: 1 });
    }

    
});

app.listen(3001, function()
{
    console.log("listening on port 3001");
});