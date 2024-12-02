import { registerIndieID, unregisterIndieDevice } from 'native-notify';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'
import { v7 } from 'uuid';
import { SERVER_IP } from '../../../backend/constant';

export default function NotificationButton() {
    const [userId, setUserId] = useState(undefined);
    const [deviceId, setDeviceId] = useState(undefined);

    const fetchUserId = async () => {
        const uid = await AsyncStorage.getItem('userID');
        if (uid !== undefined) {
            setUserId(uid);
        }
    }

    const fetchDeviceId = async () => {
        const deviceId = await AsyncStorage.getItem('deviceID');
        if (deviceId !== null) {
            setDeviceId(deviceId);
        }
        else {
            setDeviceId(v7());
        }
        console.log(deviceId);
    }

    useEffect(() => {
        fetchUserId();
        fetchDeviceId();
    }, [])

    const Enable = async () => {
        try {
            console.log(deviceId);
            console.log(userId);
            //insert deviceid and userid to notification
            const response = await fetch(`http://${SERVER_IP}:2812/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: deviceId, userId }),
            });
            if (response.status === 201) {
                console.log("??", deviceId)
                registerIndieID(deviceId, 25041, 'mF80USeXXVwmFYiJzGyVco');
            }
            const result = await response.json();
            Alert.alert("", result.message);
        } catch (error) {
            console.error(error);
        }
    }
    const Disable = async () => {
        try {
            console.log(deviceId);
            console.log(userId);
            //Delete deviceid and userid from notification
            const response = await fetch(`http://${SERVER_IP}:2812/`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: deviceId, userId }),
            });
            if (response.status !== 204) {
                const result = await response.json();
                Alert.alert("", result.message);
            }
            else {
                Alert.alert("", "Notification disabled");
                console.log("???", deviceId)
                unregisterIndieDevice(deviceId, 25041, 'mF80USeXXVwmFYiJzGyVco');
            }
        } catch (error) {
            console.error(error);
        }
    }


    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity style={styles.button} onPress={() => Enable()}>
                    <FontAwesome name="bell-o" size={24} color="white" />
                    <Text style={styles.buttonText}>Enable Fridge Notification</Text>
                </TouchableOpacity>
            </View>
            <View style={{ padding: 5 }}></View>
            <View style={[styles.container, { backgroundColor: 'steelblue' }]}>
                <TouchableOpacity style={[styles.button, { backgroundColor: 'steelblue' }]} onPress={() => Disable()}>
                    <FontAwesome name="bell-o" size={24} color="white" />
                    <Text style={styles.buttonText}>Disable Fridge Notification</Text>

                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'cornflowerblue',
        flexDirection: 'column'
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'cornflowerblue',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 10,
    },
});
