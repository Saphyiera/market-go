import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PORT, SERVER_IP } from '../../../backend/constant';

const UpdateCategory = ({ route, navigation }) => {
    const { item } = route.params;
    const [name, setName] = useState(item.Name);
    const [description, setDescription] = useState(item.Description);
    const [image, setImage] = useState(item.Image);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleUpdate = async () => {
        if (!name || !description) {
            Alert.alert('Error', 'Name and Description are required.');
            return;
        }
        setLoading(true);

        const formData = new FormData();
        formData.append('Name', name);
        formData.append('Description', description);

        if (image !== item.Image) {
            const filename = image.split('/').pop();
            const type = `image/${filename.split('.').pop()}`;
            formData.append('image', { uri: image, name: filename, type });
        }

        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/category/${item.ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Category updated successfully.');
                navigation.goBack();
            } else {
                Alert.alert('Error', result.error || 'Failed to update category.');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            Alert.alert('Error', 'Failed to update category.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter category name"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter category description"
                multiline
            />

            <Text style={styles.label}>Image</Text>
            <TouchableOpacity onPress={pickImage}>
                <Image source={{ uri: image }} style={styles.image} />
            </TouchableOpacity>

            <Button
                title={loading ? "Updating..." : "Update Category"}
                onPress={handleUpdate}
                color="#4CAF50"
                disabled={loading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f4f4f9',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        height: 100,
        marginBottom: 20,
        backgroundColor: '#fff',
        textAlignVertical: 'top',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 12,
        marginBottom: 20,
        resizeMode: 'cover',
        alignSelf: 'center',
    },
});

export default UpdateCategory;
