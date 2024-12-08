import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
const { SERVER_IP } = require('../../../backend/constant');


export default function ItemsList() {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

    const fetchItems = async () => {

        if (!hasMore) return;

        setLoading(true);
        try {
            const response = await fetch(`http://${SERVER_IP}:2811/item/all?page=${page}&limit=10`);
            const data = await response.json();

            if (data.items.length > 0) {
                setItems(prevItems => [...prevItems, ...data.items]);
                setHasMore(page < data.pagination.totalPages);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [page]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handleRemoveItem = (itemId) => {
        Alert.alert("Confirm", "Do you want to remove item with ID: " + itemId + "? All infomation related to this thing would be removed!", [
            {
                text: "Yes",
                onPress: () => removeItem(itemId)
            },
            {
                text: "No"
            }
        ])
    }

    const removeItem = (itemId) => {
        Alert.alert("Success", "Item remove successfully!");
        console.log(itemId);
    }

    return (
        <>
            <View style={styles.container}>
                <FlatList
                    data={items}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    renderItem={({ item }) => (
                        <View>
                            <View style={styles.itemContainer}>
                                <View style={styles.itemRow}>
                                    <Text style={styles.itemName}>{item.ItemName}</Text>
                                    <Text style={styles.itemId}>ID: {item.ItemID}</Text>
                                </View>
                                <Text style={styles.itemDescription}>{item.ItemDescription}</Text>
                                {item.ItemImg ? (
                                    <Image
                                        source={{ uri: `data:image/jpeg;base64,${item.ItemImg}` }}
                                        style={styles.image}
                                    />
                                ) : (
                                    <Text style={styles.noImageText}>No image provided!</Text>
                                )}
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleRemoveItem(item.ItemID)}
                                >
                                    <Text style={styles.buttonText}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
    itemContainer: {
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    itemName: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    itemDescription: {
        marginVertical: 5,
    },
    image: {
        width: 150,
        height: 150,
        marginVertical: 10,
        alignSelf: 'center'
    },
    noImageText: {
        marginVertical: 10,
        color: 'gray',
        fontStyle: 'italic',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemId: {
        fontSize: 14,
        color: 'gray',
        fontStyle: 'italic'
    },
    buttonContainer: {
        overflow: 'hidden',
        marginTop: 10,
        alignItems: 'center',
        width: '100%',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3867d6',
        padding: 10,
        borderRadius: 6,
        marginVertical: 5,
        width: '90%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 10,
    },
    deleteButton: {
        backgroundColor: '#f44336',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        width: 80,
        alignSelf: 'flex-end'
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});