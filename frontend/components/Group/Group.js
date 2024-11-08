import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Button } from 'react-native';
import { SERVER_IP, PORT } from '../../../backend/constant';

const Group = ({ route, navigation }) => {
    const { groupId } = route.params;
    const [groupDetails, setGroupDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMembers, setShowMembers] = useState(false);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const response = await fetch(`http://${SERVER_IP}:${PORT}/group/details?groupId=${groupId}`);
                const json = await response.json();
                if (json.status === 200) {
                    setGroupDetails(json.data);
                    navigation.setOptions({
                        headerTitle: () => <GroupHeader groupDetails={json.data} />,
                    });
                } else {
                    console.warn(json.message);
                }
            } catch (error) {
                console.error("Error fetching group details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetails();
    }, [groupId, navigation]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!groupDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Group details not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button
                    title='Members'
                    onPress={() => setShowMembers(!showMembers)}
                />
            </View>
            {
                showMembers ? <FlatList
                    data={groupDetails.Members}
                    keyExtractor={(item) => item.MemberID}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.memberContainer}
                            onPress={() => navigation.navigate('Member', { memberId: item.MemberID })}
                        >
                            <Image
                                source={{ uri: `data:image/png;base64,${item.MemberAvatar}` }}
                                style={styles.avatar}
                            />
                            <Text style={styles.username}>{item.Username}</Text>
                        </TouchableOpacity>
                    )}
                /> : null
            }
            <Button title='Plans' onPress={() => navigation.navigate('Group Plans', { groupId: groupId })}></Button>
        </View>
    );
};

const GroupHeader = ({ groupDetails }) => {
    return (
        <View style={styles.headerContainer}>
            {groupDetails.GroupImg ? (
                <Image
                    source={{ uri: `data:image/png;base64,${groupDetails.GroupImg}` }}
                    style={styles.groupImage}
                />
            ) : (
                <Text style={styles.noImageText}>No Group Image</Text>
            )}
            <Text style={styles.groupName}>{groupDetails.GroupName}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f4f4f8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        paddingBottom: 10
    },
    errorText: {
        fontSize: 18,
        color: '#ff4d4d',
        textAlign: 'center',
        fontWeight: '500',
    },
    headerContainer: {
        flexDirection: 'row'
    },
    groupName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
        padding: 10
    },
    groupImage: {
        width: 45,
        height: 45,
        borderRadius: 30,
        alignSelf: 'center',
        marginBottom: 8,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    noImageText: {
        textAlign: 'center',
        color: '#777',
        fontSize: 14,
        fontStyle: 'italic',
    },
    adminText: {
        fontSize: 14,
        textAlign: 'center',
        color: '#666',
        marginTop: 5,
        fontStyle: 'italic',
    },
    memberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#ddd',
        borderColor: '#ccc',
        borderWidth: 1,
    },
    username: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});

export default Group;
