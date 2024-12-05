class IFridge {
    getFridgeItems(userId) {
        throw new Error("Method 'getFridgeItems' must be implemented!");
    }

    deleteAllItems(userId) {
        throw new Error("Method 'deleteAllItems' must be implemented!");
    }

    deleteItem(userId, itemId) {
        throw new Error("Method 'deleteItem' must be implemented!");
    }

    addItem(userId, itemId, expireDate, amount) {
        throw new Error("Method 'addItem' must be implemented!");
    }
}

module.exports = IFridge;
