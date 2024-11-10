import { Text, Image, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddFridgeItem from './AddFridgeItem';

const { SERVER_IP } = require('../../../backend/constant');

export default function Item({ route }) {
    const { itemId } = route.params;
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(-1);

    useEffect(() => { fetchItem() }, []);

    const fetchItem = async () => {
        const uid = await AsyncStorage.getItem('userID');
        if (uid) {
            setUserId(uid);
        }
        try {
            const response = await fetch(`http://${SERVER_IP}:2811/item?id=${itemId}`);
            const result = await response.json();
            if (result.status === 200) {
                setItem(result.data[0]);
            }
            else {
                console.log(result.message);
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#00bfff" style={styles.loader} />;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {item.ItemImg ? (
                <Image
                    source={{ uri: `data:image/png;base64,${item.ItemImg}` }}
                    style={styles.image}
                />
            ) : (
                <Text style={styles.noImageText}>No image available</Text>
            )}
            {
                userId != -1
                    ? <AddFridgeItem userId={userId} itemId={itemId} />
                    : null
            }
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.ItemName}</Text>
                <Text style={styles.description}>{item.ItemDescription}</Text>
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    image: {
        width: '100%',
        height: 320,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    textContainer: {
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    noImageText: {
        fontSize: 18,
        color: '#888',
        marginBottom: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
