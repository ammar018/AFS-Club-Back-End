const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;

app.use((req, res, next) => {
  const method = req.method;
  const url = req.url;
  const timestamp = new Date();

  console.log(`[${timestamp}] ${method} request to ${url}`);

  res.on("finish", () => {
    console.log(`[${timestamp}] Response status: ${res.statusCode}`);
  });

  next();
});

const path = require("path");
const imagePath = path.resolve(__dirname, "images");

app.use("/images", express.static(imagePath));

app.get("/images", (req, res, next) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("You done goofed(did not find static file)");
  next();
});

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});

let db;
MongoClient.connect("mongodb+srv://ammarashfaq16:System@21@cluster0.nclat.mongodb.net/", (err, client) => {
  if (err) throw err;
  db = client.db("webstore");
  console.log("Connected to MongoDB");
});

app.get("/", (req, res, next) => {
  res.send("Select a collection, e.g., /collection/messages");
});

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

app.get("/collection/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(results);
  });
});

const ObjectID = require("mongodb").ObjectID;

app.post("/collection/:collectionName", (req, res, next) => {
  req.collection.insert(req.body, (e, results) => {
    if (e) return next(e);
    res.send(results.ops);
  });
});

app.get("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
    if (e) return next(e);
    res.send(result);
  });
});

app.put("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.update(
    { _id: new ObjectID(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    (e, result) => {
      if (e) return next(e);
      res.send(result.result.n === 1 ? { msg: "success" } : { msg: "error" });
    }
  );
});

app.get("/search/:collectionName", (req, res, next) => {
  const searchTerm = req.query.q || "";
  const searchRegex = new RegExp(searchTerm, "i");

  const query = { $or: [{ title: searchRegex }, { location: searchRegex }] };

  req.collection.find(query).toArray((err, results) => {
    if (err) return next(err);
    res.send(results);
  });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running at http://localhost:" + port);
});
