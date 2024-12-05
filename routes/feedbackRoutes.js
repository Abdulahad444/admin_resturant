const express = require('express');
const router = express.Router();
const feedbackController = require('../controller/feedbackController');

// Route to get all feedbacks
router.get('/', feedbackController.getAllFeedbacks);

// Route to respond to a feedback
router.post('/respond', feedbackController.respondToFeedback);

// Route to respond to a feedback
router.post('/suggestion/implemen', feedbackController.updateFeedbackWithSuggestion);

module.exports = router;
