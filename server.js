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
