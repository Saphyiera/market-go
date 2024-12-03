class Fridge {
    /**
     * @param {number} userId - Unique identifier for the user (foreign key referencing `user` table).
     * @param {number} itemId - Unique identifier for the item (foreign key referencing `item` table).
     * @param {string} expireDate - Expiry date for the item (in `YYYY-MM-DD` format).
     * @param {string|null} amount - Quantity or amount of the item.
     */
    constructor(userId, itemId, expireDate, amount = null) {
        this.userId = userId;
        this.itemId = itemId;
        this.expireDate = expireDate;
        this.amount = amount;
    }
}

module.exports = Fridge;