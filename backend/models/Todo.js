const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  title: String,
  userId: String
});

module.exports = mongoose.model("Todo", TodoSchema);
