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

async function create_admin_table()
{
    try{
        await db.execute(`CREATE TABLE IF NOT EXISTS admin (
            AdminID int(10) unsigned zerofill NOT NULL AUTO_INCREMENT,
            Nickname varchar(255) NOT NULL,
            Password varchar(255) NOT NULL,
            PRIMARY KEY (AdminID)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`);
        console.log("admin table is created");

    }
    catch(err)
    {
        console.log("admin table creation error :" +err);
    }
}


async function create_admin(nickname, password)
{
    try{
        const [ret,] = await db.execute(`SELECT * FROM admin WHERE Nickname = ?`, [nickname]);
        if(ret.length > 0)
        {
            //console.log("admin already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(`INSERT INTO admin (Nickname, Password) VALUES (?, ?)`, [nickname, hashedPassword]);
    }
    catch(err)
    {
        console.log("admin creation error :" +err);
    }
}

async function create_default_table()
{
    try{
        await db.execute(`CREATE TABLE IF NOT EXISTS control (
            idcontrol int NOT NULL AUTO_INCREMENT,
            status int NOT NULL,
            PRIMARY KEY (idcontrol),
            UNIQUE KEY idcontrol_UNIQUE (idcontrol)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`);
        console.log("default table is created");

        const [controls] = await db.execute("SELECT * from control WHERE idcontrol = 1");
        if(controls.length > 0)
        {
            return;
        }
        await db.execute("INSERT INTO control (idcontrol, status) VALUES (1, 0)");
        console.log("kontrol id=1 eklendi");        
    }
    catch(err)
    {
        console.log("default table creation error :" +err);
    }
}

create_customer_table();
create_products_table();
create_orders_table();
create_logs_table();
create_default_table();

//admin
create_admin("admin", "admin");
create_admin("admin2", "123");

//default products