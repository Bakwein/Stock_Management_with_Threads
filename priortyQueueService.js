const db = require('./data/db');
const moment = require('moment');

class PriortyQueue
{
    constructor() // default const.
    {
        this.items = [];
    }

    //eleman ekle
    enqueue(threadData)
    {
        this.items.push(threadData);
        this.items.sort((a, b) => b.oncelikSkoru  - a.oncelikSkoru );
    }

    //eleman sil
    dequeue()
    {
        return this.items.shift();
    }

    //ilk elemanı döndür
    front()
    {
        return this.items[0];
    }

    //boş mu kontrol
    isEmpty()
    {
        return this.items.length == 0;
    }

    //clear
    clear()
    {
        this.items = [];
    }

    //print
    printQueue()
    {
        console.log("Priority Queue:", this.items);
    }

}

const priortyQueue = new PriortyQueue();

async function updatePriortyQueue()
{
    try{
        const response = await fetch('http://localhost:3001/api/threads', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const threads = await response.json();
        //console.log(threads);

        priortyQueue.clear();
        for (const thread of threads) {
            if (thread.oncelikSkoru != null) {
                priortyQueue.enqueue(thread);
                console.log("Thread Order ID: " + thread.orderId);
                const [order,] = await db.execute(`SELECT * FROM orders WHERE OrderID = ?`, [thread.orderId]);
                console.log(order[0].OrderStatus);
                if(order[0].OrderStatus == 0) //0da 1 yap
                {
                    await db.execute(`UPDATE orders SET OrderStatus = ? WHERE OrderID = ?`, [1, thread.orderId]);
                    //log at -> Müşteri 1 (premium) siparişi işleme alındı
                    const [customer,] = await db.execute(`SELECT * FROM customers WHERE CustomerID = ?`, [order[0].CustomerIDR]);

                    const time = moment().format('YYYY-MM-DD HH:mm:ss');
                    const text = order[0].CustomerIDR + " idli müşterinin(" + customer[0].CustomerName+ ")," + order[0].OrderID + " idli sipariş işleme alındı";
                    await db.execute("INSERT INTO logs (CustomerIDR, OrderIDR, LogDate, LogType, LogDetails) VALUES (?, ?, ?, ?, ?)", [order[0].CustomerIDR, order[0].OrderID, time, 1, text]);
                }
            }
        }

        //priortyQueue.printQueue();

    }
    catch(err)
    {
        console.log(err);
    }
}

setInterval(updatePriortyQueue, 1000);

module.exports = priortyQueue;