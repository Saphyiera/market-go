import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SERVER_IP, PORT } from '../../../backend/constant';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const OwnerSearch = () => {
    const [searchText, setSearchText] = useState('');
    const [userIds, setUserIds] = useState('');
    const [results, setResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const navigation = useNavigation();

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

    const searchRecipes = async () => {
        console.log(selectedUsers);
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/search/recipe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ownerIds: selectedUsers.map(i => i['UserID'])
                })
            })
            const result = await response.json();
            if (result.status === 200) {
                console.log("OK")
                setRecipes(result.data);
            }
            else {
                console.log(result.message);
            }
        } catch (error) {
            Alert.alert("Error", error);
        }
    }

    const handleUserSelect = (user) => {
        if (!selectedUsers.some((u) => u.UserID === user.UserID)) {
            setSelectedUsers((prev) => [...prev, { Username: user.Username, UserID: user.UserID }]);
        }
    };

    const handleUserRemove = (userId) => {
        setSelectedUsers((prev) => prev.filter((user) => user.UserID !== userId));
    };

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
                {item.Avatar ? (
                    <Image
                        source={{ uri: `data:image/png;base64,${item.Avatar}` }}
                        style={styles.avatar}
                    />
                ) : (
                    <Text style={styles.avatarText}>?</Text>
                )}
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.Username}</Text>
                <Text style={styles.userId}>ID: {item.UserID}</Text>
            </View>
            <View style={styles.addButton}>
                <TouchableOpacity
                    style={styles.roundedButton}
                    onPress={() => handleUserSelect(item)}
                >
                    <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSelectedUser = ({ item }) => (
        <View style={styles.selectedUserCard}>
            <Text style={styles.selectedUserDetails}>
                {`Username: ${item.Username}, UserID: ${item.UserID}`}
            </Text>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleUserRemove(item.UserID)}
            >
                <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );
    const renderRecipe = ({ item }) => (
        <TouchableOpacity
            key={item.RecipeID}
            style={styles.recipeContainer}
            onPress={() => { navigation.navigate('Recipe', { recipeId: item.RecipeID }) }}
        >
            <View style={styles.imageContainer}>
                {
                    item.RecipeImg ? (
                        <Image
                            source={{ uri: `data:image/png;base64,${item.RecipeImg}` }}
                            style={styles.recipeImage}
                        />
                    ) : (
                        <Text style={styles.noImageText}>No image</Text>
                    )
                }
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.recipeName}>{item.RecipeName}</Text>
                <Text style={styles.recipeUser}>By {item.Username}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Find owners by username..."
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
                    placeholder="Find owner by userID, separated by , no space"
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

            {selectedUsers.length > 0 && (
                <View style={styles.selectedUsersContainer}>
                    <Text style={styles.selectedUsersHeader}>Selected Users:</Text>
                    <FlatList
                        data={selectedUsers}
                        keyExtractor={(item) => item.UserID.toString()}
                        renderItem={renderSelectedUser}
                        contentContainerStyle={styles.selectedList}
                    />
                </View>
            )}
            <TouchableOpacity onPress={searchRecipes} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Find recipes of selected users</Text>
            </TouchableOpacity>
            {
                recipes.length > 0 ? (<>
                    <Text style={styles.sectionHeader}>Here are what you're looking for</Text>
                    <FlatList
                        data={recipes}
                        renderItem={renderRecipe}
                    ></FlatList>
                </>
                ) : <Text style={styles.noIngredientsText}>No recipes found.</Text>

            }
        </ScrollView>

    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#F8F8F8',
        marginBottom: 20
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    recipeContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    recipeImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    recipeName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    recipeUser: {
        fontSize: 14,
        color: '#6c757d',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
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
    textContainer: {
        flex: 1,
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
        borderRadius: 30,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userId: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
    },
    addButton: {
        margin: 10,
    },
    roundedButton: {
        width: 30,
        height: 30,
        backgroundColor: '#007BFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    selectedUsersContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    selectedUsersHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    selectedUserCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        backgroundColor: '#F8F8F8',
        marginBottom: 8,
    },
    selectedUserDetails: {
        fontSize: 14,
        color: '#555',
    },
    removeButton: {
        backgroundColor: '#FF5C5C',
        padding: 8,
        borderRadius: 4,
    },
    removeButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    submitButton: {
        padding: 15,
        backgroundColor: 'cornflowerblue',
        borderRadius: 8,
        marginVertical: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        alignSelf: 'center',
        fontWeight: '600',
    },
    noIngredientsText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 16,
        marginTop: 20,
    },
    imageContainer: {
        marginRight: 10,
    },
    noImageText: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        lineHeight: 80,
        backgroundColor: '#e9ecef',
        borderRadius: 8,
    },
});

export default OwnerSearch;