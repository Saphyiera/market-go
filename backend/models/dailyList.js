class DailyList {
    /**
     * @param {number} listId - Unique identifier for the list (combined with userId for composite key).
     * @param {number} userId - Unique identifier for the user (foreign key referencing `user` table).
     * @param {string|null} dateToBuy - Date on which the items need to be purchased (YYYY-MM-DD format).
     * @param {number|null} cost - Estimated or actual cost for the items.
     */
    constructor(listId, userId, dateToBuy = null, cost = null) {
        this.listId = listId;
        this.userId = userId;
        this.dateToBuy = dateToBuy;
        this.cost = cost;
    }
}

module.exports = DailyList;
