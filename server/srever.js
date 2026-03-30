const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// models
const Expense = require("./models/Expense");
const Budget = require("./models/Budget");

// check env
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI is not defined. Create .env file.");
  process.exit(1);
}

// connect MongoDB
mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* =========================
   EXPENSE ROUTES
========================= */

// create expense
app.post("/expense", async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get all expenses
app.get("/expense", async (req, res) => {
  try {
    const data = await Expense.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete expense
app.delete("/expense/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* =========================
   BUDGET ROUTES
========================= */

// set or update budget
app.post("/budget", async (req, res) => {
  try {
    const { monthlyBudget } = req.body;

    let budget = await Budget.findOne();

    if (budget) {
      budget.monthlyBudget = monthlyBudget;
      await budget.save();
    } else {
      budget = new Budget({ monthlyBudget });
      await budget.save();
    }

    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// get budget + insights
app.get("/budget", async (req, res) => {
  try {
    const budget = await Budget.findOne();

    // current month filter
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenses = await Expense.find({
      createdAt: { $gte: startOfMonth }
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const dailyBudget = budget ? budget.monthlyBudget / 30 : 0;

    let message = "";

    if (budget) {
      const percent = (totalSpent / budget.monthlyBudget) * 100;

      if (percent < 50) message = "Good control 🟢";
      else if (percent < 80) message = "Be careful 🟡";
      else message = "Overspending 🔴";
    }

    res.json({
      monthlyBudget: budget?.monthlyBudget || 0,
      totalSpent,
      dailyBudget,
      message,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  res.send("API running...");
});


/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});