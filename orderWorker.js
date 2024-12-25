const { parentPort, workerData } = require('worker_threads');
const db = require("./data/db");
const moment = require('moment');

const { orderId, customerId, productId, customerType,  timeout } = workerData;

let beklemeSuresi = 0;
const beklemeSuresiAgirligi = 0.5;

const premiumOncelikSkoru = 15;
const normalOncelikSkoru = 10;

async function monitorOrder(){

    try{

        const interval = setInterval(async function(){
            beklemeSuresi += 1;
            oncelikSkoru = (customerType === "Premium") 
            ? premiumOncelikSkoru + beklemeSuresiAgirligi * beklemeSuresi 
            : normalOncelikSkoru + beklemeSuresiAgirligi * beklemeSuresi;

            //bekleme suresi mesajı
            parentPort.postMessage({
                type: "oncelikSkoru",
                orderId: orderId,
                productId: productId,
                oncelikSkoru: oncelikSkoru,
                beklemeSuresi: beklemeSuresi
            });

            //console.log("order id:" + orderId  + " oncelikSkoru: " + oncelikSkoru);        
        },  1000); // 1 saniyede 1


        const timer = setTimeout(async function() {
            console.log("timout func.");
            const [results,] = await db.execute(`SELECT OrderStatus FROM orders WHERE OrderID = ?`, [orderId]);
            console.log(results);
        
    
            if(results.length > 0 && (results[0].OrderStatus === 0 || results[0].OrderStatus === 1)){
            //siparis iptal edildi
                await db.execute(`UPDATE orders SET OrderStatus = ? WHERE OrderID = ?`, [-1, orderId]);
            
                console.log("timout'a düştü!");
                const time = moment().format('YYYY-MM-DD HH:mm:ss');
                const text = orderId + " idli sipariş zaman aşımından dolayı iptal edildi";
                //log olusturma
                await db.execute("INSERT INTO logs (CustomerIDR, OrderIDR, LogDate, LogType, LogDetails) VALUES (?, ?, ?, ?, ?)", [customerId, orderId, time, -1, text]);
            
                parentPort.postMessage({
                    type: "timeout",
                    orderId: orderId
                });
            }
    
            //threadi sonlandır
            clearTimeout(interval);
            parentPort.close();
        }, timeout);


        //admin onayı bekleme
        parentPort.on("message", async function(message){
            if(message.type = "approve"){
                console.log("approve message for order id: " + orderId);
                clearTimeout(timer);
                parentPort.close();
            }
        });
    
    }
    catch(err){
        console.log(err);
    }
}

   
monitorOrder();