const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRouter");
const tokensRouter = require("./routes/tokensRouter");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:5173"],
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", userRouter);
app.use("/api/tokens", tokensRouter);

app.listen(PORT, () => console.log(`Started on port ${PORT}`));
