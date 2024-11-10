import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { TouchableOpacity, Text, View, StyleSheet, TextInput, Alert, Dimensions } from "react-native";
import { PORT, SERVER_IP } from "../../../backend/constant";

const screenWidth = Dimensions.get('window').width;

export default function AddFridgeItem({ userId, itemId }) {
    const [expireDate, setExpireDate] = useState(new Date());
    const [amount, setAmount] = useState("");
    const [show, setShow] = useState(false);

    const handleSubmit = async () => {
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/fridge/item`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    itemId,
                    amount,
                    expireDate: expireDate.toISOString().split('T')[0]
                }),
            });
            const result = await response.json();
            if (result.status == 200) {
                Alert.alert("Success", "Item added to fridge!");
                setAmount("");
            }
            else {
                Alert.alert("Fail", result.message);
            }
            console.log(result);
        } catch (error) {
            Alert.alert("Error", "Failed to add item to fridge.");
            console.error(error);
        }
    };

    const openDatePicker = () => {
        DateTimePickerAndroid.open({
            mode: "date",
            value: expireDate,
            onChange: (event, newDate) => {
                if (newDate) setExpireDate(newDate);
            },
        });
    };

    const handleToggle = () => {
        setShow(!show);
    }

    return (
        <TouchableOpacity style={styles.container} onPress={handleToggle}>
            <Text style={styles.title}>Add Item to Fridge</Text>
            {
                show
                    ? <>
                        <TextInput
                            placeholder="Amount"
                            value={amount}
                            onChangeText={setAmount}
                            style={styles.input}
                            autoCapitalize="none"
                        />

                        <TouchableOpacity onPress={openDatePicker} style={styles.dateButton}>
                            <Text style={styles.buttonText}>
                                Set Expire Date: {expireDate.toDateString()}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                            <Text style={styles.buttonText}>Add to Fridge</Text>
                        </TouchableOpacity>
                    </>
                    : null
            }
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: screenWidth - 40,
        margin: 20,
        padding: 20,
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