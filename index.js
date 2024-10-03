const express = require("express");
const path = require("path");

const { connectToMongoDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");
const staticRouter= require("./routes/staticRouter")

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/url-shortner").then(() =>
  console.log("Connected to MongoDb!")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", staticRouter);
app.use("/url", urlRoute);


app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
 
});

app.listen(PORT, () => console.log("Server running on PORT:", PORT));
