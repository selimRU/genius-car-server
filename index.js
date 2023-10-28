const express = require('express')
require('dotenv').config()
const cors = require('cors')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000

// MTED1e8a9NQHXJ3k
// geniusCarDB
// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('hello car')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nc6s3b6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const serviceCollections = client.db("geniusCarDB").collection("services")
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await serviceCollections.findOne(query)
            res.send(result)
        })
        app.get('/services', async (req, res) => {
            const cursor = serviceCollections.find()
            const result = await cursor.toArray()
            console.log(result);
            res.send(result)
        })
        // app.post('/services', async (req, res) => {
        //     const services = req.body
        //     const result = await serviceCollections.insertOne(services)
        //     res.send(result)
        // })
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})