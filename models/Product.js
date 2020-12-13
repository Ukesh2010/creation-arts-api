const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;

ProductSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  images: [
    {
      originalname: { type: String, required: true },
      mimetype: { type: String, required: true },
      filename: { type: String, required: true },
      path: { type: String, required: true },
    },
  ],
});
ProductSchema.plugin(mongoosePaginate);

module.exports = Product = mongoose.model("Product", ProductSchema);
