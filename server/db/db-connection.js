const pool = mysql.createPool({
    host: 'localhost',   
    user: 'root',     
    password: 'password',
    database: 'webbank',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
