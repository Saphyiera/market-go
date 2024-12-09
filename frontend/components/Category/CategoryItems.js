import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { SERVER_IP, PORT } from '../../../backend/constant';

const CategoryItems = ({ route }) => {
    const { categoryId } = route.params;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
    });

    const fetchItems = async (page = 1) => {
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/category/items?categoryId=${categoryId}&page=${page}&limit=10`);
            const data = await response.json();

            setItems(data.items);
            setPagination({
                currentPage: data.pagination.currentPage,
                totalPages: data.pagination.totalPages,
                totalItems: data.pagination.totalItems,
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching items:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [categoryId]);

    const renderItem = ({ item }) => {
        return (
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
                </View>
            </View>
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.ItemID.toString()}
                onEndReached={() => {
                    if (pagination.currentPage < pagination.totalPages) {
                        fetchItems(pagination.currentPage + 1);
                    }
                }}
                onEndReachedThreshold={0.5}
            />
        </View>
    );
};

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
});

export default CategoryItems;
