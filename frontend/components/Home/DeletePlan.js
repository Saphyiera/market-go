import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { PORT, SERVER_IP } from '../../../backend/constant';

export default function DeletePlan({ dateToBuy, item, onDelete }) {
    const handleDelete = () => {
        const { itemName } = item;

        // Gửi yêu cầu DELETE để xóa
        fetch(`http://${SERVER_IP}:${PORT}/list-item`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dateToBuy, itemName }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message); // Thông báo thành công
                onDelete(itemName); // Cập nhật danh sách
            })
            .catch((error) => {
                console.error('Error deleting item:', error);
                alert('Error deleting item. Please try again.');
            });
    };

    return (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    deleteButton: {
        backgroundColor: '#F44336',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
    },
});
