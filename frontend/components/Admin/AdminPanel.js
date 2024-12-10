import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Button, StyleSheet, ScrollView, Text } from 'react-native';

const AdminPanel = () => {
    const navigation = useNavigation();

    const navigateToScreen = (screenName) => {
        navigation.navigate(screenName);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Welcome to the Admin Panel</Text>
                <Text style={styles.subHeaderText}>What would you like to do?</Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Accounts"
                    onPress={() => navigateToScreen('Accounts Admin')}
                    color="cornflowerblue"
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Items"
                    onPress={() => navigateToScreen('Items Admin')}
                    color="cornflowerblue"
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Categories"
                    onPress={() => navigateToScreen('Categories Admin')}
                    color="cornflowerblue"
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Add Category"
                    onPress={() => navigateToScreen('Add Category')}
                    color="cornflowerblue"
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Update Category"
                    onPress={() => navigateToScreen('Update Category')}
                    color="cornflowerblue"
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Recipes"
                    onPress={() => navigateToScreen('Recipes Admin')}
                    color="cornflowerblue"
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Groups"
                    onPress={() => navigateToScreen('Groups Admin')}
                    color="cornflowerblue"
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f4f4f9',
        flexGrow: 1,
    },
    headerContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subHeaderText: {
        fontSize: 16,
        color: '#777',
        marginTop: 5,
    },
    buttonContainer: {
        marginBottom: 15,
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
    },
});

export default AdminPanel;
