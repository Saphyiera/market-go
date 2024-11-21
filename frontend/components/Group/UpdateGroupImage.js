import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PORT, SERVER_IP } from '../../../backend/constant';

const UpdateGroupImage = ({ groupId }) => {
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera roll permissions are needed to upload an image.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadImage = async () => {
        if (!image) {
            Alert.alert('No Image Selected', 'Please select an image before uploading.');
            return;
        }

        try {
            if (!groupId) {
                Alert.alert('Error', 'Group ID is missing.');
                return;
            }

            const formData = new FormData();
            formData.append('groupimg', {
                uri: image,
                name: 'avatar.jpg',
                type: 'image/jpeg',
            });
            formData.append('groupId', groupId);

            const response = await fetch(`http://${SERVER_IP}:${PORT}/group/avatar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const json = await response.json();

            if (json.status === 200) {
                Alert.alert('Success', 'Image uploaded successfully!');
            } else {
                Alert.alert('Error', json.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Something went wrong while uploading the image.');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                    <Text style={styles.imagePickerText}>Pick an Image</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
                <Text style={styles.uploadButtonText}>Change Group Image</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    imagePicker: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    imagePickerText: {
        color: '#aaa',
        fontSize: 16,
    },
    previewImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    uploadButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default UpdateGroupImage;
