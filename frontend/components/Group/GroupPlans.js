import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SERVER_IP, PORT } from '../../../backend/constant';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function GroupPlans({ route }) {
    const { groupId } = route.params;
    const [plans, setPlans] = useState([]);
    const [markedDates, setMarkedDates] = useState({});
    const [loading, setLoading] = useState(false);
    const today = new Date();
    const navigation = useNavigation();

    const [currentMonth, setCurrentMonth] = useState({
        month: today.getMonth() + 1,
        year: today.getFullYear(),
    });

    function convertDate(inputDate) {
        const [day, month, year] = inputDate.split('/');
        return `${year}-${month}-${day}`;
    }

    const fetchGroupPlans = async (month, year) => {
        setLoading(true);
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/group/plans?groupId=${groupId}&month=${month}&year=${year}`);
            const json = await response.json();
            if (json.status === 200) {
                setPlans(json.data);
                markDates(json.data);
            } else {
                console.warn(json.message);
            }
        } catch (error) {
            console.error("Error fetching group plans:", error);
        } finally {
            setLoading(false);
        }
    };

    const markDates = (data) => {
        const dates = {};
        data.forEach(plan => {
            const dtb = convertDate(new Date(plan.DateToBuy).toLocaleDateString());
            dates[dtb] = { selected: 'true', selectedColor: 'turquoise' };
        });
        console.log(dates);
        setMarkedDates(dates);
    };

    useEffect(() => {
        fetchGroupPlans(currentMonth.month, currentMonth.year);
    }, [currentMonth]);

    return (
        <View style={styles.container}>
            <Calendar
                markedDates={markedDates}
                onMonthChange={(date) => {
                    setCurrentMonth({
                        month: date.month,
                        year: date.year,
                    });
                }}
                theme={{
                    selectedDayBackgroundColor: '#00adf5',
                    todayTextColor: '#00adf5',
                    dotColor: '#00adf5',
                    arrowColor: 'blue',
                }}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
            ) : (
                <>
                    <Text style={styles.planHeader}>Plans:</Text>
                    <FlatList
                        data={plans}
                        keyExtractor={(item) => item.ListID.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.planItem}
                                onPress={() => navigation.navigate('Plan', { listId: item.ListID })}>
                                <Text style={styles.dateText}>Date: {convertDate(new Date(item.DateToBuy).toLocaleDateString())}</Text>
                                <Text style={styles.buyersHeader}>Buyers:</Text>
                                {item.Buyers.map((buyer) => (
                                    <Text key={buyer.BuyerID} style={styles.buyerText}>
                                        - {buyer.Username} (ID: {buyer.BuyerID})
                                    </Text>
                                ))}
                            </TouchableOpacity>
                        )}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f4f4f8',
    },
    loading: {
        marginVertical: 20,
    },
    planHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 10,
    },
    planItem: {
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
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    buyersHeader: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 5,
    },
    buyerText: {
        fontSize: 14,
        color: '#555',
    },
});