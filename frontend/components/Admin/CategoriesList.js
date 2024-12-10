import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Button } from 'react-native';
import { PORT, SERVER_IP } from '../../../backend/constant';
import { useIsFocused, useNavigation } from '@react-navigation/native';

const CategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const fetchCategories = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/category`);
            const json = await response.json();
            if (json.status === 200) {
                setCategories(json.data);
            } else {
                console.log('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(
            'Delete Category',
            'Are you sure you want to delete this category?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const response = await fetch(`http://${SERVER_IP}:${PORT}/category/${id}`, {
                                method: 'DELETE',
                            });
                            const result = await response.json();
                            if (response.ok) {
                                setCategories((prev) => prev.filter((item) => item.ID !== id));
                                Alert.alert('Success', result.message);
                            } else {
                                Alert.alert('Error', result.message);
                            }
                        } catch (error) {
                            console.error('Error deleting category:', error);;
                            Alert.alert('Error', 'Failed to delete category');
                        }
                    },
                },
            ]
        );
    };

    const handleUpdate = (item) => {
        navigation.navigate('Update Category', { item: item });
    };

    useEffect(() => {
        if (isFocused) {
            fetchCategories();
        }
    }, [isFocused]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading Categories...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={categories}
                keyExtractor={(item) => item.ID.toString()}
                renderItem={({ item }) => (
                    <View style={styles.categoryCard}>
                        <Image source={{ uri: item.Image }} style={styles.image} />
                        <Text style={styles.categoryName}>{item.Name}</Text>
                        <Text style={styles.categoryDescription}>{item.Description}</Text>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={() => handleUpdate(item)}
                            >
                                <Text style={styles.buttonText}>Update</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDelete(item.ID)}
                            >
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 10,
        backgroundColor: '#f4f4f9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: '#888',
    },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 15,
        padding: 15,
        alignItems: 'center',
        elevation: 5,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 12,
        marginBottom: 12,
        resizeMode: 'cover',
    },
    categoryName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    categoryDescription: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        lineHeight: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        width: '100%',
    },
    updateButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginRight: 10
    },
    deleteButton: {
        backgroundColor: '#F44336',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CategoriesList;
