const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { restrictToLoggedinUserOnly, checkAuth } = require("./middlewares/auth");

const { connectToMongoDB } = require("./connect");
const URL = require("./models/url");

const urlRoute = require("./routes/url");
const staticRouter= require("./routes/staticRouter");
const userRoute = require("./routes/user");

const app = express();
const PORT = 8001;

connectToMongoDB(process.env.MONGODB ?? "mongodb://localhost:27017/url-shortner").then(() =>
  console.log("Connected to MongoDb!")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/url", restrictToLoggedinUserOnly ,urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth ,staticRouter);


app.get("/url/:shortId", async (req, res) => {
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
 res.redirect(entry.redirectURL);
 console.log(entry.redirectURL)
});

app.listen(PORT, () => console.log("Server running on PORT:", PORT));
