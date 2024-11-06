import React, { useState } from 'react';
import { View, TextInput, Alert, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';


const ItemSearchBar = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('Name');

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            Alert.alert('Please enter a search term');
            return;
        }

        onSearch({ query: searchQuery, type: searchType });
    };

    const handleChangeSearchType = () => {
        setSearchType(prevType => (prevType === 'Name' ? 'ID' : 'Name'));
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={`Search by ${searchType === 'Name' ? 'Name' : 'ID'}`}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <View style={styles.buttonContainer}>
                <Icon name="search" size={20} color="black" onPress={handleSearch} style={{ paddingTop: 10 }} />
                <Text onPress={handleChangeSearchType} style={{ paddingTop: 5, width: 40, height: 30, textAlign: 'center' }}>{searchType}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        elevation: 3,
        marginVertical: 10
    },
    input: {
        flex: 1,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginRight: 5,
        padding: 10,
        backgroundColor: '#ffffff',
    },
    buttonContainer: {
        alignItems: 'center',
    },
});

export default ItemSearchBar;