class ListItem {
    /**
     * @param {number} listId - Unique identifier for the daily list (foreign key referencing `dailylist` table).
     * @param {number} itemId - Unique identifier for the item (foreign key referencing `item` table).
     * @param {string} amount - The amount of the item in the list.
     */
    constructor(listId, itemId, amount) {
        this.listId = listId;
        this.itemId = itemId;
        this.amount = amount || null;
    }
}

module.exports = ListItem;
