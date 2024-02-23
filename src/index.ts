import express from "express";
import bodyParser from "body-parser";
import connection from "./database";
import sharp from "sharp";
import fs from "fs";
import path from "path";

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

//Product requests :

app.get("/productCount", async (req, res) => {
    connection.query("SELECT COUNT(*) AS count FROM product", (error, results) => {
        if (error) {
            res.status(400).json(error);
        } else {
            res.status(200).json(results[0]);
        }
    });
});

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

app.put("product/:id/order", async (req, res) => {
    const getQuantityQuerry = "SELECT quantity FROM product WHERE id = ?";
    connection.query(getQuantityQuerry, [req.params.id], (error, results1) => {
        if (!results1) {
            res.status(204).json({ response: "Ce produit n'existe pas" });
        } else {
            const query = "UPDATE product SET quantity = ? WHERE product.id = ?;"
            const newQuantity = parseInt(results1[0]) - 1;
            if (newQuantity >= 0) {
                connection.query(query, [newQuantity,req.params.id], (error, results) => {
                    if (!results) {
                        res.status(204).json({ response: "Ce produit n'existe pas" });
                    } else {
                        res.status(200).json(results[0]);
                    }
                });
            } else {
                res.status(400).json({ response: "Ce produit n'est déjà plus disponible" });
            }
        }
    });
})

app.get("/product/category/:category", async (req, res) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = (page - 1) * limit;
    const query = "SELECT * FROM product LEFT JOIN category ON product.category = category.id WHERE category.id = ? LIMIT ?,?";
    connection.query(query, [req.params.category,offset,limit], (error, results) => {
        res.status(200).json(results);
    });
});

//Category requests :

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

//Images :

app.use(express.static('public'));

//   Méthode avec stockage local des images après avoir modifié la taille (econnomie calcul mais prend plus de place)
//   app.get('/image/:imageName', async (req, res) => {
//     const imageName = req.params.imageName;
//     const imagePath = `public/images/${imageName}`;
//     const resizedImagePath = `public/resized/${imageName}`;
  
//     if (fs.existsSync(imagePath)) {
//       await sharp(imagePath)
//         .resize(300, 300)
//         .toFile(resizedImagePath);
  
//       res.sendFile(resizedImagePath);
//     } else {
//       res.status(404).json({ error: 'Image not found' });
//     }
//   })

app.get('/image/:imgName', async (req, res) => {
    const imgName = req.params.imgName;
    const width = parseInt(req.query.width as string) || 400;
    const height = parseInt(req.query.height as string) || 400;
    const imgPath = path.resolve(`public/images/${imgName}`);
  
    if (fs.existsSync(imgPath)) {
      sharp(imgPath)
        .resize(width, height)
        .toBuffer((err, buffer) => {
          if (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
          }
  
          res.type('image/png');
          res.end(buffer);
        });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  });
  
  app.get('/imageOrigin/:imgName', async (req, res) => {
    const imgName = req.params.imgName;
    const imgPath = path.resolve(`public/images/${imgName}`);
  
    if (fs.existsSync(imgPath)) {
        res.sendFile(imgPath);
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  });