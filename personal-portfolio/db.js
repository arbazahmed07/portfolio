const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const emailSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  sentAt: { type: Date, default: Date.now }
});

const EmailLog = mongoose.model('EmailLog', emailSchema);
