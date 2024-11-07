import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { SERVER_IP, PORT } from '../../../backend/constant'; // Change to your actual import path
import { Buffer } from 'buffer';

export default function Avatars() {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/users/avt`);
            const result = await response.json();
            if (result.status === 200) {
                setUsers(result.users); // Store the users in the state
            } else {
                console.error('Error fetching users:', result.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <ScrollView style={styles.container}>
            {users.map((user) => (
                <View key={user.UserID} style={styles.userContainer}>
                    <Text style={styles.username}>{user.Username}</Text>
                    {user.Avatar && user.Avatar.data ? (
                        <Image
                            source={{
                                uri: `data:image/jpg;base64,${Buffer.from(user.Avatar.data).toString('base64')}`,
                            }}
                            style={styles.avatar}
                        />
                    ) : (
                        <Text>No Avatar?</Text>
                    )}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    userContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    avatar: {
        width: 100,
        height: 100,
        marginTop: 10,
    },
});
