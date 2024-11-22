import React from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { PORT, SERVER_IP } from '../../../backend/constant';

const SharePlanButton = ({ listId, groupId, userId }) => {
    const handleShare = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/group-list/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    listId,
                    groupId,
                    userId,
                }),
            });

            const json = await response.json();

            if (json.status === 200) {
                Alert.alert('Success', 'List shared successfully!');
            } else {
                Alert.alert('Error', json.message || 'Failed to share the list.');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };

    const handlePress = () => {
        Alert.alert("Confirm", "You want to share this list to your group?", [
            { text: "Yes", onPress: handleShare },
            { text: "No" }
        ])
    }

    return (
        <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Icon name="share-social-outline" size={24} color="#fff" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'cornflowerblue',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        alignSelf: 'flex-end'
    },
});

export default SharePlanButton;