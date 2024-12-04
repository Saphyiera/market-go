class IItem {
    getById(itemId) {
        throw new Error("Method 'getById' must be implemented!");
    }
    getByName(itemName) {
        throw new Error("Method 'getByName' must be implemented!");
    }
    getAll(page, limit) {
        throw new Error("Method 'getAll' must be implemented!");
    }
    addItem(itemName, itemDescription, itemImage) {
        throw new Error("Method 'addItem' must be implemented!");
    }
}

module.exports = IItem;