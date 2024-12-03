class GroupMember {
    /**
     * @param {number} groupId - Unique identifier for the group (foreign key referencing `group` table).
     * @param {number} memberId - Unique identifier for the member (foreign key referencing `user` table).
     */
    constructor(groupId, memberId) {
        this.groupId = groupId;
        this.memberId = memberId;
    }
}

module.exports = GroupMember;