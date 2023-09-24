const express = require("express");
const mongoose = require("mongoose");
const { productRoutes, userRoutes } = require("./routes");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());

app.use(express.json());
app.use("/api/product", productRoutes);
app.use("/api/user", userRoutes);
