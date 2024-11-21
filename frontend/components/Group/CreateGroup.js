import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SERVER_IP, PORT } from '../../../backend/constant';

const CreateGroup = ({ navigation, route }) => {
    const adminId = route.params.adminId;
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateGroup = async () => {
        if (!groupName.trim() || !adminId.trim()) {
            Alert.alert('Validation Error', 'Please provide Group Name');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/group/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupName, adminId }),
            });

            const result = await response.json();
            console.log(result);

            if (response.ok && result.status === 200) {
                Alert.alert('Success', `Group "${groupName}" created successfully!`);
                setGroupName('');
                navigation.goBack(); // Navigate back after successful creation
            } else {
                Alert.alert('Error', result.message || 'Failed to create the group.');
            }
        } catch (error) {
            console.error('Error creating group:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        console.log(adminId)
    })

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Group</Text>
            <TextInput
                style={styles.input}
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
            />
            <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleCreateGroup}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Group'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f4f4f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#4caf50',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#9e9e9e',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CreateGroup;
