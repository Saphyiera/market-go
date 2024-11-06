import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SERVER_IP from '../../../backend/constant';

export default function Recipe({ route }) {
    const { recipeId } = route.params;
    const navigation = useNavigation();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecipe();
    }, []);

    const fetchRecipe = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:2811/recipe?RecipeID=${recipeId}`);
            const json = await response.json();
            if (json.status === 200) {
                setRecipe(json.data);
            } else {
                console.error(json.message);
            }
        } catch (error) {
            console.error('Error fetching recipe:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#00bfff" style={styles.loader} />;
    }

    if (!recipe) {
        return <Text style={styles.errorText}>Recipe not found</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            {recipe.RecipeImg ? (
                <Image
                    source={{ uri: `data:image/png;base64,${recipe.RecipeImg}` }}
                    style={styles.recipeImage}
                />
            ) : (
                <Text style={{ ...styles.noImageText, alignSelf: 'center' }}>No image</Text>
            )}

            <Text style={styles.recipeTitle}>{recipe.RecipeName}</Text>
            <Text style={styles.username}>Posted by: {recipe.Username}</Text>

            <Text style={styles.sectionTitle}>Ingredients:</Text>
            <View style={styles.ingredientsListContainer}>
                {recipe.Ingredients.map((item) => {
                    return (
                        <TouchableOpacity
                            key={item.ItemID}
                            style={styles.ingredientContainer}
                            onPress={() => {
                                navigation.navigate('Ingredient', { itemId: item.ItemID })
                            }}
                        >
                            <View style={styles.ingredientRow}>
                                {item.ItemImg ? (
                                    <Image
                                        source={{ uri: `data:image/png;base64,${item.ItemImg.replace('base64:type250:', '')}` }}
                                        style={styles.ingredientImage}
                                    />
                                ) : (
                                    <Text style={styles.noImageText}>No image</Text>
                                )}
                                <Text style={styles.ingredientName}>{item.ItemName}</Text>
                            </View>
                            <Text style={styles.ingredientAmount}>Amount: {item.Amount}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            <Text style={styles.sectionTitle}>Instructions:</Text>
            <Text style={styles.instructionsText}>{recipe.Instructions}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f5f5f5',
        flex: 1,
        marginBottom: 5
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    recipeImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        marginBottom: 16,
    },
    recipeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    username: {
        fontSize: 16,
        color: '#666',
        textAlign: 'right',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#444',
        marginTop: 20,
        marginBottom: 10,
    },
    ingredientsListContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
    },
    ingredientContainer: {
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        paddingVertical: 8,
    },
    ingredientRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ingredientImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 12,
    },
    noImageText: {
        fontSize: 12,
        color: '#888',
        width: 60,
        height: 50,
        marginRight: 2,
        paddingTop: 25
    },
    ingredientName: {
        fontSize: 18,
        color: '#333',
    },
    ingredientAmount: {
        fontSize: 14,
        color: '#666',
        paddingLeft: 62,
    },
    instructionsText: {
        fontSize: 16,
        color: '#444',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 20
    },
});
