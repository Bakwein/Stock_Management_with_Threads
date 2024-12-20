const db = require("./data/db");
const bcrypt = require('bcryptjs');

async function create_customer_table()
{
    try{
        await db.execute(`CREATE TABLE IF NOT EXISTS customers (
            Budget float NOT NULL,
            CustomerType varchar(45) NOT NULL,
            CustomerID int NOT NULL AUTO_INCREMENT,
            CustomerName varchar(255) NOT NULL,
            TotalSpent float NOT NULL,
            Password varchar(255) NOT NULL,
            CustomerNickname varchar(255) NOT NULL,
            PRIMARY KEY (CustomerID),
            UNIQUE KEY CustomerID_UNIQUE (CustomerID),
            UNIQUE KEY CustomerNickname_UNIQUE (CustomerNickname)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`);
        console.log("customers table is created");
    }
    catch(err)
    {
        console.log("customer table creation error :" +err);
    }
}

async function create_products_table()
{
    try{
        await db.execute(`CREATE TABLE IF NOT EXISTS products (
            ProductID int NOT NULL AUTO_INCREMENT,
            ProductName varchar(255) NOT NULL,
            Stock int NOT NULL,
            Price float NOT NULL,
            PRIMARY KEY (ProductID),
            UNIQUE KEY ProductID_UNIQUE (ProductID)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`);
        console.log("products table is created");
    }
    catch(err)
    {
        console.log("products table creation error :" +err);
    }
}

async function create_orders_table()
{
    try{
        await db.execute(`CREATE TABLE IF NOT EXISTS orders (
            TotalPrice float NOT NULL,
            OrderID int NOT NULL AUTO_INCREMENT,
            CustomerIDR int NOT NULL,
            ProductIDR int NOT NULL,
            Quantity float NOT NULL,
            OrderDate datetime NOT NULL,
            OrderStatus int NOT NULL,
            PRIMARY KEY (OrderID),
            KEY CustomerIDR_idx (CustomerIDR),
            KEY ProductIDR_idx (ProductIDR),
            CONSTRAINT fk_customer FOREIGN KEY (CustomerIDR) REFERENCES customers (CustomerID) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT fk_product FOREIGN KEY (ProductIDR) REFERENCES products (ProductID) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE KEY OrderID_UNIQUE (OrderID)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`);
        console.log("orders table is created");
    }
    catch(err)
    {
        console.log("orders table creation error :" +err);
    }
}

async function create_logs_table()
{
    try{
        await db.execute(`CREATE TABLE IF NOT EXISTS logs (
            LogID int NOT NULL AUTO_INCREMENT,
            CustomerIDR int NOT NULL,
            OrderIDR int NOT NULL,
            LogDate datetime NOT NULL,
            LogType int NOT NULL,
            LogDetails text NOT NULL,
            PRIMARY KEY (LogID),
            CONSTRAINT fk_customer2 FOREIGN KEY (CustomerIDR) REFERENCES customers (CustomerID) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT fk_order FOREIGN KEY (OrderIDR) REFERENCES orders (OrderID) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE KEY LogID_UNIQUE (LogID)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`);

    }
    catch(err)
    {
        console.log("logs table creation error :" +err);
    }
}


create_customer_table();
create_products_table();
create_orders_table();
create_logs_table();