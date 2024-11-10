import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { AntDesign } from '@expo/vector-icons';
const { SERVER_IP, PORT } = require('../../../backend/constant');

const MyRecipes = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [recipes, setRecipes] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [userId, setUserId] = useState(-1);

    const fetchRecipes = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const uid = await AsyncStorage.getItem('userID');
            console.log(uid);
            if (uid) {
                setUserId(uid);
            }
            const response = await fetch(`http://${SERVER_IP}:${PORT}/recipe/owner?userId=${uid}&page=${page}`);
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
        if (isFocused) {
            fetchRecipes();
        }
    }, [page, isFocused]);

    const renderRecipeItem = ({ item, navigation }) => (
        <TouchableOpacity
            key={item.RecipeID}
            style={styles.recipeContainer}
            onPress={() => {
                navigation.navigate('My Recipe', { recipeId: item.RecipeID, ownerId: userId });
            }}
        >
            <View style={styles.imageContainer}>
                {
                    item.RecipeImg ? (
                        <Image
                            source={{ uri: `data:image/png;base64,${Buffer.from(item.RecipeImg).toString('base64')}` }}
                            style={styles.recipeImage}
                        />
                    ) : (
                        <Text style={styles.noImageText}>No image</Text>
                    )
                }
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.recipeName}>{item.RecipeName}</Text>
            </View>
            <TouchableOpacity
                onPress={() => {
                    setRecipes(prev => prev.filter((i) => i.RecipeID != item.RecipeID));
                }
                }
                style={styles.deleteButton}
            >
                <AntDesign name='delete' size={20} color='white' />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    // const handleDelete = async (recipeId) => {
    //     const response = await fetch(`http://${SERVER_IP}:${PORT}/recipe?recipeId=${recipeId}`, {
    //         method: 'DELETE'
    //     })
    //     const result = await response.json();
    //     if (result.status == 200) {
    //         Alert.alert("Success");
    //         setRecipes((prev) => prev.filter((i) => i.RecipeID !== recipeId));
    //     } else {
    //         Alert.alert("Fail", result.message);
    //     }
    // }

    if (userId === -1) {
        return (
            <View style={styles.messageContainer}>
                <Text style={styles.messageText}>You must login to see your recipes!</Text>
            </View>
        );
    }


    return (
        <View style={styles.container}>
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
        position: 'relative',
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
    messageContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    messageText: {
        fontSize: 18,
        color: "#555",
    },
    buttonContainer: {
        backgroundColor: "1000F0"
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#ff4d4d',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
});

export default MyRecipes;