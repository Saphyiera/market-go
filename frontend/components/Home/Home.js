import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import DailyList from './DailyList';

export default function Home() {
    const plans = [
        {
            dateToBuy: '2024-11-28',
            listItem: [
                { itemName: 'Apple', amount: 'A bunch' },
                { itemName: 'Banana', amount: 'A lot' },
                { itemName: 'Orange', amount: 'A handful' },
            ]
        },
        {
            dateToBuy: '2024-11-15',
            listItem: [
                { itemName: 'Milk', amount: '2 Liters' },
                { itemName: 'Eggs', amount: 'A dozen' },
            ]
        },
        {
            dateToBuy: '2024-11-04',
            listItem: [
                { itemName: 'Bread', amount: 'A loaf' },
                { itemName: 'Butter', amount: '200g' },
            ]
        }
    ];

    const markedDates = plans.reduce((acc, plan) => {
        acc[plan.dateToBuy] = { selectedColor: 'turquoise', selected: 'true', marked: 'true' };
        return acc;
    }, {});

    const today = new Date().toISOString().split('T')[0];
    markedDates[today] = {
        selected: true,
        selectedColor: 'blue',
        selectedTextColor: 'white',
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.calendarContainer}>
                <Calendar
                    enableSwipeMonths={true}
                    onDayPress={(day) => console.log(day)}
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
            <View style={styles.listContainer}>
                {plans.map((plan, index) => (
                    <DailyList key={index} dateToBuy={plan.dateToBuy} listItem={plan.listItem} />
                ))}
            </View>
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
    listContainer: {
        marginTop: 10,
        marginHorizontal: 10,
    },
});
