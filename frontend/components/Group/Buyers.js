import React, { useEffect, useState } from "react";
import { FlatList, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { PORT, SERVER_IP } from "../../../backend/constant";

export default function Buyers({ listId, groupId, buyers }) {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [currentBuyers, setCurrentBuyers] = useState(buyers.map(i => ({ UserID: i.BuyerID, Username: i.Username })));
    const [isShow, setIsShow] = useState(false);
    const [showMember, setShowMember] = useState(false);

    const fetchMembers = async () => {
        console.log("----")
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/group/members?groupId=${groupId}`);
            const result = await response.json();

            if (result.status === 200) {
                const buyerIds = new Set(buyers.map(i => parseInt(i.BuyerID)));
                const filtered = result.data.filter(i => !buyerIds.has(i.UserID));
                setMembers(filtered);
            } else {
                console.warn(result.message);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const assignTask = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/group-list/buyers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    groupId, listId, buyerIds: currentBuyers.map(i => i.UserID)
                })
            })
            const result = await response.json();
            if (result.status === 200) {
                Alert.alert('Success', "Task assigned successfully")
            } else {
                Alert.alert('Fail', result.message);
            }
        } catch (error) {
            console.log(error);
        }
        console.log("???")
    }

    const removeBuyer = (i) => {
        setCurrentBuyers(prev => prev.filter(ii => ii.UserID !== i.UserID));
        setMembers(prev => [...prev, i]);
    }

    const assignBuyer = (i) => {
        setMembers(prev => prev.filter(ii => ii.UserID !== i.UserID));
        setCurrentBuyers(prev => [...prev, i]);
    }

    const renderCurrentBuyer = ({ item }) => (
        <View style={styles.buyerContainer}>
            <Text style={styles.buyerName}>{item.Username}</Text>
            <Text style={styles.buyerId}>ID: {item.UserID}</Text>
            <TouchableOpacity style={styles.removeButton} onPress={() => removeBuyer(item)}>
                <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    const renderMember = ({ item }) => (
        <View style={styles.buyerContainer}>
            <Text style={styles.buyerName}>{item.Username}</Text>
            <Text style={styles.buyerId}>ID: {item.UserID}</Text>
            <TouchableOpacity style={[styles.removeButton, { backgroundColor: 'blue' }]} onPress={() => assignBuyer(item)} >
                <Text style={styles.removeButtonText}>Assign</Text>
            </TouchableOpacity>
        </View >
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Loading buyers...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setIsShow(!isShow)}>
                <Text style={styles.title}>Buyers</Text>
            </TouchableOpacity>
            {
                isShow ? currentBuyers.length > 0 ?
                    <FlatList
                        data={currentBuyers}
                        renderItem={renderCurrentBuyer}
                        keyExtractor={(item) => item.UserID.toString()}
                        contentContainerStyle={styles.listContainer}
                    /> : <Text style={styles.noList}>No member assigned to this task</Text> : null
            }
            {
                isShow &&
                <TouchableOpacity onPress={() => setShowMember(!showMember)}>
                    <Text style={styles.title}>Members</Text>
                </TouchableOpacity>
            }
            {
                isShow && showMember ? members.length > 0 ? <FlatList
                    data={members}
                    renderItem={renderMember}
                    keyExtractor={(item) => item.UserID.toString()}
                    contentContainerStyle={styles.listContainer}
                /> : <Text style={styles.noList}>No member founded!</Text> : null
            }
            {
                isShow &&
                <TouchableOpacity onPress={assignTask} style={[styles.removeButton, { backgroundColor: 'blue', marginTop: 10 }]}>
                    <Text style={[styles.removeButtonText, { fontSize: 16, margin: 5 }]}>Assign Task</Text>
                </TouchableOpacity>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
        color: "#333",
    },
    listContainer: {
        marginBottom: 10,
    },
    buyerContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buyerName: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 3,
    },
    buyerId: {
        fontSize: 14,
        color: "#555",
        flex: 1,
        textAlign: "left",
        paddingHorizontal: 5,
    },
    removeButton: {
        flex: 1,
        backgroundColor: "#FF3B30",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    removeButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    noList: {
        fontSize: 12,
        fontStyle: 'italic',
        color: 'gray'
    }
});
