import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

export default function NotAuth() {
    return (
        <View style={styles.container}>
            <Text style={styles.messageText}>Login to see content.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
    },
    messageText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D9CDB',
    },
});
