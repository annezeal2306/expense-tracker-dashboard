const db = require("../config/firestore");
const EXPENSES_COLLECTION = "expenses";

exports.addExpense = async (req, res) => {
  try {
    const { amount, category, date, note } = req.body;
    const userId = req.user.userId;

    const expenseRef = await db.collection(EXPENSES_COLLECTION).add({
      userId,
      amount,
      category,
      date: new Date(date),
      note,
      createdAt: new Date()
    });

    res.status(201).json({ id: expenseRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const snapshot = await db.collection(EXPENSES_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("date", "desc")
      .get();

    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await db.collection(EXPENSES_COLLECTION).doc(id).update(updates);
    res.json({ message: "Expense updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(EXPENSES_COLLECTION).doc(id).delete();
    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
