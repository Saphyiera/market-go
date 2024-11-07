import { Image, Text, View, ScrollView, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import * as ImagePicker from 'expo-image-picker';
import { SERVER_IP, PORT } from '../../../backend/constant';

export default function Account() {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const fetchUserInfo = async () => {
        try {
            const userId = await AsyncStorage.getItem('userID');
            const response = await fetch(`http://${SERVER_IP}:${PORT}/user?userId=${userId}`);
            const result = await response.json();
            if (result.status === 200) {
                setInfo(result.data);
            } else {
                console.log(result.error);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userID');
            navigation.replace('Login');
        } catch (error) {
            console.log("Error during logout: ", error);
        }
    };

    const handlePickAvatar = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Permission to access camera roll is required!");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
            handleAvatarUpload(pickerResult.assets[0].uri);
        }
    };

    const handleAvatarUpload = async (image) => {
        try {
            const userId = await AsyncStorage.getItem('userID');

            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('avatar', {
                uri: image,
                name: 'avatar.jpg',
                type: 'image/jpeg'
            });

            const response = await fetch(`http://${SERVER_IP}:${PORT}/user/avatar/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const result = await response.json();
            if (response.status === 200) {
                alert("Avatar updated successfully!");
                fetchUserInfo();
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.log("Error uploading avatar:", error);
            alert("Error uploading avatar.");
        }
    };

    if (!info || loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileContainer}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar}>
                        {info.Avatar && info.Avatar.data ? (
                            <Image
                                source={{
                                    uri: `data:image/jpg;base64,${Buffer.from(info.Avatar.data).toString('base64')}`,
                                }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Text style={styles.noImageText}>No Image</Text>
                        )}
                    </TouchableOpacity>
                    <View style={styles.userDetailsContainer}>
                        <Text style={styles.userName}>{info.Username}</Text>
                        <Text style={styles.userID}>ID: {info.UserID}</Text>
                        <Text>Tap to update profile picture</Text>
                    </View>
                </View>
                <View style={styles.userInfoContainer}>
                    <Text style={styles.userInfoText}>Email: {info.Email}</Text>
                    <Text style={styles.userInfoText}>Phone: {info.PhoneNumber}</Text>
                    <Text style={styles.userInfoText}>Intro: {info.Introduction}</Text>
                </View>
            </View>
            <Button title="Logout" onPress={handleLogout} color="#e63946" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1faee',
        paddingHorizontal: 20,
    },
    profileContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 20,
        marginTop: 20
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginRight: 15,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#a8dadc',
    },
    userDetailsContainer: {
        flex: 1,
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1d3557',
    },
    userID: {
        fontSize: 14,
        color: '#a8dadc',
    },
    userInfoContainer: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    userInfoText: {
        fontSize: 16,
        color: '#1d3557',
        marginBottom: 8,
    },
    noImageText: {
        fontSize: 16,
        color: '#a8dadc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#888',
    },
});
