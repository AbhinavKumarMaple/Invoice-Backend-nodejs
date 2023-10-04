const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const {
  accountantRoutes,
  employeeRoutes,
  customerRoutes,
  invoiceRoutes,
  generatedInvoiceRoutes,
  serviceDesc,
  varRate,
} = require("./routes");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cookieParser());

// Define a function to connect to MongoDB asynchronously
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the application if MongoDB connection fails
  }
};

// Call the connectToMongoDB function to establish the MongoDB connection
connectToMongoDB();

app.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/accountant", accountantRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/generatedinvoice", generatedInvoiceRoutes);
app.use("/api/servicedesc", serviceDesc);
app.use("/api/vatrate", varRate);
app.use("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});
app.listen(port, () => {
  console.log("Backend server is running!");
});
