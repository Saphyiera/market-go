import { useState } from 'react';
import { Text, TouchableOpacity, Image, StyleSheet, View, Alert } from 'react-native';
const SERVER_IP = require('../../../backend/constant')

const FridgeItem = ({ item, userId, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:2811/fridge/item?UserID=${userId}&ItemID=${item.ItemID}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.status === 200) {
                onDelete(item.ItemID);
                Alert.alert("Success", "Item deleted successfully!");
            } else {
                Alert.alert("Error", result.message || "Failed to delete the item.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Server error, please try again.");
        }
    };

    const getExpireDateStyle = () => {
        const currentDate = new Date();
        const expireDate = new Date(item.ExpireDate);

        if (expireDate < currentDate) {
            return styles.expiredDate;
        }
        return styles.validDate;
    };

    return (
        <TouchableOpacity style={styles.container} onPress={toggleExpand}>
            <Text style={styles.itemName}>{item.ItemName}</Text>
            <Text style={styles.itemAmount}>Amount: {item.Amount}</Text>
            <View style={styles.expireDateContainer}>
                <Text style={styles.expireDateLabel}>Expire Date:</Text>
                <Text style={getExpireDateStyle()}>{item.ExpireDate}</Text>
            </View>

            {isExpanded && (
                <>
                    <Text style={styles.description}>{item.ItemDescription}</Text>
                    <View style={styles.imageAndButtonContainer}>
                        {item.ItemImg ? (
                            <Image
                                source={{ uri: `data:image/jpeg;base64,${item.ItemImg}` }}
                                style={styles.image}
                            />
                        ) : (
                            <Text style={styles.noImageText}>No image</Text>
                        )}

                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Text style={styles.deleteButtonText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f4f6f9',
        borderRadius: 8,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemAmount: {
        fontSize: 16,
        color: '#555',
        marginBottom: 4,
    },
    expireDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    expireDateLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    validDate: {
        fontSize: 14,
        color: 'blue',
        fontWeight: '600',
        padding: 4,
        backgroundColor: '#e7f3ff',
        borderRadius: 4,
    },
    expiredDate: {
        fontSize: 14,
        color: '#d9534f',
        fontWeight: '600',
        padding: 4,
        backgroundColor: '#f9e2e1',
        borderRadius: 4,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginVertical: 8,
        alignSelf: 'center'
    },
    description: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    noImageText: {
        fontSize: 14,
        color: 'gray',
        fontStyle: 'italic',
        marginVertical: 10,
        textAlign: 'center',
    },
    deleteButton: {
        backgroundColor: '#d9534f',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default FridgeItem;