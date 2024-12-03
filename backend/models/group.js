class Group {
    /**
     * @param {number} groupId - Unique identifier for the group.
     * @param {string} groupName - Name of the group.
     * @param {number|null} adminId - UserID of the admin (foreign key referencing `user` table).
     * @param {Buffer|null} groupImg - Image associated with the group (binary data for the `GroupImg` column).
     */
    constructor(groupId, groupName, adminId = null, groupImg = null) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.adminId = adminId;
        this.groupImg = groupImg;
    }
}

module.exports = Group;
