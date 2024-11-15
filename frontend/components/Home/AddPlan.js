import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert } from 'react-native';

export default function AddPlan({ selectedDate, fetchPlans, onAdd }) {
    const [itemID, setItemID] = useState('');
    const [amount, setAmount] = useState('');
    const [listItems, setListItems] = useState([]);

    // Hàm thêm item vào danh sách
    const addItemToList = () => {
        // Kiểm tra dữ liệu nhập
        if (!itemID || !amount) {
            Alert.alert('Validation Error', 'Please enter both ItemID and Amount.');
            return;
        }

        // Tạo item mới
        const newItem = { ItemID: parseInt(itemID.trim(), 10), amount: amount.trim() };
        setListItems(prevItems => [...prevItems, newItem]);

        // Reset input
        setItemID('');
        setAmount('');
    };

    const handleAddPlan = () => {
    if (!selectedDate || listItems.length === 0) {
        Alert.alert('Validation Error', 'Please select a date and add at least one item.');
        return;
    }

    // Dữ liệu cần gửi
    const newPlanData = {
        listItems,
        dateToBuy: selectedDate,
        userId: 0, 
        cost: 100,
    };

    // Gửi yêu cầu POST mà không cần await
    fetch('http://192.168.1.29:2811/daily-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlanData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Items added successfully') {
            Alert.alert('Success', 'Plan added successfully!');
            fetchPlans(); // Làm mới danh sách kế hoạch
            setListItems([]); // Reset danh sách item
        } else {
            Alert.alert('Error', data.message || 'Error adding plan.');
        }
    })
    .catch(error => {
        console.error('ok:', error);
        Alert.alert('ok', 'ok');
        setListItems([]); // Reset danh sách khi có lỗi
    });
    
};


    return (
        <View style={styles.container}>
            <FlatList
                data={listItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
                        <Text>ItemID: {item.ItemID}</Text>
                        <Text>Amount: {item.amount}</Text>
                    </View>
                )}
            />
            <TextInput
                style={styles.input}
                placeholder="ItemID"
                value={itemID}
                onChangeText={setItemID}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
            />
            <View style={styles.buttonContainer}>
                <Button title="Add Item" onPress={addItemToList} color="#4CAF50" />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Add Plan" onPress={handleAddPlan} color="#2196F3" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        marginVertical: 5,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 8,
        borderRadius: 4,
    },
    buttonContainer: {
        marginVertical: 5,
    },
});
