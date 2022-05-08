const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// ---Middleware 
app.use(cors());
app.use(express.json());

// jwt verification-----------------------------------------------
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESSTOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}





const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@gpu-point.o7ldd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const startServe = async () => {
    try {
        await client.connect();
        const productCollection = client.db('gpu-point').collection('products');


        // jwt token AUTH---------------------------------Done
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESSTOKEN, { expiresIn: '1d' });
            res.send({ accessToken });
        })

        // Get All Products-------------------------- done

        app.get("/all-products", async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.status(200).send(products);
        });
        // ------------------------------------------

        // api get all products and filter by page and pagination-------------- ~~~
        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            let products;
            const cursor = productCollection.find(query);

            if (page || size) {
                products = await cursor.skip(page * size).limit(size).toArray();
            } else {
                products = await cursor.toArray();
            }

            res.send(products);
        })
        // --------------------------------

        // api insert product --------------------------------------------done
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });
        // ----------------------------------



        // api get single product ------------------------------------- Done
        app.get('/product/:productId', async (req, res) => {
            const id = req.params.productId;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });
        // api delete product----------------------------------------- Done
        app.delete('/product/:productId', async (req, res) => {
            const id = req.params.productId;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });



        // api product stock----------------------------------Done
        app.put('/product/:productId', async (req, res) => {
            const id = req.params.productId;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            if (updatedProduct.newStock && updatedProduct.newSold) {
                const updatedDoc = {
                    $set: {
                        stock: updatedProduct.newStock,
                        sold: updatedProduct.newSold,
                    }
                }

                const result = await productCollection.updateOne(filter, updatedDoc, options);
                res.send(result);
            } else {
                const updatedDoc = {
                    $set: {
                        stock: updatedProduct.newStock,
                    }
                }

                const result = await productCollection.updateOne(filter, updatedDoc, options);
                res.send(result);
            }
        });
        // -----------------------------------------------



        // products count------------------------------------------- DONE
        app.get('/products-count', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count });
        })
        // ---------------------------------------------


        // my products with JWT verification--------------------------------
        app.get('/my-products', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;

            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = productCollection.find(query);
                const myProducts = await cursor.toArray();
                res.send(myProducts);
            } else {
                res.status(403).send({ message: 'forbidden access' });
            }
        })



    }
    finally {

    }

}

startServe().catch(console.dir);


app.get("/", (req, res) => {
    res.json({
        mgs: "hellow Im working",
    })
})


app.listen(port, () => {
    console.log("Running on  " + port);
})