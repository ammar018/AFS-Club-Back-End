const express = require("express");
const app = express();
app.set("port", 3000);

app.listen(app.get("port"), () => {
  console.log(`Server is running on http://localhost:${app.get("port")}`);
});

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
const imagePath = path.resolve(__dirname, "image");

app.use("/image", express.static(imagePath));

app.use((req, res, next) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("You done goofed(did not find static file)");
  next();
});

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

const MongoClient = require("mongodb").MongoClient;

let db;
MongoClient.connect("mongodb+srv://blockstree:Rars1234@cst3144.zixj3.mongodb.net/", (err, client) => {
  if (err) throw err;
  db = client.db("webstore");
  console.log("Connected to MongoDB");
});

app.get("/", (req, res, next) => {
  res.send("Select a collection, e.g., /collection/messages");
});
