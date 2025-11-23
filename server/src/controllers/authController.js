const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/firestore");

const USERS_COLLECTION = "users";

exports.registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const userSnap = await db.collection(USERS_COLLECTION)
      .where("email", "==", email)
      .get();
    if (!userSnap.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userRef = await db.collection(USERS_COLLECTION).add({
      email,
      password: hashed,
      name,
      createdAt: new Date()
    });

    return res.status(201).json({ message: "User registered", id: userRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userSnap = await db.collection(USERS_COLLECTION)
      .where("email", "==", email)
      .get();

    if (userSnap.empty) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userDoc = userSnap.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
