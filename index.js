const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const cluster = require("cluster");
const os = require("os");
require("dotenv").config();

const numCpu = os.cpus().length;
const { productRoutes, userRoutes } = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/product", productRoutes);
app.use("/api/user", userRoutes);

const createWorker = () => {
  const worker = cluster.fork();

  // Restart worker on exit
  worker.on("exit", (code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    createWorker();
  });
};

if (cluster.isMaster) {
  // Create workers based on the number of CPUs
  for (let i = 0; i < numCpu; i++) {
    createWorker();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Spawning a new one...`);
    createWorker();
  });
} else {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  connection.connect((err) => {
    if (err) {
      console.error("DB Connection Error message: " + err.message);
      return;
    }

    console.log("Connected to MySQL database");
    app.listen(5000, () => {
      console.log(
        `Worker ${cluster.worker.id} connected to Server on Port 5000`
      );
    });
  });

  // Close the connection when the server is stopped
  process.on("SIGINT", () => {
    connection.end();
    process.exit();
  });

  // Check if the server is connected to MySQL
  connection.query("SELECT 1 + 1 AS solution", (error, results) => {
    if (error) {
      console.error("Error connecting to MySQL:", error);
    } else {
      console.log(
        `Worker ${cluster.worker.id}: MySQL connection is successful. Result:`,
        results[0].solution
      );
    }
  });
}
