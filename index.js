import express from "express";
import mongoose from "mongoose";
import User from "./Schema/users.js";

const app = express();

const port = 5000; //this is the port on which the backend will be served.

app.use(express.json()); //to parse the json payload of the body.
const router = express.Router();

//connect to mongoDB
mongoose.connect("mongodb://localhost:27017/CRUD");
const db = mongoose.connection; //making an instance of the connection
db.on("open", () => {
  //if the connnection is successfull
  console.log("Connection successfull");
});
db.on("error", () => {
  //if connection is unsucessfull
  console.log("Connection Unsucessfull");
});

app.use("/", router);

//function to validate the fields coming from put and post requests only.
function checkValidation(req, res, next) {
  //this is a router level middleware works only for the put and post methods to create and update a user
  let { firstName, lastName, hobby } = req.body; //destructing the value

  const errors = []; //making a errors array to store all the fields error at and send at once.

  if (!firstName) {
    //if the value of the firstName is empty
    errors.push({
      errorFor: "firstName", //specifying the error is for which key.
      message: `The firstName field is required.`, //the error message for that key
    });
  } else if (firstName && typeof firstName !== "string") {
    //if the type of the firstName is not a string
    errors.push({
      errorFor: "firstName", //specifying the error is for which key.
      message: `The firstName field must be a string.`, //the error message for that key
    });
  }
  if (!lastName) {
    //if the value of the lastName is empty
    errors.push({
      errorFor: "lastName", //specifying the error is for which key.
      message: `The lastName field is required.`, //the error message for that key
    });
  } else if (lastName && typeof lastName !== "string") {
    //if the type of the lastName is not a string
    errors.push({
      errorFor: "lastName", //specifying the error is for which key.
      message: `The lastName field must be a string.`, //the error message for that key
    });
  }
  if (!hobby) {
    //if the value of the id is empty
    errors.push({
      errorFor: "hobby", //specifying the error is for which key.
      message: `The hobby field is required.`, //the error message for that key
    });
  } else if (hobby && typeof hobby !== "string") {
    //if the type of the firstName is not a string
    errors.push({
      errorFor: "hobby", //specifying the error is for which key.
      message: `The hobby field must be a string.`, //the error message for that key
    });
  }

  if (errors.length > 0) res.status(400).send(errors);
  else next(); //move to the next middleware if there is no other middleware move to the api for the execution of the callback function.
}

//middleware function to check update req.body.id is with us or not inshort the user exist or not then only we cant move next to update the user.
async function updateValidation(req, res, next) {
  try {
    const id = req.params.id; //storing the id of the user
    const foundUser = await User.findById(id).select("-_id");
    if (foundUser) {
      req.body = { ...foundUser, ...req.body };
    }
    next();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
}

//middleware that will work on all the router instances (check the IDE terminal for the output from the middleware)
router.use((req, res, next) => {
  //this is an application level middleware and will work for all the api instances of router
  console.log({
    method: req.method,
    url: req.url,
    "status code": res.statusCode,
  });
  next(); //move to the next middleware if there is no other middleware move to the api for the execution of the callback function.
});

//Fetch the list of all users
router.get("/", async (req, res) => {
  try {
    const gotData = await User.find();
    res.status(200).send({ data: gotData });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

//Fetch the data of a specific user by id
router.get("/user/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      const error = new Error();
      error.status = 400;
      error.message = "User not found";
      throw error;
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(err.status != 400 ? 500 : 400).send({ message: err.message });
  }
});

//Create a new user
router.post("/user", checkValidation, async (req, res) => {
  const { firstName, lastName, hobby } = req.body;
  const body = { firstName, lastName, hobby };
  try {
    await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      hobby: req.body.hobby,
    });
    res.status(201).send({ message: "Created a new user" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

//Update details of a existing user
router.put("/user/:id", updateValidation, async (req, res) => {
  try {
    const { firstName, lastName, hobby } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      firstName,
      lastName,
      hobby,
    });
    if (!updatedUser) {
      const error = new Error();
      error.status = 400;
      error.message = "User not found";
      throw error;
    }
    res.status(200).send({ message: "User updated successfully" });
  } catch (err) {
    res.status(err.status != 400 ? 500 : 400).send({ message: err.message });
  }
});

//Delete a user by id
router.delete("/user/:id", async (req, res) => {
  try {
    const deletedUser = await User.deleteOne({ _id: req.params.id });
    if (!deletedUser.deletedCount) {
      const error = new Error();
      error.status = 400;
      error.message = "No such user found";
      throw error;
    }
    res.status(200).send({ message: `Deleted user with id ${req.params.id}` });
  } catch (err) {
    res.status(err.status != 400 ? 500 : 400).send({ message: err.message });
  }
});

app.listen(5000, () => {
  console.log(`Server is running on port ${port}`);
});
