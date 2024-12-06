const Brevo = require('sib-api-v3-sdk');
const Inventory = require('../models/inventory');
const { User } = require('../models/user');

// Configure Brevo API
Brevo.ApiClient.instance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY || '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';

const apiInstance = new Brevo.TransactionalEmailsApi();

// Email sending function
async function sendEmail(to, subject, text) {
  const sender = { email: process.env.EMAIL_USER };
  const recipient = [{ email: to }];
  
  const emailData = {
    sender,
    to: recipient,
    subject: subject,
    textContent: text,
  };

  try {
    const response = await apiInstance.sendTransacEmail(emailData);
    console.log('Email sent:', response);
    return {
      success: true,
      email: to,
      response: response
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false, 
      email: to,
      error: error.message
    };
  }
}

exports.getLowStockItems = async () => {
    try {
        // Find items where quantity is less than or equal to the lowStockThreshold
        const lowStockItems = await Inventory.find({ 
            $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
        });

        if (!lowStockItems.length) {
            return [];
        }

        return lowStockItems;
    } catch (error) {
        throw new Error('Error fetching low-stock items: ' + error.message);
    }
};

exports.pushLowStockAlert = async (req, res) => {
    try {
        // Fetch low-stock items using the existing function
        const lowStockItems = await exports.getLowStockItems();

        if (lowStockItems.length === 0) {
            return res.status(200).json({ message: 'No low-stock items to alert.' });
        }

        // Find all users with the role STAFF
        const staffUsers = await User.find({ role: 'STAFF' });

        if (!staffUsers.length) {
            return res.status(404).json({ message: 'No staff members found to notify.' });
        }

        // Generate email content once for all low-stock items
        const emailSubject = 'Low Stock Alert: Action Required';
        const emailBody = lowStockItems.map(item => 
            `Ingredient: ${item.ingredient}\n` +
            `Current Quantity: ${item.quantity} ${item.unit}\n` +
            `Low Stock Threshold: ${item.lowStockThreshold} ${item.unit}\n` +
            `\nPlease restock this item as soon as possible.\n\n`
        ).join('---------------------------\n');

        // Send email to each staff member
        const emailPromises = staffUsers.map(staff => 
            sendEmail(
                staff.email,
                emailSubject,
                `Hello ${staff.firstName},\n\n` + 
                `The following items are running low on stock:\n\n` +
                `${emailBody}` + // Only inject the generated body here once per email
                `Thank you for your prompt action.\n\nBest regards,\nInventory Management Team`
            ).then(result => {
                return {
                    email: staff.email,
                    status: result.success ? 'Sent' : 'Failed',
                    error: result.success ? null : result.error
                };
            })
        );

        const emailResults = await Promise.all(emailPromises);

        // Separate successful and failed emails
        const successfulEmails = emailResults.filter(result => result.status === 'Sent');
        const failedEmails = emailResults.filter(result => result.status === 'Failed');

        // Prepare the response with arrays for successful and failed email addresses
        const responseMessage = {
            mail: `Hello [StaffName],\n\nThe following items are running low on stock:\n\n` + 
                  `${emailBody}` + // Ensure the message is correctly formatted
                  `Thank you for your prompt action.\n\nBest regards,\nInventory Management Team`,
            successfulSents: successfulEmails.map(result => result.email),
            failedSents: failedEmails.map(result => result.email)
        };

        res.status(200).json({
            message: 'Low stock alerts processed.',
            successfulSents: responseMessage.successfulSents,
            failedSents: responseMessage.failedSents
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error sending low stock alerts.', 
            error: error.message 
        });
    }
};
