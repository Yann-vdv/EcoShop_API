import mysql from 'mysql';

const connection = mysql.createConnection({
    host: "mysql-effikiba.alwaysdata.net",
    user: "effikiba",
    password: "kiba5792",
    database: "effikiba_ecoshop",
})

// const connection = mysql.createConnection({
//     host: "127.0.0.1",
//     user: "root",
//     password: "",
//     database: "bdd_list_courses",
// })

connection.connect((err) => {
    if (err) throw err;
    console.log("Connecté à la base de données");
})

export default connection;