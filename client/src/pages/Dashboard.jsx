// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#4f46e5", "#22c55e", "#eab308", "#f97316", "#ec4899", "#06b6d4"];

const toJsDate = (val) => {
  if (!val) return null;
  if (val._seconds) return new Date(val._seconds * 1000);
  return new Date(val);
};

const formatDate = (val) => {
  const d = toJsDate(val);
  if (!d) return "";
  return d.toLocaleDateString();
};

const formatDateKey = (val) => {
  const d = toJsDate(val);
  if (!d) return "";
  // yyyy-mm-dd for grouping/sorting
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (expense) => {
    try {
      await api.post("/expenses", expense);
      fetchExpenses();
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // 👉 apply date range filter
  const filteredExpenses = expenses.filter((exp) => {
    const d = toJsDate(exp.date);
    if (!d) return false;

    if (startDate) {
      const from = new Date(startDate);
      if (d < from) return false;
    }
    if (endDate) {
      const to = new Date(endDate);
      // include expenses on the end date
      to.setHours(23, 59, 59, 999);
      if (d > to) return false;
    }
    return true;
  });

  const total = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  // 👉 category-wise data for PieChart (on filtered data)
  const categoryTotals = filteredExpenses.reduce((acc, exp) => {
    const key = exp.category || "Other";
    acc[key] = (acc[key] || 0) + Number(exp.amount || 0);
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  // 👉 daily totals for LineChart (on filtered data)
  const dailyTotalsObj = filteredExpenses.reduce((acc, exp) => {
    const key = formatDateKey(exp.date);
    acc[key] = (acc[key] || 0) + Number(exp.amount || 0);
    return acc;
  }, {});

  const lineData = Object.entries(dailyTotalsObj)
    .map(([dateKey, amount]) => ({
      date: dateKey,
      amount,
    }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const hasExpenses = filteredExpenses.length > 0;

  // 👉 export filtered data to CSV (opens in Excel)
  const handleExport = () => {
    if (!filteredExpenses.length) return;

    const headers = ["Date", "Category", "Amount", "Note"];
    const rows = filteredExpenses.map((e) => [
      formatDate(e.date),
      e.category,
      e.amount,
      (e.note || "").replace(/"/g, '""'),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="dashboard-grid">
      {/* LEFT CARD – Summary + Add Expense */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Dashboard</h2>
          <div className="total-pill">
            💰 <span>Total Spent</span>
            <span className="total-amount">₹{total}</span>
          </div>
        </div>
        <p className="card-subtitle">
          Track where your money is going. Add expenses as you spend.
        </p>

        <h3 style={{ marginTop: 18, fontSize: "1rem" }}>Add Expense</h3>
        <ExpenseForm onAdd={handleAdd} />
      </section>

      {/* RIGHT CARD – Filters + Charts + Table */}
      <section className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ fontSize: "1.05rem" }}>
            Spending Overview
          </h3>
          <span className="card-subtitle">
            {filteredExpenses.length} record
            {filteredExpenses.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Filter row */}
        <div className="filter-row">
          <div className="filter-group">
            <span className="filter-label">Date range:</span>
            <input
              className="input input-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>to</span>
            <input
              className="input input-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExport}
            disabled={!filteredExpenses.length}
          >
            ⬇ Export
          </button>
        </div>

        {hasExpenses ? (
          <>
            {/* Line chart – daily trend */}
            <div style={{ width: "100%", height: 220, marginBottom: 20 }}>
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickMargin={6}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val) => [`₹${val}`, "Amount"]}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ fontSize: "0.8rem" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Expense table */}
            <div className="table-wrapper">
              {loading ? (
                <div className="table-empty">Loading...</div>
              ) : (
                <ExpenseList
                  expenses={filteredExpenses}
                  onDelete={handleDelete}
                />
              )}
            </div>
            {/* Pie chart */}
            <div style={{ width: "100%", height: 220, marginBottom: 10 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${value}`, "Amount"]}
                    contentStyle={{ fontSize: "0.8rem" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
          </>
        ) : (
          <div className="table-wrapper">
            <div className="table-empty">
              No expenses in this range. Adjust filters or add a new one.
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
