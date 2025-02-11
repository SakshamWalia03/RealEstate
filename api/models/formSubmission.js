const mongoose = require("mongoose");

const formSubmissionSchema = new mongoose.Schema(
  {
    problemDescription: { 
      type: String, 
      required: true, 
      trim: true
    },
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
        "Please enter a valid email address"
      ],
    },
  },
  { timestamps: true }
);

const FormSubmission = mongoose.model("FormSubmission", formSubmissionSchema);

module.exports = FormSubmission;