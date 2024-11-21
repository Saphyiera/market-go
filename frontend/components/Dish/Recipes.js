import React, { useEffect, useState } from 'react';
import { Button, TouchableOpacity } from 'react-native';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { SERVER_IP } = require('../../../backend/constant');

const Recipes = () => {
    const navigation = useNavigation();
    const [recipes, setRecipes] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showActions, setShowActions] = useState(false);

    const fetchRecipes = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const response = await fetch(`http://${SERVER_IP}:2811/recipe/all?page=${page}`);
            const result = await response.json();

            if (result.status === 200) {
                setRecipes((prev) => [...prev, ...result.data]);
                setHasMore(result.data.length === 10);
            } else {
                console.error("Error fetching recipes:", result.message);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, [page]);

    const renderRecipeItem = ({ item, navigation }) => (
        <TouchableOpacity
            key={item.RecipeID}
            style={styles.recipeContainer}
            onPress={() => {
                navigation.navigate('Recipe', { recipeId: item.RecipeID });
            }}
        >
            <View style={styles.imageContainer}>
                {
                    item.RecipeImg ? (
                        <Image
                            source={{ uri: `data:image/png;base64,${item.RecipeImg}` }}
                            style={styles.recipeImage}
                        />
                    ) : (
                        <Text style={styles.noImageText}>No image</Text>
                    )
                }
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.recipeName}>{item.RecipeName}</Text>
                <Text style={styles.recipeUser}>By {item.Username}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.actionsButton}
                onPress={() => setShowActions(!showActions)}
            >
                <Text style={styles.actionsButtonText}>Actions</Text>
                {showActions && (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => navigation.navigate('Add Recipe')}
                        >
                            <Text style={styles.navButtonText}>Add Recipe</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => navigation.navigate('My Recipes')}
                        >
                            <Text style={styles.navButtonText}>My Recipes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => navigation.navigate('Search Recipe')}
                        >
                            <Text style={styles.navButtonText}>Find Recipes</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>

            <FlatList
                data={recipes}
                renderItem={(props) => renderRecipeItem({ ...props, navigation })}
                keyExtractor={(item, index) => `${item.RecipeName}-${index}`}
                onEndReached={() => setPage((prev) => prev + 1)}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    actionsButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
    },
    actionsButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionsContainer: {
        marginTop: 10,
        backgroundColor: '#f8f9fa',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        width: '100%'
    },
    navButton: {
        backgroundColor: 'cornflowerblue',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginVertical: 5,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    navButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    recipeContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    imageContainer: {
        marginRight: 10,
    },
    recipeImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    noImageText: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        lineHeight: 80,
        backgroundColor: '#e9ecef',
        borderRadius: 8,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    recipeName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    recipeUser: {
        fontSize: 14,
        color: '#6c757d',
    },
});

export default Recipes;
