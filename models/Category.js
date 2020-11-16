const mongoose = require("mongoose");

const Schema = mongoose.Schema;

CategorySchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

module.exports = Category = mongoose.model("Category", CategorySchema);
