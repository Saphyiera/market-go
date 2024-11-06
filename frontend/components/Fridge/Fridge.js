import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import FridgeItem from './FridgeItem';
const SERVER_IP = require('../../../backend/constant');

const Fridge = ({ route }) => {
    const { userId } = route.params;
    const [fridgeItems, setFridgeItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFridgeItems = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:2811/fridge?UserID=${userId}`);
            const result = await response.json();

            if (result.status === 200) {
                setFridgeItems(result.data);
            } else {
                Alert.alert("Error", result.message || "Failed to load fridge items.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Server error, please try again.");
        } finally {
            setLoading(false);
        }
    };

    const deleteAllItems = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:2811/fridge/all?UserID=${userId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.status === 200) {
                Alert.alert("Success", "All items deleted successfully!");
                setFridgeItems([]);
            } else {
                Alert.alert("Error", result.message || "Failed to delete items.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Server error, please try again.");
        }
    };

    useEffect(() => {
        fetchFridgeItems();
    }, [userId]);

    const renderItem = ({ item }) => (
        <FridgeItem item={item} userId={userId} onDelete={(itemId) => {
            setFridgeItems((prevItems) => prevItems.filter((i) => i.ItemID !== itemId));
        }} />
    );

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={fridgeItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.ItemID.toString()}
            />
            <Button title="Delete All Items" onPress={deleteAllItems} color="#d9534f" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
    },
    messageText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
});

export default Fridge;