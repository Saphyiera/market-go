import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, Alert, Dimensions } from "react-native";
import { PORT, SERVER_IP } from "../../../backend/constant";

const screenWidth = Dimensions.get('window').width;

export default function AddDish({ userId, recipeId }) {
    const [dateToDo, setDateToDo] = useState(new Date());
    const [show, setShow] = useState(false);

    const handleSubmit = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/dish-plan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    recipeId,
                    dateToDo: dateToDo.toISOString().split('T')[0]
                }),
            });
            const result = await response.json();
            if (result.status == 200) {
                console.log(result.data);
                if (result.data == 0) {
                    Alert.alert("", "Maybe you already have that recipe on that day!")
                } else {
                    Alert.alert("Success", "Recipe added to your dish plan!");
                }
            }
            else {
                Alert.alert("Fail", result.message);
            }
            console.log(result);
        } catch (error) {
            Alert.alert("Error", "Failed to add recipe to plan.");
            console.error(error);
        }
    };

    const openDatePicker = () => {
        DateTimePickerAndroid.open({
            mode: "date",
            value: dateToDo,
            onChange: (event, newDate) => {
                if (newDate) setDateToDo(newDate);
            },
        });
    };

    const handleToggle = () => {
        setShow(!show);
    }

    return (
        <TouchableOpacity style={styles.container} onPress={handleToggle}>
            <Text style={styles.title}>Add Recipe To Dish Plan</Text>
            {
                show
                    ? <>
                        <TouchableOpacity onPress={openDatePicker} style={styles.dateButton}>
                            <Text style={styles.buttonText}>
                                Date To Do: {dateToDo.toDateString()}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                            <Text style={styles.buttonText}>Add Plan</Text>
                        </TouchableOpacity>
                    </>
                    : null
            }
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: screenWidth - 30,
        padding: 8,
        paddingTop: 16,
        backgroundColor: "#fff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 15,
    },
    dateButton: {
        backgroundColor: "blue",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 15,
    },
    submitButton: {
        backgroundColor: "#4CAF50",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});