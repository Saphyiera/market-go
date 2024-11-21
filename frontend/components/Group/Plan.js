import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SERVER_IP, PORT } from '../../../backend/constant';
import { useNavigation } from '@react-navigation/native';
import Buyers from './Buyers';

export default function Plan({ route }) {
    const { listId, groupId, buyers } = route.params;
    const [dailyList, setDailyList] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        console.log(groupId, "Buyers: ", buyers);
        const fetchDailyList = async () => {
            try {
                const response = await fetch(`http://${SERVER_IP}:${PORT}/daily-list?listId=${listId}`);
                const json = await response.json();
                if (json.status === 200) {
                    setDailyList(json.data);
                } else {
                    console.warn(json.message);
                }
            } catch (error) {
                console.error("Error fetching daily list:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDailyList();
    }, [listId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!dailyList) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>List not found</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={dailyList.Items}
            keyExtractor={(item) => item.ItemID.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={() => navigation.navigate('Plan Item', { itemId: item.ItemID })}>
                    {item.ItemImg ? (
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${item.ItemImg}` }}
                            style={styles.itemImage}
                        />
                    ) : (
                        <View style={styles.noImage} />
                    )}
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.ItemName}</Text>
                        <Text style={styles.itemAmount}>Amount: {item.Amount}</Text>
                    </View>
                </TouchableOpacity>
            )}
            style={styles.list}
            ListHeaderComponent={
                <>
                    <Text style={styles.label}>Cost: {dailyList.Cost ? dailyList.Cost + "$" : ""}</Text>
                    <Text style={styles.label}>Date to Buy: {new Date(dailyList.DateToBuy).toLocaleDateString()}</Text>
                    <Buyers listId={listId} groupId={groupId} buyers={buyers} />
                    <Text style={styles.label}>Items</Text>
                </>
            }
        />
    );
}

const styles = StyleSheet.create({
    list: {
        margin: 10,
        marginBottom: 20,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: '600'
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        alignItems: 'center',
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        resizeMode: 'contain',
    },
    noImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ddd',
        marginRight: 15,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemAmount: {
        fontSize: 14,
        color: '#555',
    },
});
