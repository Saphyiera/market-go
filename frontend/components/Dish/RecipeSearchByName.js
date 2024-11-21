import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SERVER_IP, PORT } from '../../../backend/constant';
import { useNavigation } from '@react-navigation/native';

const RecipeSearchByName = () => {
    const [recipeName, setRecipeName] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation()

    const handleSearch = async () => {
        const body = {}
        if (!recipeName.trim()) {
            alert('Please enter a search term!');
            return;
        }
        body.name = recipeName.trim()
        setLoading(true);

        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/search/recipe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 200) {
                setResults(data.data);
            } else {
                alert(data.message || 'Something went wrong!');
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            alert('Error fetching recipes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderRecipe = ({ item }) => (
        <TouchableOpacity style={styles.recipeCard} onPress={() => { navigation.navigate('Recipe', { recipeId: item.RecipeID }) }}>
            {
                item.RecipeImg
                    ? <Image source={{ uri: `data:image/jpeg;base64,${item.RecipeImg}` }} style={styles.recipeImage} />
                    : <Text style={styles.noImageText}>No image</Text>
            }
            <View style={styles.recipeDetails}>
                <Text style={styles.recipeName}>{item.RecipeName}</Text>
                <Text style={styles.recipeUser}>By: {item.Username}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by recipe name..."
                    value={recipeName}
                    onChangeText={setRecipeName}
                    onSubmitEditing={() => handleSearch('name')}
                />
                <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch()}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.RecipeID.toString()}
                    renderItem={renderRecipe}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F4F4F9',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        height: 45,
        borderWidth: 1,
        borderColor: '#007BFF',
        borderRadius: 25,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
        fontSize: 16,
    },
    searchButton: {
        marginLeft: 12,
        backgroundColor: '#007BFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    list: {
        paddingBottom: 16,
    },
    recipeCard: {
        flexDirection: 'row',
        marginBottom: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        backgroundColor: '#FFF',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    recipeImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    recipeDetails: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: 12,
    },
    recipeName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    recipeUser: {
        fontSize: 14,
        color: '#666',
    },
    noImageText: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        lineHeight: 80,
        backgroundColor: '#E9ECEF',
        borderRadius: 12,
        fontSize: 14,
        color: '#B0B0B0',
    },
});

export default RecipeSearchByName;
