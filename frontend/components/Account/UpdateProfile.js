import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_IP, PORT } from '../../../backend/constant';

export default function UpdateProfile({ navigation }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [introduction, setIntroduction] = useState('');
    const [loading, setLoading] = useState(false);

    const [info, setInfo] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userId = await AsyncStorage.getItem('userID');
                const response = await fetch(`http://${SERVER_IP}:${PORT}/user?userId=${userId}`);
                const result = await response.json();
                if (result.status === 200) {
                    setInfo(result.data);
                    setUsername(result.data.Username);
                    setEmail(result.data.Email);
                    setPhoneNumber(result.data.PhoneNumber);
                    setIntroduction(result.data.Introduction || '');
                } else {
                    console.log(result.error);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchUserInfo();
    }, []);

    const handleUpdateProfile = async () => {
        if (!username || !email || !phoneNumber) {
            Alert.alert('Error', 'Username, email, and phone number are required.');
            return;
        }

        setLoading(true);

        try {
            const userId = await AsyncStorage.getItem('userID');

            const response = await fetch(`http://${SERVER_IP}:${PORT}/user/info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    username,
                    email,
                    phoneNumber,
                    introduction,
                }),
            });

            const result = await response.json();
            if (response.status === 200) {
                Alert.alert('Success', 'Profile updated successfully!');
                navigation.navigate('Account');
            } else {
                Alert.alert('Error', result.error || 'An error occurred while updating profile.');
            }
        } catch (error) {
            console.log('Error updating profile:', error);
            Alert.alert('Error', 'An error occurred while updating profile.');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Update Profile</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Introduction"
                value={introduction}
                onChangeText={setIntroduction}
                multiline
                numberOfLines={4}
            />

            <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={handleUpdateProfile}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Updating...' : 'Update Profile'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingLeft: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    updateButton: {
        backgroundColor: '#2D9CDB',
    },
    cancelButton: {
        backgroundColor: '#e63946',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});