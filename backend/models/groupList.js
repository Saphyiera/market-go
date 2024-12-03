class GroupList {
    /**
     * @param {number} groupId - Unique identifier for the group (foreign key referencing `group` table).
     * @param {number} listId - Unique identifier for the daily list (foreign key referencing `dailylist` table).
     * @param {number} buyerId - Unique identifier for the buyer (foreign key referencing `user` table).
     */
    constructor(groupId, listId, buyerId) {
        this.groupId = groupId;
        this.listId = listId;
        this.buyerId = buyerId;
    }
}

module.exports = GroupList;
