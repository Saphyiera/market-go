import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, Image, TouchableOpacity, Button } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { SERVER_IP, PORT } = require('../../../backend/constant');

export default function Dish() {
    const navigation = useNavigation();
    const [userId, setUserId] = useState(null);
    const currentDate = new Date().toISOString().split('T')[0];
    const isFocused = useIsFocused();

    const [markedDates, setMarkedDates] = useState({});
    const [selectedMonth, setSelectedMonth] = useState(currentDate.slice(0, 7));
    const [noPlans, setNoPlans] = useState(false);
    const [dayPlans, setDayPlans] = useState([]);
    const [selectedDate, setSelectedDate] = useState(currentDate);

    useEffect(() => {
        if (isFocused) {
            console.log(userId + "??")
            fetchUserId();
            fetchDishPlanData(selectedMonth);
        }
    }, [selectedMonth, isFocused]);

    const fetchUserId = async () => {
        try {
            const storedUserId = await AsyncStorage.getItem('userID');
            if (storedUserId) {
                setUserId(storedUserId); // Set userId state if found
            }
        } catch (error) {
            console.error('Error fetching userId from AsyncStorage:', error);
        }
    };

    const fetchDishPlanData = async (month) => {
        const [year, monthNumber] = month.split('-');

        try {
            const response = await fetch(`http://${SERVER_IP}:2811/dish-plan?userId=${userId}&month=${monthNumber}&year=${year}`);
            const data = await response.json();

            if (data.status === 200 && data.data.length > 0) {
                const datesToMark = {};

                data.data.forEach(item => {
                    const date = item.DateToDo;
                    datesToMark[date] = { selected: true, selectedColor: '#3D82C6', selectedTextColor: 'white' };
                });

                datesToMark[currentDate] = {
                    selected: true,
                    selectedColor: '#34A853',
                    selectedTextColor: 'white',
                };
                setMarkedDates(datesToMark);
                setNoPlans(false);
            } else {
                setMarkedDates({});
                setNoPlans(true);
            }
        } catch (error) {
            console.error('Error fetching dish plan data:', error);
            Alert.alert('Error', 'Failed to fetch dish plan data');
        }
    };

    const fetchDayPlan = async (date) => {
        try {
            const response = await fetch(`http://${SERVER_IP}:2811/dish-plan/date?userId=${userId}&dateToDo=${date}`);
            const data = await response.json();

            if (data.status === 200 && data.data.length > 0) {
                setDayPlans(data.data);
            } else {
                setDayPlans([]);
            }
        } catch (error) {
            console.error('Error fetching day plan:', error);
            Alert.alert('Error', 'Failed to fetch plans for this day');
        }
    };

    const onDayPress = (day) => {
        const selectedDate = day.dateString;
        setSelectedDate(selectedDate);
        fetchDayPlan(selectedDate);
    };

    const handleRemove = (recipeId) => {
        console.log(recipeId)
        Alert.alert("Confirm remove", "You want to remove this recipe?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        console.log(selectedDate, userId, recipeId);
                        removeDish(recipeId);
                    }
                }, {
                    text: "No",
                    onPress: console.log("?")
                }])
    }

    const removeDish = async (recipeId) => {
        const response = await fetch(`http://${SERVER_IP}:${PORT}/dish-plan/recipe`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId, recipeId, dateToDo: selectedDate
            })
        })
        const result = await response.json();
        if (result.status === 200) {
            setDayPlans(dayPlans.filter(i => i.RecipeID !== recipeId))
            Alert.alert("Success", "Recipe remove successfully")
        }
        else {
            Alert.alert("Fail", result.message)
        }
    }

    if (userId === null) {
        return <Text>Login to see your dish plan!</Text>
    }

    return (
        <View style={styles.container}>
            <Calendar
                current={currentDate}
                markedDates={markedDates}
                onMonthChange={(month) => setSelectedMonth(month.dateString.slice(0, 7))}
                markingType={'simple'}
                onDayPress={onDayPress}
                theme={{
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: '#3D82C6',
                    todayTextColor: '#34A853',
                    dayTextColor: '#2d4150',
                    arrowColor: '#3D82C6',
                }}
            />
            {noPlans && <Text style={styles.noPlansText}>No plans for this month</Text>}
            {dayPlans.length > 0 ? (
                <View style={styles.planList}>
                    <Text style={styles.dayPlanHeader}>Plans for {selectedDate}:</Text>
                    <FlatList
                        data={dayPlans}
                        keyExtractor={(item) => item.RecipeID.toString()}
                        renderItem={({ item }) => (<>
                            <TouchableOpacity
                                key={item.RecipeID}
                                style={styles.recipeContainer}
                                onPress={() => {
                                    navigation.navigate('Dish Recipe', { recipeId: item.RecipeID })
                                }}>
                                <View style={styles.recipe}>

                                    {item.RecipeImg
                                        ? <Image source={{ uri: `data:image/png;base64,${item.RecipeImg}` }} style={styles.recipeImage} />
                                        : <Text style={styles.noRecipeImg}>No image</Text>}
                                    <Text style={styles.planText}>{item.RecipeName}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRemove(item.RecipeID)} style={styles.removeButton}>
                                    <Text style={styles.removeButtonText}>Remove</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </>
                        )}
                    />
                </View>
            ) : (
                <Text style={styles.noPlansText}>No dish planned for {selectedDate}.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F4F6F9',
    },
    recipeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    noPlansText: {
        fontSize: 16,
        color: 'gray',
        marginTop: 20,
        textAlign: 'center',
    },
    planList: {
        marginTop: 20,
    },
    dayPlanHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3D82C6',
        marginBottom: 10,
        textAlign: 'center',
    },
    recipe: {
        flexDirection: 'row',
        alignItems: 'center',

    },
    planText: {
        fontSize: 16,
        color: '#2d4150',
        marginLeft: 10,
    },
    recipeImage: {
        width: 50,
        height: 50,
        borderRadius: 5,
        backgroundColor: '#E8E8E8',
        marginRight: 12
    },
    noRecipeImg: {
        fontSize: 12,
        color: '#888',
        width: 60,
        height: 50,
        marginRight: 2,
        paddingTop: 15
    },
    removeButtonText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '500'
    },
    removeButton: {
        backgroundColor: 'cornflowerblue',
        width: 60,
        height: 20,
        borderRadius: 5,
        alignItems: 'center'
    }
});