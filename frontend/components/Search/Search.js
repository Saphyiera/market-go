import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);

    const handleSearch = () => {
        console.log('Search Term:', searchTerm);
        console.log('Selected Option:', selectedOption);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="What are you looking for?"
                placeholderTextColor="#aaa"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
            <View style={styles.optionsContainer}>
                {[
                    { name: 'Item', des: 'Find item with similar name' },
                    { name: 'Recipe', des: 'Find recipe with specified ingredients' }
                ].map((option, index) => (
                    <View key={index} style={styles.optionContainer}>
                        <TouchableOpacity
                            style={[
                                styles.option,
                                selectedOption === option.name && styles.selectedOption,
                            ]}
                            onPress={() => setSelectedOption(option.name)}
                        >
                            <Text style={styles.optionText}>{option.name}</Text>
                        </TouchableOpacity>
                        <Text style={styles.optionDes}>{option.des}</Text>
                    </View>
                ))}
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleSearch}>
                <Icon name="search" size={20} color="white" />
                <Text style={styles.submitText}>Search</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    input: {
        height: 50,
        textAlign: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    optionsContainer: {
        marginBottom: 20,
    },
    optionContainer: {
        marginBottom: 15,
    },
    option: {
        padding: 15,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    selectedOption: {
        backgroundColor: 'yellow',
    },
    optionText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#333',
    },
    optionDes: {
        paddingTop: 10,
        textAlign: 'left',
        color: '#555',
        fontSize: 14,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        backgroundColor: '#007BFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    submitText: {
        color: 'white',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
});