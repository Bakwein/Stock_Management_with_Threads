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
        threads.forEach((thread) => {
            if(thread.oncelikSkoru != null)
            {
                priortyQueue.enqueue(thread);
            }
        });

        //priortyQueue.printQueue();

    }
    catch(err)
    {
        console.log(err);
    }
}

setInterval(updatePriortyQueue, 1000);

module.exports = priortyQueue;