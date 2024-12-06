const express = require('express')
const multer = require('multer')
const connection = require('../db/connection')
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create', (req, res) => {
    const { groupName, adminId } = req.body;
    connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
            console.error("Transaction error: ", transactionErr);
            res.status(500).json({ status: 500, message: "Server Error" });
            return;
        }
        connection.query(`SELECT IFNULL(MAX(GroupID), 0) AS maxGroupId FROM \`group\``, (selectErr, selectResult) => {
            if (selectErr) {
                console.error("Error fetching max GroupID: ", selectErr);
                connection.rollback(() =>
                    res.status(500).json({ status: 500, message: "Server Error" })
                );
                return;
            }
            const groupId = selectResult[0].maxGroupId + 1;
            connection.query(
                `INSERT INTO \`group\` (GroupID, GroupName, AdminID) VALUES (?, ?, ?)`,
                [groupId, groupName, adminId],
                (insertErr) => {
                    if (insertErr) {
                        console.error("Error inserting new group: ", insertErr);
                        connection.rollback(() =>
                            res.status(500).json({ status: 500, message: "Server Error" })
                        );
                        return;
                    }
                    connection.query(`INSERT INTO groupmember(GroupID,MemberID) VALUES (?,?)`, [groupId, adminId], (gmInsertErr) => {
                        if (gmInsertErr) {
                            console.error("Error inserting new group member: ", gmInsertErr);
                            connection.rollback(() =>
                                res.status(500).json({ status: 500, message: "Server Error" })
                            );
                        } else {
                            connection.commit((commitErr) => {
                                if (commitErr) {
                                    console.error("Commit error: ", commitErr);
                                    connection.rollback(() =>
                                        res.status(500).json({ status: 500, message: "Server Error" })
                                    );
                                    return;
                                }
                                res.status(200).json({ status: 200, message: "Group created successfully", groupId });
                            });
                        }
                    })
                }
            );
        });
    });
});

router.get('/user', (req, res) => {
    const userId = req.query.userId;
    console.log(typeof userId);
    if (userId == "null") {
        res.json({ status: 400, message: "Invalid UserID" });
        return;
    }
    connection.query(
        `SELECT gm.GroupID, g.GroupName, g.AdminID, g.GroupImg, u.Username
         FROM groupmember gm 
         INNER JOIN \`group\` g ON gm.GroupID = g.GroupID
         INNER JOIN \`user\` u ON g.AdminID = u.UserID
         WHERE gm.MemberID = ?`, [userId],
        (err, result) => {
            if (err) {
                console.log(err);
                res.json({ status: 500, message: "Server error!" });
            }
            else if (result.length == 0) {
                res.json({ status: 404, message: "No group with this userid" });
            }
            else {
                console.log(result);
                res.json({ status: 200, data: result });
            }
        })
});

router.post('/avatar', upload.single('groupimg'), (req, res) => {
    const groupId = req.body.groupId;
    const groupImg = req.file.buffer;

    connection.query(
        `UPDATE \`group\` SET GroupImg = ? WHERE GroupID = ?`,
        [groupImg, groupId],
        (err, result) => {
            if (err) {
                console.log("Error inserting image:", err);
                return res.json({ status: 500, message: "Failed to upload image" });
            }
            res.json({ status: 200, message: "Image uploaded successfully" });
        }
    );
});

router.get('/details', (req, res) => {
    const groupId = req.query.groupId;
    connection.query(
        `SELECT 
            g.GroupID, g.AdminID, g.GroupName, 
            IFNULL(TO_BASE64(g.GroupImg), '') AS GroupImg,
            GROUP_CONCAT(gm.MemberID) AS MemberIDs,
            GROUP_CONCAT(u.Username) AS Usernames,
            JSON_ARRAYAGG(JSON_OBJECT(
                'Avatar', u.Avatar
            )) AS MemberAvatars
        FROM \`group\` g
        INNER JOIN groupmember gm ON g.GroupID = gm.GroupID
        INNER JOIN \`user\` u ON u.UserID = gm.MemberID
        WHERE g.GroupID = ?
        GROUP BY g.GroupID, g.AdminID, g.GroupName, g.GroupImg`,
        [groupId],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.json({ status: 500, message: "An unexpected error occurred" });
            }

            if (result.length === 0) {
                return res.json({ status: 404, message: "Group not found" });
            }

            const groupDetails = {
                GroupID: result[0].GroupID,
                AdminID: result[0].AdminID,
                GroupName: result[0].GroupName,
                GroupImg: result[0].GroupImg || null,
                Members: []
            };

            const memberIds = result[0].MemberIDs ? result[0].MemberIDs.split(',') : [];
            const usernames = result[0].Usernames ? result[0].Usernames.split(',') : [];
            const memberAvatars = result[0].MemberAvatars;

            if (memberIds.length === usernames.length) {
                for (let i = 0; i < memberIds.length; i++) {
                    groupDetails.Members.push({
                        MemberID: memberIds[i],
                        Username: usernames[i],
                        MemberAvatar: memberAvatars[i]?.Avatar || null
                    });
                }
            }
            res.json({ status: 200, data: groupDetails });
        }
    );
});

