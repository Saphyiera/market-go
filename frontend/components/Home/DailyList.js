import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DailyList({ dateToBuy, listItem }) {
    const [check, setCheck] = useState(false);

    function handlePress() {
        setCheck(!check);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.date} onPress={handlePress}>{dateToBuy}</Text>
            {check && listItem.map((item, index) => (
                <View key={index} style={styles.item}>
                    <Text>{item.itemName}</Text>
                    <Text>{item.amount}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 10,
        padding: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },
    date: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'blue',
    },
    item: {
        marginTop: 5,
    }
});