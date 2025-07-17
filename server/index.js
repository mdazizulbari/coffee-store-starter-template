const express = require("express");
require("dotenv").config();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const database = client.db("conceptual-coffeeDB");
    const coffeeCollection = database.collection("coffees");

    app.get("/coffees", async (req, res) => {
      const allCoffees = await coffeeCollection.find().toArray();
      console.log(allCoffees);
      res.send(allCoffees);
    });

    // save a coffee data in database
    app.post("/add-coffee", async (req, res) => {
      const coffeeData = req.body;
      const result = await coffeeCollection.insertOne(coffeeData);
      console.log(result);
      res.status(201).send({ ...result, message: "got the data" });
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // vercel deployment dose not work with the above line

    // Send a ping to confirm a successful connection
    // always keep this at the very bottom of the try block, or else vercel will not work properly with the lines below it
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // keep this if your server needs too much security
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to coffee store server");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
