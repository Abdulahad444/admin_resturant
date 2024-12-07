const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');

// Add a new menu item
router.post('/add', menuController.addMenuItem);

// Update an existing menu item
router.put('/update', menuController.updateMenuItem);

router.get('/', menuController.getAllMenuItems);


// Delete a menu item
router.delete('/delete', menuController.deleteMenuItem);

module.exports = router;
