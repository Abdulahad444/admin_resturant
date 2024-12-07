const Brevo = require('sib-api-v3-sdk');
const Inventory = require('../models/inventory');
const { User } = require('../models/user');
const Table=require('../models/table')
const Order=require("../models/order")
const MenuItem=require("../models/menuitem")
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
exports.getLowStockItems = async (req, res) => {
  console.log('Fetching low stock items...');
  try {
      console.log('Fetching low stock items...');

      // Fetch items with quantity less than or equal to lowStockThreshold
      const lowStockItems = await Inventory.find({
          $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
      }).maxTimeMS(5000);  // Set a query timeout of 5 seconds


      // If no low stock items found, return an empty array
      if (!lowStockItems.length) {
          return res.status(200).json({ message: 'No low stock items found', data: [] });
      }

      // Return the found low stock items
      return res.status(200).json({ message: 'Low stock items retrieved successfully', data: lowStockItems });
  } catch (error) {
      console.error('Error fetching low-stock items:', error);
      return res.status(500).json({ message: 'Error fetching low-stock items', error: error.message });
  }
};
exports.pushLowStockAlert = async (req, res) => {
    try {
        console.log('Fetching low stock items...');
        
        // Fetch low-stock items directly within this function
        const lowStockItems = await Inventory.find({
            $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
        }).maxTimeMS(5000); // Set a query timeout of 5 seconds

        // If no low stock items found, return a message
        if (!lowStockItems.length) {
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
        console.error('Error sending low-stock alerts:', error);
        res.status(500).json({ 
            message: 'Error sending low stock alerts.', 
            error: error.message 
        });
    }
};



async function watchOrders() {
    // Open a change stream on the Order collection
    const orderChangeStream = Order.watch();
  
    orderChangeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        // New order inserted
        const newOrder = change.fullDocument;
        console.log('New Order:', newOrder);
  
        // Notify staff via email
        const staffUsers = await User.find({ role: 'STAFF' });  // Get all staff users
        const staffEmails = staffUsers.map(user => user.email);
  
        const subject = `New Order: #${newOrder._id}`;
        const message = `A new order has been placed. Order details: ${JSON.stringify(newOrder)}`;
        
        for (const email of staffEmails) {
          await sendEmail(email, subject, message);
        }
      }
    });
  
    console.log('Watching for new orders...');
  }


  
  async function watchTables() {
    const tableChangeStream = Table.watch();

    tableChangeStream.on('change', async (change) => {
        try {
            console.log('Table Change Detected:', change);

            const tableId = change.documentKey._id;

            // Fetch the updated table details
            const updatedTable = await Table.findById(tableId);
            if (!updatedTable) {
                console.error('Table not found.');
                return;
            }

            // Fetch the associated reservation (if any)
            let assignedStaffEmail = 'Not assigned';
            try {
                const reservation = await Reservation.findOne({
                    table: updatedTable._id
                }).populate('assignedto', 'email'); // Populate assigned staff email

                if (reservation && reservation.assignedto) {
                    assignedStaffEmail = reservation.assignedto.email || 'Not assigned';
                }
            } catch (error) {
                console.error('Error fetching reservation or assigned staff:', error);
            }

            // Fetch all staff emails
            const staffUsers = await User.find({ role: 'STAFF' });
            const staffEmails = staffUsers.map(user => user.email);

            // Prepare email notification
            const subject = `Table Updated: Table #${updatedTable.tableNumber}`;
            const message = `
                Hello Team,

                A table has been updated. Below are the details of the change:

                Table Number: ${updatedTable.tableNumber}
                Status: ${updatedTable.status}
                Capacity: ${updatedTable.capacity}
                Location: ${updatedTable.location || 'Not specified'}

                Additional Details:
                ------------------------
                Last Updated: ${new Date().toLocaleString()}
                Assigned Staff: ${assignedStaffEmail}

                Please take note of this update and take necessary actions.

                Best regards,
                The Inventory Management Team
            `;

            // Send email to all staff
            for (const email of staffEmails) {
                await sendEmail(email, subject, message);
            }
        } catch (error) {
            console.error('Error processing table change:', error);
        }
    });

    console.log('Watching for table updates...');
}

  
let isWatchingOrders = false;
let isWatchingTables = false;
exports.controlTriggers = async (req, res) => {
  const { watchOrders: shouldWatchOrders, watchTables: shouldWatchTables } = req.body;

  // Check if both fields are provided in the request body
  if (typeof shouldWatchOrders === 'undefined' || typeof shouldWatchTables === 'undefined') {
      return res.status(400).json({
          message: 'Both "watchOrders" and "watchTables" fields are required in the request body.'
      });
  }

  try {
      if (shouldWatchOrders && !isWatchingOrders) {
          watchOrders();
          isWatchingOrders = true;
          console.log('Started watching orders.');
      } else if (!shouldWatchOrders && isWatchingOrders) {
          // Implement stopping orders change stream if applicable
          isWatchingOrders = false;
          console.log('Stopped watching orders.');
      }

      if (shouldWatchTables && !isWatchingTables) {
          watchTables();
          isWatchingTables = true;
          console.log('Started watching tables.');
      } else if (!shouldWatchTables && isWatchingTables) {
          // Implement stopping tables change stream if applicable
          isWatchingTables = false;
          console.log('Stopped watching tables.');
      }

      res.status(200).json({
          message: 'Trigger control updated successfully.',
          orderWatching: isWatchingOrders,
          tableWatching: isWatchingTables
      });
  } catch (error) {
      console.error('Error controlling triggers:', error);
      res.status(500).json({
          message: 'Error controlling triggers.',
          error: error.message
      });
  }
};
