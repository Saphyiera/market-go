const FridgeRepository = require('../repositories/fridge');

class FridgeService {
    constructor() {
        this.fridgeRepository = new FridgeRepository();
    }

    async getFridgeItems(userId) {
        const items = await this.fridgeRepository.getFridgeItems(userId);
        if (items.length === 0) {
            return [];
        }
        return items.map(item => ({
            ...item,
            ItemImg: item.ItemImg ? item.ItemImg.toString('base64') : null,
            ExpireDate: this.formatDate(item.ExpireDate),
        }));
    }

    async deleteAllItems(userId) {
        return await this.fridgeRepository.deleteAllItems(userId);
    }

    async deleteItem(userId, itemId) {
        return await this.fridgeRepository.deleteItem(userId, itemId);
    }

    async addItem(userId, itemId, expireDate, amount) {
        return await this.fridgeRepository.addItem(userId, itemId, expireDate, amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

module.exports = FridgeService;
