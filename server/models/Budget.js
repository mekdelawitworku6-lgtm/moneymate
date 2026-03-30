const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  monthlyBudget: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Budget", budgetSchema);