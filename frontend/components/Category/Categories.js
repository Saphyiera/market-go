import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { PORT, SERVER_IP } from '../../../backend/constant';
import { useNavigation } from '@react-navigation/native';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

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

    useEffect(() => {
        fetchCategories();
    }, []);

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
                    <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8}
                        onPress={() => navigation.navigate('Category Items', { categoryId: item.ID })}
                    >
                        <Image source={{ uri: item.Image }} style={styles.image} />
                        <Text style={styles.categoryName}>{item.Name}</Text>
                        <Text style={styles.categoryDescription}>{item.Description}</Text>
                    </TouchableOpacity>
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
});

export default Categories;
