import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';

import { SERVER_IP, PORT } from '../../../backend/constant';

const AccountSearch = () => {
    const [searchText, setSearchText] = useState('');
    const [userIds, setUserIds] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchText.trim() && userIds.length === 0) {
            alert('Please enter a search term or user IDs!');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/search/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: searchText.trim(),
                    ids: userIds.split(','),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (response.status === 200) {
                setResults(data.data);
            } else {
                alert(response.message || 'Something went wrong!');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Error fetching users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderUser = ({ item }) => {
        return (
            <TouchableOpacity style={styles.userCard} onPress={() => console.log(item.UserID)}>
                <View style={styles.avatarContainer}>
                    {item.Avatar ? (
                        <Image
                            source={{ uri: `data:image/png;base64,${item.Avatar}` }}
                            style={styles.avatar} />
                    ) : (
                        <Text style={styles.avatarText}>?</Text>
                    )}
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.Username}</Text>
                    <Text style={styles.userId}>ID: {item.UserID}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by username..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by userID, separated by , no space"
                    value={userIds}
                    onChangeText={setUserIds}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>


            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.UserID.toString()}
                    renderItem={renderUser}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F8F8F8',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#FFF',
    },
    searchButton: {
        marginLeft: 8,
        backgroundColor: '#007BFF',
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    list: {
        paddingBottom: 16,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        backgroundColor: '#FFF',
        marginBottom: 8,
        position: 'relative',
    },
    avatarContainer: {
        height: 60,
        width: 60,
        borderRadius: 30,
        backgroundColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#555',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userId: {
        position: 'absolute',
        top: 8,
        right: 8,
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
    },
});

export default AccountSearch;
