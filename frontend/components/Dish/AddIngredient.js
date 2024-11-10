import { TouchableOpacity } from "react-native-gesture-handler";
import { Alert, FlatList, Text, View, Image, ScrollView, TextInput } from "react-native";
import ItemSearchBar from "../Item/ItemSearchBar";
import { useState } from "react";
import { SERVER_IP, PORT } from "../../../backend/constant";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

function IngredientAmount({ onAddIngredient }) {
    const [amount, setAmount] = useState("");
    const handleAdd = () => {
        console.log(amount);
        onAddIngredient(amount);
    };
    return (
        <View style={styles.amountContainer}>
            <TextInput
                placeholder="Amount"
                onChangeText={setAmount}
                style={styles.amountInput}
                autoCapitalize="false"
            />
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={handleAdd} style={styles.smallButton}>
                    <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function AddIngredient({ route }) {
    const { recipeId } = route.params;
    console.log(recipeId);
    const [ingredients, setIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const navigation = useNavigation();

    const handleSearch = async (q = { query: '', type: 'name' }) => {
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

    const handleSubmit = async () => {
        const ingredientsList = selectedIngredients.map(item => item.slice(0, 2));
        console.log(ingredientsList);
        const response = await fetch(`http://${SERVER_IP}:${PORT}/recipe/ingredients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                recipeId,
                ingredients: ingredientsList
            })
        })
        const result = await response.json();
        if (result.status == 200) {
            Alert.alert("Success", "Added ingredients for recipe");
            navigation.goBack();
        } else {
            console.log(result);
            Alert.alert("Fail", result.message);
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
            <IngredientAmount onAddIngredient={(amount) => setSelectedIngredients(prev => {
                const cur = prev.filter(([i]) => i !== item.ItemID);
                cur.push([item.ItemID, amount, item.ItemName]);
                console.log(cur);
                return cur;
            })} />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <ItemSearchBar onSearch={handleSearch} />
            <View style={styles.selectedContainer}>
                <Text style={styles.sectionHeader}>Selected Ingredients</Text>
                <FlatList
                    data={selectedIngredients}
                    keyExtractor={(item, index) => `${index}-${index}-${index}`}
                    renderItem={(item) => (
                        <View style={styles.selectedIngredient}>
                            <View style={styles.ingredientInfo}>
                                <Text style={styles.selectedText} numberOfLines={10} ellipsizeMode="tail">
                                    Name: {item.item[2]}
                                </Text>
                                <Text style={styles.selectedAmountText} numberOfLines={10} ellipsizeMode="tail">
                                    Amount: {item.item[1]}
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
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Submit</Text>
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 15,
    },
    itemContainer: {
        margin: 10,
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
    actionButtons: {
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
    selectedAmountText: {
        fontSize: 14,
        color: '#777',
        flexShrink: 1,
    },
});