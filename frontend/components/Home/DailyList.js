import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import UpdatePlan from './UpdatePlan';
import DeletePlan from './DeletePlan';

export default function DailyList({ dateToBuy, listItem, onUpdate, onDelete }) {
    const [editingIndex, setEditingIndex] = useState(null);

    const toggleEdit = (index) => {
        setEditingIndex(editingIndex === index ? null : index);
    };
    

    return (
        <View style={styles.listContainer}>
            <Text style={styles.dateText}>{dateToBuy}</Text>
            <View style={styles.itemsContainer}>
                {listItem.map((item, index) => (
                    <View key={index} style={styles.item}>
                        {editingIndex === index ? (
                            <UpdatePlan
                                dateToBuy={dateToBuy}
                                item={item}
                                onUpdate={(itemName, updatedFields) => {
                                    onUpdate(index, updatedFields); // Gọi onUpdate từ props
                                    toggleEdit(index); // Đóng chế độ chỉnh sửa
                                }}
                                toggleEdit={() => toggleEdit(index)}
                            />
                        ) : (
                            <View style={styles.itemContent}>
                                <Text style={styles.itemName}>{item.itemName}</Text>
                                <Text style={styles.itemAmount}>{item.amount}</Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.updateButton}
                                        onPress={() => toggleEdit(index)}
                                    >
                                        <Text style={styles.buttonText}>Update</Text>
                                    </TouchableOpacity>
                                    <DeletePlan
                                        dateToBuy={dateToBuy}
                                        item={item}
                                        onDelete={() => onDelete(index)}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    itemsContainer: {
        marginTop: 10,
    },
    item: {
        marginBottom: 10,
    },
    itemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        flex: 1,
    },
    itemAmount: {
        fontSize: 16,
        flex: 1,
        textAlign: 'left',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    updateButton: {
        backgroundColor: 'blue',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    buttonText: {
        color: 'white',
    },
});
