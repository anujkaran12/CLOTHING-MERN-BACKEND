require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const authRouter = require("./Routes/authRouter");
const { userRouter } = require("./Routes/userRouter");
const { loginValidator } = require("./Validator/loginValidator");
const { sellerRouter } = require("./Routes/sellerRouter");
const {
  fetchAllProducts,
  fetchSingleProduct,
} = require("./Controller/commonController");
const cookieParser = require("cookie-parser");

const { stripePayment, checkOutSession } = require("./utility/stripePayment");
const { sellerValidator } = require("./Validator/sellerValidator");
const app = express();
mongoose
  .connect(process.env.MONGO_URL, { dbName: "Ecommerce" })
  .then(() => console.log("DB Connected succesfully"))
  .catch((e) => console.log("DB Connection ERROR", e));

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000',process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

app.get("/explore/:productId", fetchSingleProduct); //fetching single product
app.get("/fetchAllProducts", fetchAllProducts); //fetching all product
app.use("/auth", authRouter); //authentication router
app.use(loginValidator); //login validator
app.use("/user", userRouter); //user router
app.post("/create-checkout-session", stripePayment); //stripe payment
app.get("/checkout-session/:id", checkOutSession);
app.use(sellerValidator);
app.use("/seller", sellerRouter);

app.use("/seller", sellerRouter); //seller router

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
