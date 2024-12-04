import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Import hook
import AsyncStorage from '@react-native-async-storage/async-storage'; // Đảm bảo đã cài thư viện này
import { Calendar } from 'react-native-calendars';
import DailyList from './DailyList';
import AddPlan from './AddPlan';

const { SERVER_IP, PORT } = require("../../../backend/constant");


export default function Home({ route }) {
    const [userId, setUserId] = useState(null);
    const [plans, setPlans] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth().toString().padStart(2, '0'));
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [selectedDate, setSelectedDate] = useState(null);

    const BASE_URL = `http://${SERVER_IP}:${PORT}`;

    const fetchUserId = async () => {
        try {
            const storedUserId = await AsyncStorage.getItem('userID');
            if (storedUserId) {
                setUserId(storedUserId);
            } else {
                console.error("No userID found in AsyncStorage.");
            }
        } catch (error) {
            console.error("Error fetching userID:", error);
        }
    };

    const fetchPlans = () => {
        if (!userId) {
            console.error("User ID is missing");
            return;
        }

        fetch(`${BASE_URL}/daily-list/month?userId=${userId}&month=${month}&year=${year}`)
            .then((response) => response.json())
            .then((data) => setPlans(data))
            .catch((error) => console.error("Error fetching plans:", error));
    };


    useFocusEffect(
        React.useCallback(() => {
            fetchUserId();
            fetchPlans();
        }, [month, year, selectedDate])
    );

    const markedDates = plans.reduce((acc, plan) => {
        acc[plan.dateToBuy] = { selectedColor: 'turquoise', selected: true, marked: true };
        return acc;
    }, {});

    if (selectedDate) {
        markedDates[selectedDate] = {
            selected: true,
            selectedColor: 'green',
            selectedTextColor: 'white',
        };
    }

    const handleMonthChange = (date) => {
        const selectedMonth = date.month < 10 ? `0${date.month}` : `${date.month}`;
        const selectedYear = `${date.year}`;
        setMonth(selectedMonth);
        setYear(selectedYear);
    };

    const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
    };

    const displayPlans = () => {
        if (selectedDate) {
            const dailyPlans = plans.filter((plan) => plan.dateToBuy === selectedDate);

            return (
                <View style={styles.selectedDateContainer}>
                    <Text style={styles.selectedDateText}>Selected Date: {selectedDate}</Text>
                    {dailyPlans.length > 0 ? (
                        <DailyList dateToBuy={selectedDate} listItem={dailyPlans[0].listItem} />
                    ) : (
                        <AddPlan selectedDate={selectedDate} fetchPlans={fetchPlans} uId={userId} />
                    )}
                </View>
            );
        } else if (plans.length > 0) {
            return (
                <View style={styles.listContainer}>
                    {plans.map((plan, index) => (
                        <DailyList key={index} dateToBuy={plan.dateToBuy} listItem={plan.listItem} />
                    ))}
                </View>
            );
        } else {
            return (
                <View style={styles.noPlansContainer}>
                    <Text style={styles.noPlansText}>No plans available for this month.</Text>
                </View>
            );
        }
    };




    return (
        <ScrollView style={styles.container}>
            <View style={styles.calendarContainer}>
                <Calendar
                    enableSwipeMonths={true}
                    onDayPress={handleDayPress}
                    onMonthChange={handleMonthChange}
                    markedDates={markedDates}
                    theme={{
                        arrowColor: '#4a90e2',
                        todayTextColor: '#4a90e2',
                        selectedDayBackgroundColor: '#4a90e2',
                        dotColor: 'blue',
                        textDayFontWeight: 'bold',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: 'bold',
                    }}
                />
            </View>
            {displayPlans()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f4f7',
    },
    calendarContainer: {
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    selectedDateContainer: {
        padding: 10,
        backgroundColor: 'white',
        marginTop: 20,
        marginHorizontal: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedDateText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContainer: {
        marginTop: 10,
    },
    noPlansContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noPlansText: {
        fontSize: 16,
        color: '#777',
    },
});
