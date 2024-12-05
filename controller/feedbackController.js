const mongoose = require('mongoose');
const Feedback = require('../models/feedback'); // Import Feedback model

// Get all feedbacks with populated order, customer, and menuItem
exports.getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('order')  // Populate order field
            .populate('customer') // Populate customer field
            .populate('menuItemRatings.menuItem'); // Populate menu item ratings field
        
        if (!feedbacks.length) {
            return res.status(404).json({ message: 'No feedbacks found.' });
        }

        res.status(200).json({ feedbacks });
    } catch (error) {
        console.error(error); // For debugging
        res.status(500).json({ message: 'Error fetching feedbacks.', error: error.message });
    }
};

// Respond to a specific feedback
exports.respondToFeedback = async (req, res) => {
    const { feedbackId, response } = req.body;

    try {
        // Validate if both feedbackId and response are provided
        if (!feedbackId || !response) {
            return res.status(400).json({ message: 'Both feedback ID and response are required.' });
        }

        // Validate if feedbackId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
            return res.status(400).json({ message: 'Invalid feedback ID.' });
        }

        // Find the feedback by ID and populate the order
        const feedback = await Feedback.findById(feedbackId).populate('order');
        
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found.' });
        }

        // Update the response in the feedback
        feedback.response = response;
        await feedback.save();

        res.status(200).json({ message: 'Response successfully added to feedback.', feedback });
    } catch (error) {
        res.status(500).json({ message: 'Error responding to feedback.', error: error.message });
    }
};



exports.updateFeedbackWithSuggestion = async (req, res) => {
    const { feedbackId, implementationStatus, implementationComment, suggestion } = req.body;

    try {
        // Check if all required fields are provided
        if (!feedbackId || !implementationStatus || !implementationComment || suggestion === undefined) {
            return res.status(400).json({
                message: 'Missing required fields. Please provide feedbackId, implementationStatus, implementationComment, and suggestion.'
            });
        }

        // Validate if feedbackId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
            return res.status(400).json({ message: 'Invalid feedbackId. Please provide a valid feedback ID.' });
        }

        // Find the feedback by ID
        const feedback = await Feedback.findById(feedbackId);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found. Please provide a valid feedback ID.' });
        }

        // Check if the suggestion field is null
        if (suggestion === null) {
            return res.status(400).json({
                message: 'Suggestion cannot be null. Please provide a valid suggestion.'
            });
        }

        // Validate implementationStatus field
        if (!['done', 'notdone'].includes(implementationStatus)) {
            return res.status(400).json({ message: 'Invalid implementationStatus. It must be either "done" or "notdone".' });
        }

        // Update the feedback fields
        feedback.implementationStatus = implementationStatus;
        feedback.implementationComment = implementationComment;
        feedback.suggestion = suggestion;

        // Save the updated feedback
        await feedback.save();

        res.status(200).json({
            message: 'Feedback updated successfully.',
            feedback
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error updating feedback.',
            error: error.message
        });
    }
};