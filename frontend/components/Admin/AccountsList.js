import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import { PORT, SERVER_IP } from '../../../backend/constant';

export default function AccountsList() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [emailContent, setEmailContent] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, [page]);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/admin/user/all?page=${page}&pageSize=${pageSize}`);
            const data = await response.json();

            if (data.status === 200) {
                setAccounts(data.data);
                setTotalPages(data.pagination.totalPages);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMail = (userId, email) => {
        setEmailModalVisible(true);
        setCurrentEmail(email);
        setCurrentUserId(userId);
    };

    const handleSendMailConfirm = async () => {
        try {
            const emailData = {
                Email: currentEmail,
                Content: emailContent,
            };

            console.log(`Sending email to ${currentEmail} for User ID: ${currentUserId}`);
            console.log(`Email Content: ${emailContent}`);

            const response = await fetch(`http://${SERVER_IP}:${PORT}/admin/user/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Email sent successfully:', result);
                Alert.alert('Email sent successfully');
            } else {
                const errorResult = await response.json();
                console.error('Failed to send email:', errorResult);
                Alert.alert('Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            Alert.alert('Error sending email');
        } finally {
            setEmailModalVisible(false);
            setEmailContent('');
        }
    };

    const handleSendMailCancel = () => {
        setEmailModalVisible(false);
        setEmailContent('');
    };

    const handleDeleteAccount = (userId) => {
        Alert.alert(
            'Delete Account',
            `Are you sure you want to delete account ID: ${userId}? All infomation about this account, including: recipes created, group lists, ... will be removed!`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => deleteAccount(userId) },
            ]
        );
    };

    const deleteAccount = async (userId) => {
        Alert.alert('Success', `Account ID: ${userId} deleted.`);
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>

            {item.Avatar ? (
                <Image
                    source={{ uri: `data:image/png;base64,${item.Avatar}` }}
                    style={styles.avatar}
                />
            ) : (
                <Text style={styles.noImageText}>No Image</Text>
            )}
            <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.Username}</Text>
                <Text style={styles.userID}>ID: {item.UserID}</Text>
                <Text style={styles.userInfoText}>Email: {item.Email}</Text>
                <Text style={styles.userInfoText}>Phone: {item.PhoneNumber}</Text>
                <Text style={styles.userInfoText}>Intro: {item.Introduction || 'No introduction available'}</Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.sendMailButton}
                        onPress={() => handleSendMail(item.UserID, item.Email)}
                    >
                        <Text style={styles.buttonText}>Send Mail</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteAccount(item.UserID)}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#6200ea" style={styles.loader} />
            ) : (
                <>
                    <FlatList
                        data={accounts}
                        keyExtractor={(item) => item.UserID.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                    />
                    <View style={styles.pagination}>
                        <TouchableOpacity
                            style={[styles.pageButton, page === 1 && styles.disabledButton]}
                            onPress={handlePreviousPage}
                            disabled={page === 1}
                        >
                            <Text style={styles.pageButtonText}>Previous</Text>
                        </TouchableOpacity>
                        <Text style={styles.pageInfo}>
                            Page {page} of {totalPages}
                        </Text>
                        <TouchableOpacity
                            style={[styles.pageButton, page === totalPages && styles.disabledButton]}
                            onPress={handleNextPage}
                            disabled={page === totalPages}
                        >
                            <Text style={styles.pageButtonText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={emailModalVisible}
                onRequestClose={handleSendMailCancel}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Send Mail</Text>
                        <Text style={styles.modalSubtitle}>To: {currentEmail}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your message here"
                            multiline
                            value={emailContent}
                            onChangeText={setEmailContent}
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={handleSendMailCancel} color="#f44336" />
                            <Button title="Send" onPress={handleSendMailConfirm} color="#4caf50" />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f4f4f4',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#333',
    },
    loader: {
        marginTop: 20,
    },
    list: {
        paddingBottom: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
        backgroundColor: '#ccc',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#444',
    },
    userID: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    userInfoText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    pageInfo: {
        fontSize: 16,
        color: '#444',
    },
    pageButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#6200ea',
        borderRadius: 8,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    pageButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    noImageText: {
        fontSize: 12,
        color: 'gray',
        alignSelf: 'center',
        fontStyle: 'italic',
        marginRight: 10
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 8,
    },
    sendMailButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: '#f44336',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        marginBottom: 16,
        color: '#555',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});