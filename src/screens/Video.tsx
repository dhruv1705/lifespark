import React from 'react';
import { StyleSheet, View, Text, FlatList, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Card } from "@ui-kitten/components";
import { Video, ResizeMode } from 'expo-av';

const VideoScreen = () => {
    const data = [
        {
            id: 1,
            name_1: "Morning Workout Routine",
            name: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            time: "10:30",
            description: "Start your day with this energizing workout routine"
        },
        {
            id: 2,
            name_1: "Yoga for Beginners",
            name: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            time: "15:45",
        },
        {
            id: 3,
            name_1: "HIIT Training",
            name: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            time: "20:15",
        },
        {
            id: 4,
            name_1: "Meditation Guide",
            name: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            time: "12:00",
        },
        {
            id: 5,
            name_1: "Strength Training",
            name: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            time: "25:30",
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <FlatList 
                data={data} 
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item}) => {
                return(  
                    <ScrollView>
                    <Card 
                        style={styles.card}
                        header={() => (
                            <View style={styles.header}>
                                <Text style={styles.title}>{item.name_1}</Text>
                            </View>
                        )}
                        footer={() => (
                            <View style={styles.footer}>
                                <Text style={styles.timeText}>Duration: {item.time} min</Text>
                            </View>
                        )}
                    >
                        <Video
                          source={{ uri: item.name }}
                          style={{ width: '100%', height: 200 }}
                          useNativeControls
                          resizeMode={ResizeMode.CONTAIN}
                        />
                    </Card>
                    </ScrollView>
                );
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    card: {
        margin: 10,
        borderRadius: 8,
    },
    header: {
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    footer: {
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    timeText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    description: {
        fontSize: 14,
        color: '#333',
    },
    videoContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        margin: 10,
    },
    videoPlaceholder: {
        fontSize: 16,
        color: '#007bff',
        textAlign: 'center',
        marginBottom: 10,
    },
    videoNote: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    playButton: {
        backgroundColor: '#00C896',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    playIcon: {
        fontSize: 22,
        color: '#fff',
    },
    watchButton: {
        backgroundColor: '#00C896',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    watchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default VideoScreen;