const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@gpu-point.o7ldd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const startServe = async () => {
    try {
        await client.connect();
        const productCollection = client.db('gpu-point').collection('products');

        // -jwt 
        app.post("/login", async (req, res) => {
            const userEmail = req.body;
            const token = jwt.sign(userEmail, process.env.ACCESSTOKEN);
            res.send({ token });

        });

        app.get("/all-products", async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.status(200).send(products);
        });

        //add one
        app.post('/product/add', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);

            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        // api get single product -------------------------------------
        app.get('/product/:productId', async (req, res) => {
            const id = req.params.productId;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        
        // api product stock----------------------------------
        app.put('/product/:productId', async (req, res) => {
            const id = req.params.productId;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            if (updatedProduct.newQuantity && updatedProduct.newSold) {
                const updatedDoc = {
                    $set: {
                        quantity: updatedProduct.newQuantity,
                        sold: updatedProduct.newSold,
                    }
                }

                const result = await productCollection.updateOne(filter, updatedDoc, options);
                res.send(result);
            } else {
                const updatedDoc = {
                    $set: {
                        quantity: updatedProduct.newQuantity,
                    }
                }

                const result = await productCollection.updateOne(filter, updatedDoc, options);
                res.send(result);
            }
        });





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