const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// Middleware functions
app.use(cors());
app.use(express.json());

// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.juclx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("watch_store");
        const productsCollection = database.collection("products");
        const usersCollection = database.collection("users");
        const ordersCollection = database.collection("orders");

        // POST API to add product
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result)
        });

        // GET API to get all products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // GET API to get a single product by id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        });

        // DELETE API to delete product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        });

        // POST API to add user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // PUT API to update user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // PUT API to update user role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // GET Api to check role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // POST API to add order
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });

        // GET API to get all orders
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // PUT API to update order status
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body.status;
            const filter = { _id: ObjectId(id) };
            const updateDoc = { $set: { status: updateStatus } };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // POST API to get orders by email
        app.post('/orders/byemail', async (req, res) => {
            const email = req.body;
            const filter = { email: { $in: email } };
            const products = await ordersCollection.find(filter).toArray();
            res.send(products);
        });

        // DELETE API to delete order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        // console.log('Successfully database connected');
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Node server is running');
});

app.listen(port, () => {
    console.log('Listening at', port);
});



/*
One time:
1. heroku account open
2. Heroku software install
-------------
Every project
1. git init
2. .gitignore (node_module, .env)
3. push everything to git
4. make sure you have this script:  "start": "node index.js",
5. make sure: put process.env.PORT in front of your port number
6. heroku login
7. heroku create (only one time for a project)
8. command: git push heroku main
-------
update:
1. save everything and check locally
2. git add, git commit-m", git push
2. git push heroku main
*/