const FridgeService = require('../services/fridge');

class FridgeController {
    constructor() {
        this.fridgeService = new FridgeService();
    }

    async getFridgeItems(req, res) {
        try {
            const userId = parseInt(req.query.UserID, 10);
            if (isNaN(userId)) {
                return res.status(400).json({ status: 400, message: 'Invalid UserID' });
            }
            const items = await this.fridgeService.getFridgeItems(userId);
            if (items.length === 0) {
                res.json({ status: 404, message: "No items found" });
            } else {
                res.json({ status: 200, data: items });
            }
        } catch (error) {
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    async deleteAllItems(req, res) {
        try {
            const userId = parseInt(req.query.UserID, 10);
            if (isNaN(userId)) {
                return res.status(400).json({ status: 400, message: 'Invalid UserID' });
            }
            await this.fridgeService.deleteAllItems(userId);
            return res.status(200).json({ status: 200, message: 'All items removed successfully' });

        } catch (error) {
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    async deleteItem(req, res) {
        try {
            const userId = parseInt(req.query.UserID, 10);
            const itemId = parseInt(req.query.ItemID, 10);

            if (isNaN(userId) || isNaN(itemId)) {
                return res.status(400).json({ status: 400, message: 'Invalid UserID or ItemID' });
            }
            await this.fridgeService.deleteItem(userId, itemId);
            return res.status(200).json({ status: 200, message: 'Item deleted successfully' });
        } catch (error) {
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    async addItem(req, res) {
        try {
            const { userId, itemId, expireDate, amount } = req.body;
            const result = await this.fridgeService.addItem(userId, itemId, expireDate, amount);
            if (result) {
                res.json({ status: 200, message: "Item inserted or updated successfully" });
            } else {
                res.json({ status: 404, message: "Item not found and not inserted" });
            }
        } catch (error) {
            return res.status(500).json({ status: 500, message: error.message });
        }
    }
}

module.exports = FridgeController;
