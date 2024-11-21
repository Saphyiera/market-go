import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_IP, PORT } from '../../../backend/constant';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [uid, setUid] = useState(null);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();
    const navigation = useNavigation();

    useEffect(() => {
        if (isFocused) {
            fetchGroups();
        }
    }, [isFocused]);

    const fetchGroups = async () => {
        try {
            const userId = await AsyncStorage.getItem('userID');
            if (userId) {
                setUid(userId);
            }
            console.log(userId)
            console.log("uid", uid);
            const response = await fetch(`http://${SERVER_IP}:${PORT}/group/user?userId=${userId}`);
            const json = await response.json();

            if (json.status === 200) {
                const processedData = json.data.map(group => ({
                    ...group,
                    GroupImg: group.GroupImg ? `data:image/jpeg;base64,${Buffer.from(group.GroupImg).toString('base64')}` : null
                }));
                setGroups(processedData);
            } else {
                setGroups([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.groupContainer}
            onPress={() => navigation.navigate('Group', { groupId: item.GroupID, userId: uid })}>
            <Image
                source={{ uri: item.GroupImg }}
                style={styles.groupImage}
            />
            <View style={styles.textContainer}>
                <Text style={styles.groupName}>{item.GroupName}</Text>
                <Text style={styles.adminName}>Owner: {item.Username}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {!loading && uid != null &&
                <View style={{ marginBottom: 10 }}>
                    <Button title='Create Group' onPress={() => navigation.navigate('Create Group', { adminId: uid })}></Button>
                </View>
            }
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                groups.length > 0 ?
                    <FlatList
                        data={groups}
                        keyExtractor={(item) => item.GroupID.toString()}
                        renderItem={renderItem}
                    /> : <Text style={styles.noGroup}>No group founded, maybe you arent in a group or not login</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    noGroup: {
        fontSize: 14,
        fontStyle: 'italic',
        color: 'gray',
        alignSelf: 'center'
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    groupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    groupImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    groupName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    adminName: {
        fontSize: 14,
        color: '#555',
    },
});

export default Groups;
