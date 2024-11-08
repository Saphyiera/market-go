import { Image, Text, View, ScrollView, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import { SERVER_IP, PORT } from '../../../backend/constant';
import { Button } from 'react-native';

export default function Member({ route }) {
    const { memberId } = route.params;
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserInfo = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/user?userId=${memberId}`);
            const result = await response.json();
            if (result.status === 200) {
                setInfo(result.data);
            } else {
                console.log(result.error);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    if (!info || loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileContainer}>
                <View style={styles.headerContainer}>
                    {info.Avatar && info.Avatar.data ? (
                        <Image
                            source={{
                                uri: `data:image/jpg;base64,${Buffer.from(info.Avatar.data).toString('base64')}`,
                            }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <Text style={styles.noImageText}>No Image</Text>
                    )}
                    <View style={styles.userDetailsContainer}>
                        <Text style={styles.userName}>{info.Username}</Text>
                        <Text style={styles.userID}>ID: {info.UserID}</Text>
                    </View>
                </View>
                <View style={styles.userInfoContainer}>
                    <Text style={styles.userInfoText}>Email: {info.Email}</Text>
                    <Text style={styles.userInfoText}>Phone: {info.PhoneNumber}</Text>
                    <Text style={styles.userInfoText}>Intro: {info.Introduction}</Text>
                </View>
            </View>
            <Button title='Chat' onPress={() => console.log("??????????")} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1faee',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        marginTop: 5,
    },
    buttonSpacer: {
        height: 10,
    },
    profileContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 20,
        marginTop: 20
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginRight: 15,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#a8dadc',
    },
    userDetailsContainer: {
        paddingLeft: 10,
        flex: 1,
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1d3557',
    },
    userID: {
        fontSize: 14,
        color: '#a8dadc',
    },
    userInfoContainer: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    userInfoText: {
        fontSize: 16,
        color: '#1d3557',
        marginBottom: 8,
    },
    noImageText: {
        fontSize: 16,
        color: '#a8dadc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#888',
    },
});
