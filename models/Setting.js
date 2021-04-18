const mongoose = require("mongoose");
const Schema = mongoose.Schema;

SettingSchema = new Schema({
  bannerImage: [
    {
      originalname: { type: String, required: true },
      mimetype: { type: String, required: true },
      filename: { type: String, required: true },
      path: { type: String, required: true },
    },
  ],
  description: { type: String },
});

module.exports = Setting = mongoose.model("Setting", SettingSchema);
