import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SERVER_IP, PORT } from "../../../backend/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function AddRecipe() {
    const [recipeName, setRecipeName] = useState("");
    const [instructions, setInstructions] = useState("");
    const [instructionsHeight, setInstructionsHeight] = useState(80);
    const [image, setImage] = useState(null);
    const [userId, setUserId] = useState(-1);
    const navigation = useNavigation();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const uid = await AsyncStorage.getItem('userID');
        if (uid) {
            setUserId(uid);
        }
    };

    const handleImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!recipeName || !instructions || !image) {
            Alert.alert("Please fill in all fields and upload an image.");
            return;
        }

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("recipeName", recipeName);
        formData.append("instructions", instructions);
        formData.append("recipeImg", {
            uri: image.uri,
            name: "recipe.jpg",
            type: "image/jpeg",
        });

        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/recipe`, {
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Recipe added successfully!");
                navigation.navigate('Add Ingredient', { recipeId: result.recipeId });
            } else {
                Alert.alert("Error", "Failed to add recipe.");
            }
        } catch (error) {
            console.error("Error adding recipe:", error);
            Alert.alert("Error", "Something went wrong.");
        } finally {
            setImage(null);
            setInstructions("");
            setRecipeName("");
        }
    };

    const handleCancel = () => {
        setImage(null);
        setInstructions("");
        setRecipeName("");
        setInstructionsHeight(80);
    };

    if (userId === -1) {
        return (
            <View style={styles.messageContainer}>
                <Text style={styles.messageText}>You must login to post a recipe!</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Add a New Recipe!</Text>

            <TextInput
                placeholder="Recipe Name"
                value={recipeName}
                onChangeText={setRecipeName}
                style={styles.input}
                placeholderTextColor="#aaa"
            />
            <TextInput
                placeholder="Instructions"
                value={instructions}
                onChangeText={setInstructions}
                multiline
                style={[styles.input, { height: instructionsHeight }]}
                placeholderTextColor="#aaa"
                onContentSizeChange={(event) =>
                    setInstructionsHeight(event.nativeEvent.contentSize.height)}
            />

            <TouchableOpacity onPress={handleImagePicker} style={styles.imageButton}>
                <Text style={styles.buttonText}>Pick an Image</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image.uri }} style={styles.imagePreview} />}

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                <Text style={styles.buttonText}>Add Recipe</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Remove All</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#f5f5f5",
        alignItems: "center",
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15,
        backgroundColor: "#fff",
        fontSize: 16,
    },
    instructions: {
        height: 100,
        textAlignVertical: "top",
    },
    imageButton: {
        backgroundColor: "#0060F0",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: "center",
        width: "100%",
        marginBottom: 15,
    },
    imagePreview: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
    },
    submitButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center",
        width: "100%",
        marginBottom: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: "#FF6347",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center",
        width: "100%",
    },
    cancelButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});