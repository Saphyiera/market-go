const ItemService = require('../services/item');

class ItemController {
    constructor() {
        this.itemService = new ItemService();
    }

    async getItem(req, res) {
        try {
            const { id, name } = req.query;
            if (!id && !name) {
                return res.status(400).json({ status: 400, message: 'Item ID or name is required' });
            }

            if (id) {
                const items = await this.itemService.getItemById(id);
                return res.status(200).json({
                    status: 200, data: items.map(item => ({
                        ...item,
                        ItemImg: item.ItemImg ? item.ItemImg.toString('base64') : null,
                    }))
                });
            }

            if (name) {
                const items = await this.itemService.getItemsByName(name);
                return res.status(200).json({
                    status: 200, data: items.map(item => ({
                        ...item,
                        ItemImg: item.ItemImg ? item.ItemImg.toString('base64') : null,
                    }))
                });
            }
        } catch (error) {
            return res.status(404).json({ status: 404, message: error.message });
        }
    }


    async getAllItems(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await this.itemService.getAllItems(page, limit);
            res.status(200).json({
                status: 200,
                items: result.items,
                pagination: result.pagination,
            });
        } catch (error) {
            res.status(500).json({ status: 500, message: error.message });
        }
    }

    async addItem(req, res) {
        try {
            const { itemName, itemDescription } = req.body;
            const itemImage = req.file.buffer;

            const result = await this.itemService.addItem(itemName, itemDescription, itemImage);
            res.status(200).json({ status: 200, message: 'Item added successfully', itemId: result.itemId });
        } catch (error) {
            res.status(500).json({ status: 500, message: error.message });
        }
    }
}

module.exports = ItemController;