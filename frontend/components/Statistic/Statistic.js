import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, Button, Dimensions, ScrollView, View, StyleSheet } from "react-native";
import { PORT, SERVER_IP } from "../../../backend/constant";
import { useIsFocused } from "@react-navigation/native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

export default function Statistic() {
    const [data, setData] = useState(null); // Use `null` to indicate no data
    const [userId, setUserId] = useState(null);
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1))); // Current date - 1 month
    const [endDate, setEndDate] = useState(new Date()); // Current date
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();

    const fetchUserId = async () => {
        const uid = await AsyncStorage.getItem('userID');
        if (uid) {
            setUserId(uid);
        } else {
            Alert.alert("Error", "User ID not found.");
        }
    };

    const fetchData = async () => {
        if (userId && startDate && endDate) {
            setLoading(true);
            console.log("Fetching data for:", userId, startDate, endDate);
            try {
                const response = await fetch(`http://${SERVER_IP}:${PORT}/statistic?userId=${userId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
                const result = await response.json();
                if (result.status === 200) {
                    setData(transformData(adjustDates(result.data)));
                } else {
                    Alert.alert("Error", "Error fetching data");
                }
            } catch (error) {
                Alert.alert("Error", "Network error. Please try again later.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert("Error", "Please select a valid date range.");
        }
    };

    const handleSetDate = (setDate, date) => {
        DateTimePickerAndroid.open({
            mode: "date",
            value: date,
            onChange: (event, newDate) => {
                if (newDate) {
                    setDate(newDate);
                    setData(null);
                }
            },
        });
    };

    function adjustDates(data) {
        return data.map(item => {
            const adjustedDate = new Date(item.DateToBuy);
            adjustedDate.setDate(adjustedDate.getDate() + 1);
            return {
                ...item,
                DateToBuy: adjustedDate.toISOString(),
            };
        });
    }

    function transformData(data) {
        const result = { Date: {}, Items: {} };

        data.forEach(item => {
            const dateKey = new Date(item.DateToBuy).toISOString().split('T')[0];
            if (!result["Date"][dateKey]) {
                result["Date"][dateKey] = { Cost: 0, Count: 0 };
            }
            result["Date"][dateKey].Cost = item.Cost || 0;
            result["Date"][dateKey].Count += 1;

            const itemKey = item.ItemName;
            if (!result['Items'][itemKey]) {
                result["Items"][itemKey] = 0;
            }
            result["Items"][itemKey] += 1;
        });

        const graph1 = [[], [], []];
        for (const date in result["Date"]) {
            graph1[0].push(date);
            graph1[1].push(result["Date"][date].Cost);
            graph1[2].push(result["Date"][date].Count);
        }

        const graph2 = [[], []];
        for (const i in result["Items"]) {
            graph2[0].push(i);
            graph2[1].push(result["Items"][i]);
        }

        return { g1: graph1, g2: graph2 };
    }

    useEffect(() => {
        fetchUserId();
    }, []);

    useEffect(() => {
        if (isFocused && userId && !loading) {
            fetchData();
        }
    }, [isFocused, userId]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={{ alignSelf: 'center', fontSize: 18, marginBottom: 10 }}>Pick a period to get statistic</Text>
            <View style={styles.dateSelector}>
                <TouchableOpacity onPress={() => handleSetDate(setStartDate, startDate)}>
                    <Text style={styles.dateText}>Start Date: {startDate.toDateString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSetDate(setEndDate, endDate)}>
                    <Text style={styles.dateText}>End Date: {endDate.toDateString()}</Text>
                </TouchableOpacity>
            </View>

            <Button title="Get Stats" onPress={fetchData} disabled={loading || !userId} />

            {loading && <Text style={styles.loadingText}>Loading...</Text>}

            {data ? (
                <>
                    <Text style={styles.chartTitle}>Cost</Text>
                    <ScrollView horizontal style={styles.chartContainer}>
                        <LineChart
                            data={{
                                labels: data['g1'][0],
                                datasets: [{
                                    data: data['g1'][1],
                                    color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
                                    strokeWidth: 3,
                                }]
                            }}
                            width={100 * data['g1'][0].length}
                            height={300}
                            yAxisSuffix="$"
                            chartConfig={{
                                backgroundColor: '#f0f0f0',
                                backgroundGradientFrom: '#fff',
                                backgroundGradientTo: '#f0f0f0',
                                decimalPlaces: 2,
                                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            style={styles.chartStyle}
                            onDataPointClick={({ index, value, dataset, meta }) => {
                                Alert.alert(
                                    "Info",
                                    `Date: ${data['g1'][0][index]}\nCost: $${value}\nItems: ${data['g1'][2][index]}`
                                );
                            }}
                        />
                    </ScrollView>

                    <Text style={styles.chartTitle}>Items Per List</Text>
                    <ScrollView horizontal style={styles.chartContainer}>
                        <LineChart
                            data={{
                                labels: data['g1'][0],
                                datasets: [{
                                    data: data['g1'][2],
                                    color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                                    strokeWidth: 3,
                                }]
                            }}
                            width={100 * data['g1'][0].length}
                            height={300}
                            chartConfig={styles.chartConfig}
                            style={styles.chartStyle}
                            onDataPointClick={({ index, value, dataset, meta }) => {
                                Alert.alert(
                                    "Info",
                                    `Date: ${data['g1'][0][index]}\nItems: ${data['g1'][2][index]}`
                                );
                            }}
                        />
                    </ScrollView>

                    <Text style={styles.chartTitle}>Item Quantities</Text>
                    <ScrollView horizontal style={styles.chartContainer}>
                        <BarChart
                            data={{
                                labels: data['g2'][0],
                                datasets: [{
                                    data: data['g2'][1],
                                    color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                                }]
                            }}
                            width={100 * data['g2'][0].length}
                            height={300}
                            chartConfig={styles.chartConfig}
                            style={styles.chartStyle}
                            showValuesOnTopOfBars={true}
                        />
                    </ScrollView>
                </>
            ) : (
                !loading && <Text style={styles.noDataText}>No data available. Please select a date range and try again.</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    dateSelector: {
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    dateText: {
        fontSize: 16,
        color: '#007BFF',
        marginBottom: 10,
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#007BFF',
    },
    chartTitle: {
        fontSize: 20,
        textAlign: 'center',
        marginVertical: 10,
        fontWeight: 'bold',
    },
    chartContainer: {
        marginVertical: 15,
    },
    chartConfig: {
        backgroundColor: '#f0f0f0',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#f0f0f0',
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    },
    chartStyle: {
        marginVertical: 10,
        borderRadius: 16,
    },
    noDataText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
    },
});
