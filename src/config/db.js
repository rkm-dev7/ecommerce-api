// Import the 'mongoose' library, which allows us to interact with MongoDB.
const mongoose = require("mongoose");

// Import the 'mongodbURL' from a secret file. Make sure to replace this with your actual secret.
const { mongodbURL } = require("../secret");

// Define a function 'connectDatabase' that connects to the MongoDB database.
const connectDatabase = async (options = {}) => {
  try {
    // Attempt to connect to the MongoDB database using the 'mongodbURL' and optional connection 'options'.
    await mongoose.connect(mongodbURL, options);

    // If the connection is successful, log a message indicating the successful connection.
    console.log("connected to MongoDB");

    // Set up an event listener to handle any database connection errors.
    mongoose.connection.on("error", (error) => {
      console.error("DB connection error: ", error);
    });
  } catch (error) {
    // If there is an error during the connection attempt, log an error message.
    console.error("Could not connect to DB: ", error.toString());
  }
};

// Export the 'connectDatabase' function so it can be used in other parts of the application.
module.exports = connectDatabase;
