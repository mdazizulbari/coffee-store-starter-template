const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

// jwt middleware
const verifyJWT = (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  if (!token) return res.status(401).send({ message: "Unauthorized Access!" });
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "Unauthorized Access!" });
    }
    if (decoded) {
      console.log(decoded);
    }
    req.tokenEmail = decoded.email;
    next();
  });
};

async function run() {
  try {
    const database = client.db("conceptual-coffeeDB");
    const coffeeCollection = database.collection("coffees");
    const orderCollection = database.collection("orders");

    // generate jwt token
    app.post("/jwt", (req, res) => {
      // user is payload/data
      const user = { email: req.body.email };

      // token creation (payload/data encode)
      const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",
      });
      res.send({ token, message: "JWT created successfully" });
    });

    app.get("/coffees", async (req, res) => {
      const allCoffees = await coffeeCollection.find().toArray();
      // console.log(allCoffees);
      res.send(allCoffees);
    });

    // save a coffee data in database
    app.post("/add-coffee", async (req, res) => {
      const coffeeData = req.body;
      const quantity = coffeeData.quantity;
      coffeeData.quantity = Number(quantity);
      const result = await coffeeCollection.insertOne(coffeeData);
      // console.log(result);
      res.status(201).send({ ...result, message: "got the data" });
    });

    // get single coffee by id
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const coffee = await coffeeCollection.findOne(filter);
      // console.groupCollapsed(coffee);
      res.send(coffee);
    });

    app.get("/my-coffees/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const coffees = await coffeeCollection.find(filter).toArray();
      // console.groupCollapsed(coffees);
      res.send(coffees);
    });

    // handle like toggle
    app.patch("/like/:coffeeId", async (req, res) => {
      const id = req.params.coffeeId;
      const email = req.body.email;
      const filter = { _id: new ObjectId(id) };
      const coffee = await coffeeCollection.findOne(filter);
      // check if the user have already liked the coffee or not
      const alreadyLiked = coffee?.likedBy.includes(email);
      const updateDoc = alreadyLiked
        ? {
            $pull: { likedBy: email },
            // dislike (pops email form array)
          }
        : {
            // : { $push: { likedBy: email } };
            // this can push one email multiple times
            $addToSet: { likedBy: email },
            // like (pushes email into array)
          };
      const result = await coffeeCollection.updateOne(filter, updateDoc);
      res.send({
        message: alreadyLiked ? "Dislike successful" : "Like successful",
        liked: !alreadyLiked,
      });
    });

    // handle order
    // save a coffee data in database
    app.post("/place-order/:coffeeId", async (req, res) => {
      const id = req.params.coffeeId;
      const orderData = req.body;
      const result = await orderCollection.insertOne(orderData);
      if (result.acknowledged) {
        // update quantity from coffee collection
        await coffeeCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $inc: { quantity: -1 },
          }
        );
      }
      res.status(201).send({ result });
    });
    // get all orders by customer email
    app.get("/my-orders/:email", verifyJWT, async (req, res) => {
      // const token = req?.headers?.authorization?.split(" ")[1];
      // if (token) {
      //   jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      //     if (err) {
      //       console.log("error---------->", err);
      //     }
      //     if (decoded) {
      //       console.log(decoded);
      //     }
      //   });
      // } else {
      //   return res.send({message: "who the fuck are you"})
      // }
      const decodedEmail = req.tokenEmail;
      const email = req.params.email;

      if (decodedEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access!" });
      }

      const filter = { customerEmail: email };
      const allOrders = await orderCollection.find(filter).toArray();
      for (const order of allOrders) {
        const orderId = order.coffeeId;
        const fullCoffeeData = await coffeeCollection.findOne({
          _id: new ObjectId(orderId),
        });
        order.name = fullCoffeeData.name;
        order.photo = fullCoffeeData.photo;
        order.price = fullCoffeeData.price;
        order.quantity = fullCoffeeData.quantity;
      }
      // console.log(allOrders);
      res.send(allOrders);
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
