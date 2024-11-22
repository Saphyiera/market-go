import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { PORT, SERVER_IP } from '../../../backend/constant';
import SharePlanButton from './SharePlan';

const AllPlans = ({ route }) => {
    const { groupId, userId } = route.params;
    console.log(groupId, userId)
    const [dailyLists, setDailyLists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `http://${SERVER_IP}:${PORT}/daily-list/all?userId=${userId}`
                );
                const json = await response.json();

                if (response.ok) {
                    setDailyLists(json.data);
                } else {
                    Alert.alert("", "Something happended, cant load your data");
                }
            } catch (err) {
                setError('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemHeader}>Date to Buy: {item.DateToBuy.split('T')[0]}</Text>
            <Text style={styles.itemHeader}>Cost: ${item.Cost}</Text>
            <Text style={styles.itemHeader}>Items:</Text>
            {item.Items.map((subItem) => (
                <View key={subItem.ItemID} style={styles.subItemContainer}>
                    <Text style={styles.itemText}>- {subItem.ItemName} ({subItem.Amount})</Text>
                </View>
            ))}
            <SharePlanButton
                listId={item.ListID}
                groupId={groupId}
                userId={userId}
                style={styles.shareButton}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={dailyLists}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative', // Allows absolute positioning within this container
    },
    shareButton: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    subItemContainer: {
        paddingLeft: 16,
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    itemHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
});


export default AllPlans;
