// Define the InterviewPlan model
const mongoose = require('mongoose');
const interviewPlanSchema = new mongoose.Schema({
  userId: String,
  jobTitle: String,
  industry: String,
  skills: [String],
  plan: String
});
module.exports = mongoose.model('InterviewPlan', interviewPlanSchema);
