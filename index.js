const express = require('express')
require('dotenv').config()
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000

// MTED1e8a9NQHXJ3k
// geniusCarDB
// middleware
app.use(cors(
    {
        origin: ['http://localhost:5173'],
        credentials: true
    }
))
app.use(express.json())
app.use(cookieParser())

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
        const cartCollections = client.db("geniusCarDB").collection("cart")

        const logger = async (req, res, next) => {
            // req.host,req.originalUrl
            next()
        }

        const veryfyToken = async (req, res, next) => {
            const token = req.cookies?.access_token
            if (!token) {
                return res.status(401).send({ message: 'unathorized' })
            }
            jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'unathorized' })
                }
                req.user = decoded
                next()
            })
        }
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await serviceCollections.findOne(query)
            res.send(result)
        })
        app.get('/services', async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const result = await serviceCollections.find()
                .skip(page * size)
                .limit(size)
                .toArray()
            // console.log(result);
            res.send(result)
        })
        app.get('/cart', logger, veryfyToken, async (req, res) => {
            // console.log(req.cookies.access_token);
            // console.log(req.user);
            // console.log(req.query.email);
            const query = { email: req.query?.email }
            //    i can do like this following
            // let query = {};
            // if (req.query?.email) {
            //     query = { email: req.query.email }
            //     console.log(query);
            // }
            const result = await cartCollections.find(query).toArray();
            // console.log(result);
            res.send(result);
        })
        app.get('/servicesCount', async (req, res) => {
            const count = await serviceCollections.estimatedDocumentCount()
            console.log(count);
            // console.log(result);
            res.send({ count });
        })
        app.post('/cart', async (req, res) => {
            const services = req.body
            const result = await cartCollections.insertOne(services)
            res.send(result)
        })
        app.post("/jwt", (req, res) => {
            const body = req.body;
            const token = jwt.sign(body, process.env.JWT_TOKEN, { expiresIn: '1h' });
            res
                .cookie("access_token", token, {
                    httpOnly: true,
                    secure: false,

                })
                .status(200)
                .send({ message: "Logged in successfully 😊 👌", token });
        });
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})