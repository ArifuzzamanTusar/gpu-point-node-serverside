const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@gpu-point.o7ldd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const startServe = async () =>{
    try{
        await client.connect();
        const productCollections = client.db('gpu-point').collection('products');

        app.get("/all-products", async (req,res) =>{
            const cursor = productCollections.find({});
            const products = await cursor.toArray();
            res.status(200).send(products);
        })
        

        
    }
    finally{

    }

}

startServe().catch(console.dir);


app.get("/", (req,res) =>{
    res.json({
        mgs : "hellow Im working",
    })
})


app.listen(port, () => {
    console.log("Running on  " + port);
})