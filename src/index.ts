import express from "express";
import bodyParser from "body-parser";
import connection from "./database";

const app = express();

app.use(express.json());
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

//Port :
const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log(`Ecoute le port ${port}`);
});

// products requests :

app.get("/product", async (req, res) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = (page - 1) * limit;
    const query = "SELECT * FROM product LIMIT ?,?";
    connection.query(query,[offset,limit], (error, results) => {
        res.status(200).json(results);
    });
});

app.get("/product/:id", async (req, res) => {
    const query = "SELECT * FROM product WHERE id = ?";
    connection.query(query, [req.params.id], (error, results) => {
        if (!results) {
            res.status(204).json({ response: "Ce produit n'existe pas" });
        } else {
            res.status(200).json(results[0]);
        }
    });
});

app.get("/product/category/:category", async (req, res) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = (page - 1) * limit;
    const query = "SELECT * FROM product LEFT JOIN category ON product.category = category.id WHERE category.id = ? LIMIT ?,?";
    connection.query(query, [req.params.category,offset,limit], (error, results) => {
        res.status(200).json(results);
    });
});

// category requests :

app.get("/category", async (req, res) => {
    connection.query("SELECT * FROM category", (error, results) => {
        res.status(200).json(results);
    });
});

app.get("/category/:id", async (req, res) => {
    const query = "SELECT * FROM category WHERE id = ?";
    connection.query(query, [req.params.id], (error, results) => {
        if (!results) {
            res.status(204).json({ response: "Cette catégorie n'existe pas" });
        } else {
            res.status(200).json(results[0]);
        }
    });
});