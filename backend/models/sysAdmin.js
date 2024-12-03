class SysAdmin {
    /**
     * @param {number} id - Unique identifier for the system administrator.
     * @param {string} adminName - Name of the system administrator.
     * @param {string} password - Password of the system administrator.
     */
    constructor(id, adminName, password) {
        this.id = id;
        this.adminName = adminName || null;
        this.password = password || null;
    }
}

module.exports = SysAdmin;
