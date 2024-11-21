import { TouchableOpacity } from "react-native-gesture-handler";
import { Alert, FlatList, Text, View, Image, ScrollView } from "react-native";
import ItemSearchBar from "../Item/ItemSearchBar";
import { useState } from "react";
import { SERVER_IP, PORT } from "../../../backend/constant";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

function Ingredient({ onAddIngredient }) {
    const handleAdd = () => {
        onAddIngredient();
    };
    return (
        <View style={styles.addButtons}>
            <TouchableOpacity onPress={handleAdd} style={styles.smallButton}>
                <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function RecipeSearchByIngredients() {
    const [ingredients, setIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const navigation = useNavigation()

    const handleSearchIngredients = async (q = { query: '', type: 'name' }) => {
        const { query, type } = q;
        const endpoint = (type === 'ID' ? `?id=${query}` : `?name=${query}`);
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/item${endpoint}`);
            const result = await response.json();
            if (result.status == 200) {
                setIngredients(result.data);
            } else {
                Alert.alert("Something went wrong", result.message);
            }
        }
        catch (error) {
            console.log("Here: " + error);
        }
    }

    const searchRecipes = async () => {
        console.log(selectedIngredients.map(i => i[0]));
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/search/recipe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ingredientIds: selectedIngredients.map(i => i[0])
                })
            })
            const result = await response.json();
            if (result.status === 200) {
                console.log("OK")
                setRecipes(result.data);
            }
            else {
                console.log(result.message);
            }
        } catch (error) {
            Alert.alert("Error", error);
        }
    }

    const renderIngredients = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
                console.log(item.ItemID);
            }}
        >
            <View style={styles.itemRow}>
                <Text style={styles.itemName}>{item.ItemName}</Text>
                <Text style={styles.itemId}>ID: {item.ItemID}</Text>
            </View>
            <Text style={styles.itemDescription}>{item.ItemDescription}</Text>

            {item.ItemImg ? (
                <Image
                    source={{ uri: `data:image/png;base64,${item.ItemImg}` }}
                    style={styles.image}
                />
            ) : (
                <Text style={styles.noImageText}>No image provided!</Text>
            )}
            <Ingredient onAddIngredient={() => setSelectedIngredients(prev => {
                const cur = prev.filter(([i]) => i !== item.ItemID);
                cur.push([item.ItemID, item.ItemName]);
                console.log(cur);
                return cur;
            })} />
        </TouchableOpacity>
    );

    const renderRecipe = ({ item }) => (
        <TouchableOpacity
            key={item.RecipeID}
            style={styles.recipeContainer}
            onPress={() => { navigation.navigate('Recipe', { recipeId: item.RecipeID }) }}
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
        <ScrollView style={styles.container}>
            <ItemSearchBar onSearch={handleSearchIngredients} />
            <View style={styles.selectedContainer}>
                <Text style={styles.sectionHeader}>Selected Ingredients</Text>
                <FlatList
                    data={selectedIngredients}
                    keyExtractor={(item, index) => `${index}-${index}-${index}`}
                    renderItem={(item) => (
                        <View style={styles.selectedIngredient}>
                            <View style={styles.ingredientInfo}>
                                <Text style={styles.selectedText} numberOfLines={10} ellipsizeMode="tail">
                                    {item.item[1]}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setSelectedIngredients(prev => prev.filter(([i]) => i !== item.item[0]))}
                                style={styles.smallButton}
                            >
                                <Text style={styles.buttonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
            <TouchableOpacity onPress={searchRecipes} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Find recipes with selected ingredients</Text>
            </TouchableOpacity>
            {ingredients.length > 0 ? (
                <FlatList
                    data={ingredients}
                    keyExtractor={(item) => item.ItemID.toString()}
                    renderItem={renderIngredients}
                />
            ) : (
                <Text style={styles.noIngredientsText}>No ingredients found.</Text>
            )}
            {
                recipes.length > 0 ? (<>
                    <Text style={styles.sectionHeader}>Here are what you're looking for</Text>
                    <FlatList
                        data={recipes}
                        renderItem={renderRecipe}
                    ></FlatList>
                </>
                ) : <Text style={styles.noIngredientsText}>No recipes found.</Text>

            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 15,
        marginBottom: 20
    },
    imageContainer: {
        marginRight: 10,
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
    recipeImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    recipeName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    recipeUser: {
        fontSize: 14,
        color: '#6c757d',
    },
    itemContainer: {
        marginBottom: 10,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    itemId: {
        fontSize: 14,
        color: '#777',
    },
    itemDescription: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    image: {
        width: 200,
        height: 200,
        marginTop: 8,
        borderRadius: 8,
        alignSelf: 'center',
    },
    noImageText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    amountInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginRight: 10,
        backgroundColor: '#f1f1f1',
    },
    addButtons: {
        flexDirection: 'row',
    },
    smallButton: {
        backgroundColor: 'cornflowerblue',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
    },
    selectedContainer: {
        marginVertical: 15,
        padding: 10,
        backgroundColor: 'azure',
        borderRadius: 8,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    selectedIngredient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    selectedText: {
        fontSize: 16,
        color: '#333',
        flexShrink: 1,
    },
    submitButton: {
        padding: 15,
        backgroundColor: 'cornflowerblue',
        borderRadius: 8,
        marginVertical: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        alignSelf: 'center',
        fontWeight: '600',
    },
    noIngredientsText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 16,
        marginTop: 20,
    },
    ingredientInfo: {
        flex: 1,
        marginRight: 10,
    },
    imageContainer: {
        marginRight: 10,
    },
    selectedAmountText: {
        fontSize: 14,
        color: '#777',
        flexShrink: 1,
    },
});