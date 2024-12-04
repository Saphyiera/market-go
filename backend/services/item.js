const ItemRepository = require('../repositories/item');

class ItemService {
    constructor() {
        this.itemRepository = new ItemRepository();
    }

    async getItemById(itemId) {
        const item = await this.itemRepository.getById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }
        return item;
    }

    async getItemsByName(itemName) {
        const items = await this.itemRepository.getByName(itemName);
        if (!items || items.length === 0) {
            throw new Error('No items found with the given name');
        }
        return items;
    }

    async getAllItems(page, limit) {
        const result = await this.itemRepository.getAll(page, limit);
        if (!result.items || result.items.length === 0) {
            throw new Error('No items found');
        }
        return result;
    }

    async addItem(itemName, itemDescription, itemImage) {
        const result = await this.itemRepository.addItem(itemName, itemDescription, itemImage);
        if (!result.success) {
            throw new Error('Error adding the item');
        }
        return { itemId: result.itemId };
    }
}

module.exports = ItemService;