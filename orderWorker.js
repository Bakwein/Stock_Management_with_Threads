const { parentPort, workerData } = require('worker_threads');
const db = require("./data/db");
const moment = require('moment');

const { orderId, customerId,  timeout } = workerData;

async function monitorOrder(){

    try{
        const timer = setTimeout(async function() {
            console.log("timout func.");
            const [results,] = await db.execute(`SELECT OrderStatus FROM orders WHERE OrderID = ?`, [orderId]);
            console.log(results);
        
    
            if(results.length > 0 && results[0].OrderStatus === 0){
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
        clearTimeout(timer);
        parentPort.close();
    }, timeout);

    //admin onayı bekleme
    parentPort.on("message", async function(message){
        if(message.type = "approve"){
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