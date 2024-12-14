const express = require("express");
const router = express.Router();
const cors = require("cors");
const nodemailer = require("nodemailer");
require('dotenv').config();

// server used to send send emails
const app = express();
app.use(cors());
app.use(express.json());
app.use("/", router);

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
    pass: emailPass
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.error("Error verifying email transport:", error);
  } else {
    console.log("Ready to Send");
  }
});

router.post("/contact", (req, res) => {
  console.log("Request received:", req.body); // Log the incoming data

  // Validate request fields
  if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.message || !req.body.phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const name = req.body.firstName + " " + req.body.lastName;
  // const name = req.body.firstName;
  const email = req.body.email;
  const message = req.body.message;
  const phone = req.body.phone;

  const mail = {
    from: name,
    to: process.env.EMAIL_USER,
    subject: "Contact Form Submission - Portfolio",
    html: `<p>Name: ${name}</p>
           <p>Email: ${email}</p>
           <p>Phone: ${phone}</p>
           <p>Message: ${message}</p>`,
  };

  contactEmail.sendMail(mail, (error) => {
    if (error) {
      console.error("Error sending mail:", error); // Log the error
      res.status(500).json({ error: "Failed to send email" });
    } else {
      res.status(200).json({ message: "Message Sent" });
    }
  });
});
