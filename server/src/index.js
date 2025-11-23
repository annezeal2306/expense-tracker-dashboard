const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const authMiddleware = require("./middleware/auth");

const app = express();

// ✅ MUST be before routes
app.use(cors());
app.use(express.json());   // <--- this line is required

app.use("/api/auth", authRoutes);
app.use("/api/expenses", authMiddleware, expenseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
