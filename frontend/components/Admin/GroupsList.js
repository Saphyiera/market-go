import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { PORT, SERVER_IP } from '../../../backend/constant';

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const limit = 10;

    const fetchGroups = async (currentPage) => {
        setLoading(true);
        try {
            const response = await fetch(`http://${SERVER_IP}:${PORT}/admin/group/all?page=${currentPage}&limit=${limit}`);
            const data = await response.json();

            if (data.status === 200) {
                setGroups((prevGroups) => [...prevGroups, ...data.data]);
                setTotal(data.total);
            } else {
                console.warn(data.message);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (groups.length < total) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    useEffect(() => {
        fetchGroups(page);
    }, [page]);

    const renderItem = ({ item }) => (
        <View style={styles.groupContainer}>
            <Image
                source={{ uri: item.GroupImg }}
                style={styles.groupImage}
            />
            <View style={styles.textContainer}>
                <Text style={styles.groupName}>{item.GroupName}</Text>
                <Text style={styles.adminName}>Owner: {item.Username}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading && page === 1 ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={groups}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.GroupID.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loading ? <ActivityIndicator size="small" color="#0000ff" /> : null
                    }
                />
            )}
        </View>
    );
};

export default GroupList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    groupContainer: {
        flexDirection: 'row',
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
    },
    groupImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    groupName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    adminName: {
        fontSize: 14,
        color: '#777',
    },
});