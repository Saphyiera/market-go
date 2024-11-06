import { useState } from 'react';
import { View, Button, TextInput, Text, Alert, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const SERVER_IP = require('../../../backend/constant');

export default function AddItem() {
    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Camera roll permissions are required to select an image.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        } else {
            console.log("Image selection was canceled or failed");
        }
    };

    const addItem = async () => {
        const formData = new FormData();
        formData.append('itemName', itemName);
        formData.append('itemDescription', itemDescription);

        if (image) {
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: 'item.jpg',
            });
        }

        try {
            const response = await fetch(`http://${SERVER_IP}:2811/item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (response.ok) {
                Alert.alert('Success', 'Item added successfully');
                setItemName('');
                setItemDescription('');
                setImage(null);
            } else {
                Alert.alert('Error', 'Failed to add item');
            }
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Add New Item</Text>
            <TextInput
                placeholder="Name"
                value={itemName}
                onChangeText={setItemName}
                style={styles.input}
            />
            <TextInput
                placeholder="Description"
                value={itemDescription}
                onChangeText={setItemDescription}
                style={styles.input}
                multiline
                numberOfLines={10}
            />
            <Button title="Pick an Image" onPress={pickImage} color="#007BFF" />
            {image ? (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: image }}
                        style={styles.image}
                    />
                    <Text style={styles.imageText}>Image selected</Text>
                </View>
            ) : (
                <Text style={styles.noImageText}>No image selected!</Text>
            )}
            <Button title="Add Item" onPress={addItem} color="#28A745" />
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
        textAlign: 'center'
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
        padding: 10
    },
});
