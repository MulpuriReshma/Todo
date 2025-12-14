console.log("🔥🔥 THIS SERVER.JS FILE IS RUNNING 🔥🔥");

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Todo = require("./models/Todo");
const User = require("./models/User");

const app = express();

/* -------------------- GLOBAL MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- DATABASE CONNECTION -------------------- */
mongoose
  .connect(
    "mongodb+srv://reshma:reshma123@cluster0.lc2lmzz.mongodb.net/tododb"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err.message));

/* -------------------- AUTH MIDDLEWARE -------------------- */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  try {
    // Expecting: Bearer <token>
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* -------------------- TEST ROUTES -------------------- */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/ping", (req, res) => {
  console.log("PING HIT");
  res.send("pong");
});

app.get("/signup-test", (req, res) => {
  res.json({ message: "Signup API reachable" });
});

/* -------------------- AUTH ROUTES -------------------- */

// signup
app.post("/signup", async (req, res) => {
  try {
    console.log("SIGNUP BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email or password missing" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("SIGNUP ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

/* -------------------- TODO ROUTES (PROTECTED) -------------------- */

// add todo
app.post("/add", auth, async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    userId: req.userId
  });

  await todo.save();
  res.json({ message: "Todo added" });
});

// get todos (user-specific)
app.get("/todos", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId });
    res.json(todos); // ALWAYS ARRAY
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch todos" });
  }
});

// update todo
app.put("/update/:id", auth, async (req, res) => {
  await Todo.findByIdAndUpdate(req.params.id, {
    title: req.body.title
  });

  res.json({ message: "Todo updated" });
});

// delete todo
app.delete("/delete/:id", auth, async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: "Todo deleted" });
});

/* -------------------- START SERVER -------------------- */
app.listen(5000, () => {
  console.log("Server started on port 5000");
});
