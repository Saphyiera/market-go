class Item {
    /**
     * @param {number} itemId - Unique identifier for the item.
     * @param {string} itemDescription - Detailed description of the item.
     * @param {string} itemName - Name of the item.
     * @param {Buffer|null} itemImg - Binary data for the item's image.
     */
    constructor(itemId, itemDescription, itemName, itemImg = null) {
        this.itemId = itemId;
        this.itemDescription = itemDescription;
        this.itemName = itemName;
        this.itemImg = itemImg;
    }
}

module.exports = Item;
