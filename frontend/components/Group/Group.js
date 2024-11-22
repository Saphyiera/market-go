import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SERVER_IP, PORT } from '../../../backend/constant';
import AccountSearch from '../Account/AccountSearch';
import UpdateGroupImage from './UpdateGroupImage';

const Group = ({ route, navigation }) => {
    const { groupId, userId } = route.params;
    const [groupDetails, setGroupDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMembers, setShowMembers] = useState(false);
    const [newMembers, setNewMembers] = useState("");
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [showChangeImg, setShowchangeImg] = useState(false);

    const fetchGroupDetails = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/group/details?groupId=${groupId}`);
            const json = await response.json();
            if (json.status === 200) {
                console.log(json.data.AdminID);
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

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId, navigation]);

    const hanldeKick = ({ item }) => {
        Alert.alert("Confirm", `You want to kick ${item.Username} from the group? All infomation and task assigned for this user will be removed!`,
            [
                {
                    text: "Yes", onPress: () => {
                        kickMember(item.MemberID);
                    },
                },
                { text: "No" }
            ]
        )
    }

    const kickMember = async (memberId) => {
        const response = await fetch(`http://${SERVER_IP}:${PORT}/group/member`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                groupId, memberId
            })
        })

        const result = await response.json();

        if (result.status === 200) {
            Alert.alert("", "Member Removed")
            fetchGroupDetails();
        } else {
            Alert.alert("Fail", result.message);
        }
    }

    const handleAdd = () => {
        Alert.alert("Confirm", "You want to add member with those IDs: " + newMembers,
            [
                {
                    text: "Yes", onPress: () => addMember()
                },
                {
                    text: "No"
                }
            ]);
    }

    const addMember = async () => {
        console.log(newMembers);
        const response = await fetch(`http://${SERVER_IP}:${PORT}/group/members`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                groupId, memberIds: newMembers.split(',')
            })
        })
        const result = await response.json();

        if (result.status === 200) {
            Alert.alert("Success");
            setNewMembers("");
            fetchGroupDetails();
        } else {
            Alert.alert("Fail", result.message);
        }
    }

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
        <ScrollView style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setShowMembers(!showMembers)}>
                    <Text style={styles.buttonText}>{showMembers ? 'Hide Members' : 'Members'}</Text>
                </TouchableOpacity>
            </View>
            {
                showMembers && (
                    <FlatList
                        data={groupDetails.Members}
                        keyExtractor={(item) => item.MemberID}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.memberContainer}
                                onPress={() => navigation.navigate('Member', { memberId: item.MemberID })}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {item.MemberAvatar ? (
                                        <Image
                                            source={{ uri: `data:image/png;base64,${item.MemberAvatar.replace('base64:type250:', '')}` }}
                                            style={styles.avatar}
                                        />
                                    ) : null}
                                    <Text style={styles.username}>{item.Username}</Text>
                                </View>
                                <View style={styles.iconContainer}>
                                    <TouchableOpacity onPress={() => console.log('Chat with', item.Username)}>
                                        <MaterialIcons name="chat" size={24} color="skyblue" style={styles.icon} />
                                    </TouchableOpacity>
                                    {
                                        item.MemberID != groupDetails.AdminID && userId == groupDetails.AdminID &&
                                        <TouchableOpacity onPress={() => hanldeKick({ item })} style={{ width: 35, height: 20, backgroundColor: 'red', alignItems: 'center', borderRadius: 5 }}>
                                            <Text style={{ color: 'white', fontWeight: '500' }}>Kick</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )
            }
            {showMembers && <View style={styles.additionalActions}>
                <TouchableOpacity style={styles.button} onPress={() => setShowAddMembers(!showAddMembers)}>
                    <Text style={styles.buttonText}>Add Member</Text>
                </TouchableOpacity>
            </View>}
            {
                showMembers && showAddMembers && (<>
                    <AccountSearch />
                    <Text style={[styles.buttonText, { color: 'black', padding: 10 }]}>Add new members by ID</Text>
                    <TextInput placeholder='Enter user id, separated by , no space and press add' value={newMembers} onChangeText={setNewMembers} style={styles.input}></TextInput>
                    <TouchableOpacity onPress={handleAdd} style={styles.button}><Text style={styles.buttonText}>Add</Text></TouchableOpacity>
                </>
                )
            }
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Group Plans', { groupId: groupId })}>
                <Text style={styles.buttonText}>Group Plans</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Share Your Plans', { groupId: groupId, userId: userId })}>
                <Text style={styles.buttonText}>Share Your Daily List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setShowchangeImg(!showChangeImg)}>
                <Text style={styles.buttonText}>Change Group Image</Text>
            </TouchableOpacity>
            {
                showChangeImg && <UpdateGroupImage groupId={groupId} />
            }
        </ScrollView>
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
                null
            )}
            <Text style={styles.groupName}>{groupDetails.GroupName}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#FFF',
        marginBottom: 10
    },
    container: {
        padding: 20,
        backgroundColor: '#f4f4f8',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        paddingBottom: 10,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        fontSize: 18,
        color: '#ff4d4d',
        textAlign: 'center',
        fontWeight: '500',
    },
    headerContainer: {
        flexDirection: 'row',
    },
    groupName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
        padding: 10,
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
    memberContainer: {
        justifyContent: 'space-between',
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
        width: 50,
        height: 50,
        borderRadius: 25,
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
    iconContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    additionalActions: {
        marginVertical: 10,
    },
});

export default Group;
