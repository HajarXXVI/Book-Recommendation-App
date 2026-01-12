import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { useAuthStore } from '../../store/authStore.js';
import { useState, useEffect } from 'react';
import { API_URL } from '../../constants/config.js';
import styles from '../../assets/styles/home.styles.js';
import { Image } from 'expo-image'; //we are using expo-image instead of react-native Image to support remote images, remote images are the ones that are not stored locally on the device


export default function Home() {

  const { token } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      const response = await fetch(`${API_URL}/api/books?page=${pageNum}&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch books");

      setBooks((prevBooks) => [...prevBooks, ...data.books]);
      setHasMore(pageNum < data.totalPages);

      setPage(pageNum);

    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      if (refresh) {
        setRefreshing(false);
      } else setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleLoadMore = () => {
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>

      <View style={styles.bookImageContainer}>
        <Image source={item.image} style={styles.bookImage} contentFit="cover" />
      </View>

      {/* <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
      </View> */}
    </View>

  );

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showVerticalScrollIndicator={false}
      />


    </View>
  )
}