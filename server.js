const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require('dotenv').config();

// Express setup
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/email_logs"; // Replace with your MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// MongoDB Schema and Model
const emailSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  sentAt: { type: Date, default: Date.now }, // Automatically store timestamp
});

const EmailLog = mongoose.model("EmailLog", emailSchema);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server Running on port ${port}`));

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.error("Email credentials not found in environment variables");
  process.exit(1);
}

const contactEmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.error("Error verifying email transport:", error);
  } else {
    console.log("Ready to Send");
  }
});

// Route to handle contact form submission
const router = express.Router();

router.post("/contact", async (req, res) => {
  console.log("Request received:", req.body); // Log the incoming data

  // Validate request fields
  const { firstName, lastName, email, message, phone } = req.body;

  if (!firstName || !lastName || !email || !message || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const name = `${firstName} ${lastName}`;

  const mail = {
    from: name,
    to: process.env.EMAIL_USER,
    subject: "Contact Form Submission - Portfolio",
    html: `<p>Name: ${name}</p>
           <p>Email: ${email}</p>
           <p>Phone: ${phone}</p>
           <p>Message: ${message}</p>`,
  };

  try {
    // Send the email
    await contactEmail.sendMail(mail);

    // Save email log to MongoDB
    const emailLog = new EmailLog({ name, email, phone, message });
    await emailLog.save();

    console.log("Email log saved to MongoDB:", emailLog);

    res.status(200).json({ message: "Message Sent and Logged in Database" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Use the router
app.use("/", router);
