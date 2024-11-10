import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SERVER_IP } from '../../../backend/constant';

export default function UpdateRecipe({ recipeId }) {
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleUpdate = async () => {
        const formData = new FormData();
        formData.append('recipeId', recipeId);

        if (name) formData.append('name', name);
        if (instructions) formData.append('instructions', instructions);
        if (image) {
            formData.append('img', {
                uri: image.uri,
                name: 'recipe-image.jpg',
                type: 'image/jpeg',
            });
        }

        try {
            const response = await fetch(`http://${SERVER_IP}:2811/recipe/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
            const json = await response.json();

            if (json.status === 200) {
                Alert.alert("Success", "Recipe updated successfully");
                setImage(null);
                setInstructions("");
                setName("");
            } else {
                Alert.alert("Error", json.message || "Failed to update recipe");
            }
        } catch (error) {
            console.error('Error updating recipe:', error);
            Alert.alert("Error", "Failed to update recipe");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>New Recipe Name</Text>
            <TextInput
                style={styles.input}
                placeholder="New recipe name"
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>New Instructions</Text>
            <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="New instructions"
                value={instructions}
                onChangeText={setInstructions}
                multiline
            />

            <Text style={styles.label}>New Recipe Image</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {image ? (
                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                ) : (
                    <Text style={styles.imageText}>Pick an image</Text>
                )}
            </TouchableOpacity>

            <Button title="Update Recipe" onPress={handleUpdate} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginBottom: 16,
        borderRadius: 8,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    imagePicker: {
        backgroundColor: '#f0f0f0',
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderRadius: 8,
    },
    imagePreview: {
        width: 250,
        height: 250,
        borderRadius: 8,
    },
    imageText: {
        color: '#888',
        fontSize: 16,
    },
});