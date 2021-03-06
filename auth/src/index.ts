import mongoose from "mongoose";

import { app } from "./app";

const PORT = 3000;

const start = async () => {
  console.log("Starting auth service...");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Auth service connected to MongoDB");
  } catch (err) {
    console.error(err);
  }

  app.listen(PORT, () => {
    console.log(`Auth service listening on port ${PORT}`);
  });
};

start();
