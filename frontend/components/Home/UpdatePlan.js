import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
const { SERVER_IP, PORT } = require("../../../backend/constant");

export default function UpdatePlan({ dateToBuy, item, onUpdate, toggleEdit }) {
    const [updatedAmount, setUpdatedAmount] = useState(item.amount);

    const handleUpdate = () => {
        const { itemName } = item;

        fetch(`http://${SERVER_IP}:${PORT}/daily-list`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dateToBuy, itemName, newAmount: updatedAmount }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message);
                onUpdate(itemName, { amount: updatedAmount });
                toggleEdit();
            })
            .catch((error) => {
                console.error('Error updating item:', error);
                alert('Error updating item. Please try again.');
            });
    };

    return (
        <View style={styles.editContainer}>
            <TextInput
                style={styles.input}
                value={updatedAmount.toString()}
                onChangeText={setUpdatedAmount}
            />
            <View style={styles.actions}>
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={toggleEdit}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingLeft: 8,
        borderRadius: 4,
        width: '40%',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    cancelButton: {
        backgroundColor: '#FF9800',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
    },
});
