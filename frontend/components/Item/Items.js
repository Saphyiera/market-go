import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ItemSearchBar from './ItemSearchBar'

const SERVER_IP = require('../../../backend/constant');

export default function Items() {
    const navagation = useNavigation();
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

    const handleSearch = async (q = { query: '', type: 'name' }) => {
        const { query, type } = q;
        console.log(query, type);
        const endpoint = (type === 'ID' ? `?id=${query}` : `?name=${query}`);
        try {
            const response = await fetch(`http://${SERVER_IP}:2811/item${endpoint}`);
            const data = await response.json();
            console.log(data);
        }
        catch (error) {
            console.log("Here: " + error);
        }
        finally {
            setHasMore(false);
        }
    }

    return (
        <>
            <View style={styles.container}>
                <ItemSearchBar onSearch={handleSearch}></ItemSearchBar>
                <FlatList
                    data={items}
                    keyExtractor={(item, index) => item.ItemID ? item.ItemID.toString() : `item-${index}`}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                    renderItem={({ item }) => (
                        <View>
                            <TouchableOpacity
                                style={styles.itemContainer}
                                onPress={() => {
                                    navagation.navigate('Item', { itemId: item.ItemID })
                                }}
                            >
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
                            </TouchableOpacity>
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
});