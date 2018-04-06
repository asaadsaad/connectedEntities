const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: String
});

module.exports = mongoose.model('Event', eventSchema);