router.get('/plans', (req, res) => {
    const { groupId, month, year } = req.query;

    connection.query(
        `SELECT 
            gl.ListID, dl.DateToBuy,
            GROUP_CONCAT(gl.BuyerID) AS BuyerIDs,
            GROUP_CONCAT(u.Username) AS Usernames
        FROM grouplist gl
        INNER JOIN dailylist dl ON gl.ListID = dl.ListID
        INNER JOIN \`user\` u ON gl.BuyerID = u.UserID
        WHERE gl.GroupID = ? 
            AND YEAR(dl.DateToBuy) = ? 
            AND MONTH(dl.DateToBuy) = ?
        GROUP BY gl.ListID, dl.DateToBuy`,
        [groupId, year, month],
        (err, result) => {
            if (err) {
                console.error(err);
                res.json({ status: 500, message: "Server error" });
            } else {
                const formattedResult = result.map(item => ({
                    ListID: item.ListID,
                    DateToBuy: item.DateToBuy,
                    Buyers: item.BuyerIDs.split(',').map((id, index) => ({
                        BuyerID: id,
                        Username: item.Usernames.split(',')[index]
                    }))
                }));

                res.json({ status: 200, data: formattedResult });
            }
        }
    );
});

router.get('/members', (req, res) => {
    const { groupId } = req.query;

    connection.query(`
        SELECT u.UserID, u.Username, u.Avatar
        FROM groupmember gm INNER JOIN user u ON gm.MemberID = u.UserID
        WHERE gm.GroupID = ?`, [groupId], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ status: 500, message: "Server Error" });
        }
        else if (result.length === 0) {
            res.json({ status: 404, message: "Found 0 member!" })
        }
        else {
            res.json({ status: 200, message: "OK", data: result });
        }
    })
})

router.post('/members', (req, res) => {
    const { groupId, memberIds } = req.body;
    console.log(req.body);
    if (groupId === undefined || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ status: 400, message: "Invalid input" });
    }
    const values = memberIds.map(memberId => [groupId, memberId]);
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Transaction Error:", err);
            return res.status(500).json({ status: 500, message: "Server error" });
        }
        connection.query(`SELECT UserID FROM user WHERE UserID IN (?)`, [memberIds], (selectErr, selectResult) => {
            if (selectErr) {
                console.error("Select Error:", selectErr);
                connection.rollback(() => {
                    res.status(500).json({ status: 500, message: "Server error" });
                });
                return;
            }
            const existingMemberIds = selectResult.map(user => user.UserID.toString());
            const missingMembers = memberIds.filter(id => !existingMemberIds.includes(id));
            if (missingMembers.length > 0) {
                console.log(missingMembers);
                connection.rollback(() => {
                    res.status(404).json({ status: 404, message: "Some users not found", missingMembers });
                });
                return;
            }
            connection.query(`INSERT INTO groupmember (GroupID, MemberID) VALUES ? ON DUPLICATE KEY UPDATE MemberID = MemberID`, [values], (insertErr) => {
                if (insertErr) {
                    console.error("Insert Error:", insertErr);
                    connection.rollback(() => {
                        res.status(500).json({ status: 500, message: "Server error" });
                    });
                    return;
                }
                connection.commit((commitErr) => {
                    if (commitErr) {
                        console.error("Commit Error:", commitErr);
                        connection.rollback(() => {
                            res.status(500).json({ status: 500, message: "Server error" });
                        });
                        return;
                    }
                    res.status(200).json({ status: 200, message: "Members added successfully" });
                });
            });
        });
    });
});

router.delete('/member', (req, res) => {
    const { groupId, memberId } = req.body;
    console.log(req.body);

    if (groupId === undefined || memberId === undefined) {
        return res.status(400).json({ status: 400, message: "Invalid input" });
    }

    connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
            console.error("Transaction error:", transactionErr);
            return res.status(500).json({ status: 500, message: "Server error" });
        }
        connection.query(
            `DELETE FROM grouplist WHERE GroupID = ? AND BuyerID = ?`,
            [groupId, memberId],
            (glError) => {
                if (glError) {
                    console.error("Grouplist delete error:", glError);
                    return connection.rollback(() =>
                        res.status(500).json({ status: 500, message: "Server error" })
                    );
                }
                connection.query(
                    `DELETE FROM groupmember WHERE GroupID = ? AND MemberID = ?`,
                    [groupId, memberId],
                    (gmError) => {
                        if (gmError) {
                            console.error("Group member delete error:", gmError);
                            return connection.rollback(() =>
                                res.status(500).json({ status: 500, message: "Server error" })
                            );
                        }
                        connection.commit((commitErr) => {
                            if (commitErr) {
                                console.error("Commit error:", commitErr);
                                return connection.rollback(() =>
                                    res.status(500).json({ status: 500, message: "Server error" })
                                );
                            }
                            res.status(200).json({ status: 200, message: "OK" });
                        });
                    }
                );
            }
        );
    });
});

module.exports = router;