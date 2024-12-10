import React, { useState } from 'react';
import { View, Button, TextInput, Text, Alert, Image, StyleSheet, } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PORT, SERVER_IP } from '../../../backend/constant';

export default function AddCategory() {
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Camera roll permissions are required to select an image.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        } else {
            console.log('Image selection was canceled or failed');
        }
    };

    const addCategory = async () => {
        if (!categoryName || !categoryDescription) {
            Alert.alert('Validation error', 'Name and description are required!');
            return;
        }

        const formData = new FormData();
        formData.append('Name', categoryName);
        formData.append('Description', categoryDescription);
        console.log(image)

        if (image) {
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: 'category.jpg',
            });
        }

        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (response.ok) {
                Alert.alert('Success', 'Category added successfully');
                setCategoryName('');
                setCategoryDescription('');
                setImage(null);
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData);
                Alert.alert('Error', 'Failed to add category');
            }
        } catch (error) {
            console.error('Error adding category:', error);
            Alert.alert('Error', 'Something went wrong!');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Add New Category</Text>
            <TextInput
                placeholder="Name"
                value={categoryName}
                onChangeText={setCategoryName}
                style={styles.input}
            />
            <TextInput
                placeholder="Description"
                value={categoryDescription}
                onChangeText={setCategoryDescription}
                style={styles.input}
                multiline
                numberOfLines={4}
            />
            <Button title="Pick an Image" onPress={pickImage} color="#007BFF" />
            {image ? (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <Text style={styles.imageText}>Image selected</Text>
                </View>
            ) : (
                <Text style={styles.noImageText}>No image selected!</Text>
            )}
            <Button title="Add Category" onPress={addCategory} color="#28A745" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        marginBottom: 15,
        padding: 10,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    imageContainer: {
        marginVertical: 10,
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginVertical: 10,
    },
    imageText: {
        marginVertical: 10,
        color: '#555',
    },
    noImageText: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 10,
    },
});
