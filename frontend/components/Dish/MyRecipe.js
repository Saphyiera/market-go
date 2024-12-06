import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { PORT, SERVER_IP } from '../../../backend/constant';
import UpdateRecipe from './UpdateRecipe';

export default function MyRecipe({ route }) {
    const { recipeId, ownerId } = route.params;
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const Ref = useRef(null);

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUpdateSegment, setShowUpdateSegment] = useState(false);
    const [removedIngredients, setRemovedIngredients] = useState([]);

    useEffect(() => {
        if (isFocused) {
            console.log(ownerId, recipeId);
            fetchRecipe();
            setRemovedIngredients([]);
        }
    }, [isFocused]);

    const ScrollBottom = () => {
        Ref.current.scrollToEnd({ animated: true });
    }

    const fetchRecipe = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:2811/recipe/v2?RecipeID=${recipeId}`);
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

    const handleRemoveIngredient = (item) => {
        console.log(item.ItemID, recipeId);
        setRecipe((prev) => ({
            ...prev,
            Ingredients: prev.Ingredients.filter((i) => i.ItemID !== item.ItemID),
        }));
        setRemovedIngredients(prev => [...prev, item]);
    }

    const handleUndoIngredient = (item) => {
        setRemovedIngredients(prev => prev.filter(i => i.ItemID !== item.ItemID));
        setRecipe(prev => ({
            ...prev,
            Ingredients: [...prev.Ingredients, item]
        }))
    }

    const handleRemoveSubmit = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/recipe/ingredients`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipeId,
                    itemId: removedIngredients.map(i => i.ItemID)
                }),
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Success:', result);
                Alert.alert("Success", "Ingredients remove succussfully!")
                setRemovedIngredients([]);
            } else {
                console.error('Error:', result);
                Alert.alert("Fail", "Something went wrong!")
            }
        } catch (error) {
            console.error('Request failed', error);
            Alert.alert("Error", "Server Error!")
        }
    }

    if (loading) {
        return <ActivityIndicator size="large" color="#00bfff" style={styles.loader} />;
    }

    if (!recipe) {
        return <Text style={styles.errorText}>Recipe not found</Text>;
    }

    return (
        <ScrollView style={styles.container} ref={Ref}>
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
            {
                recipe.Ingredients.length !== 0
                    ? <View style={styles.ingredientsListContainer}>
                        {recipe.Ingredients.map((item) => (
                            <View key={item.ItemID} style={styles.ingredientContainer}>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveIngredient(item)}
                                >
                                    <Text style={styles.removeButtonText}>Remove</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('Ingredient', { itemId: item.ItemID });
                                    }}
                                >
                                    <View style={styles.ingredientRow}>
                                        {item.ItemImg ? (
                                            <Image
                                                source={{ uri: `data:image/png;base64,${item.ItemImg}` }}
                                                style={styles.ingredientImage}
                                            />
                                        ) : (
                                            <Text style={styles.noImageText}>No image</Text>
                                        )}
                                        <Text style={styles.ingredientName}>{item.ItemName}</Text>
                                    </View>
                                    <Text style={styles.ingredientAmount}>Amount: {item.Amount}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                    : <Text style={styles.noIngredientText}>You haven't add any ingredient for this dish!</Text>
            }
            <TouchableOpacity onPress={() => navigation.navigate('Add Ingredient', { recipeId })} style={styles.addIngredientButton} >
                <Text style={styles.addIngredientText}>Add an ingredient</Text>
            </TouchableOpacity>
            {
                removedIngredients.length !== 0
                    ? <View style={styles.ingredientsListContainer}>
                        {removedIngredients.map((item) => (
                            <View key={item.ItemID + "-" + item.ItemID} style={styles.ingredientContainer}>
                                <TouchableOpacity
                                    style={styles.undoButton}
                                    onPress={() => handleUndoIngredient(item)}
                                >
                                    <Text style={styles.removeButtonText}>Undo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('Ingredient', { itemId: item.ItemID });
                                    }}
                                >
                                    <View style={styles.ingredientRow}>
                                        {item.ItemImg ? (
                                            <Image
                                                source={{ uri: `data:image/png;base64,${item.ItemImg}` }}
                                                style={styles.ingredientImage}
                                            />
                                        ) : (
                                            <Text style={styles.noImageText}>No image</Text>
                                        )}
                                        <Text style={styles.ingredientName}>{item.ItemName}</Text>
                                    </View>
                                    <Text style={styles.ingredientAmount}>Amount: {item.Amount}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                    : <Text style={styles.noIngredientText}>You haven't remove any ingredients from this dish!</Text>
            }
            {
                removedIngredients.length !== 0 &&
                <TouchableOpacity onPress={handleRemoveSubmit} style={styles.addIngredientButton} >
                    <Text style={styles.addIngredientText}>Remove all selected ingredients</Text>
                </TouchableOpacity>
            }
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <Text style={styles.instructionsText}>{recipe.Instructions}</Text>
            <TouchableOpacity onPress={() => {
                setShowUpdateSegment(!showUpdateSegment);
                ScrollBottom();
            }} style={styles.addIngredientButton}>
                <Text style={styles.addIngredientText}>Update Recipe</Text>
            </TouchableOpacity>
            {
                showUpdateSegment
                    ? <UpdateRecipe recipeId={recipeId} />
                    : null
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    noIngredientText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: 'gray',
        padding: 5,
    },
    addIngredientButton: {
        padding: 15,
        backgroundColor: 'cornflowerblue',
        borderRadius: 8,
        marginVertical: 20,
    },
    addIngredientText: {
        color: '#fff',
        fontSize: 16,
        alignSelf: 'center',
        fontWeight: '600',
    },
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
        width: 250,
        height: 250,
        borderRadius: 12,
        marginBottom: 16,
        alignSelf: 'center'
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
        position: 'relative',
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
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ff4444',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 5,
        zIndex: 1, // Ensures the button is clickable above other elements
    },
    undoButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#5000f0',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 5,
        zIndex: 1, // Ensures the button is clickable above other elements
    },
    removeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    }
});
