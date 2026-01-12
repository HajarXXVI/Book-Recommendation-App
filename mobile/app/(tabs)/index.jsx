import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import React from 'react'
import { useAuthStore } from '../../store/authStore.js';
import { useState, useEffect } from 'react';
import { API_URL } from '../../constants/config.js';
import styles from '../../assets/styles/home.styles.js';
import { Image } from 'expo-image'; //we are using expo-image instead of react-native Image to support remote images, remote images are the ones that are not stored locally on the device
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors.js';
import { formatPublishDate } from '../../lib/utils.js';
import Loader from "../../components/loader";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

      const response = await fetch(`${API_URL}/api/books?page=${pageNum}&limit=2`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch books");

      // setBooks((prevBooks) => [...prevBooks, ...data.books]);

      //we are using this to remove duplicates from the books array when we scroll down to load more books
      const uniqueBooks =
        refresh || pageNum === 1
          ? data.books
          : Array.from(new Set([...books, ...data.books].map((book) => book._id))).map((id) =>
            [...books, ...data.books].find((book) => book._id === id)
          );
      setBooks(uniqueBooks);

      setHasMore(pageNum < data.totalPages);

      setPage(pageNum);

    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      if (refresh) {
        //to show a loading indicator while refreshing
        await sleep(800);
        setRefreshing(false);
      } else setLoading(false);
    }
  };

  //to fetch books when the component mounts when the user refreshes the page
  useEffect(() => {
    fetchBooks();
  }, []);

  //to handle loading more books when the user reaches the end of the list
  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) await fetchBooks(page + 1);
  };

  //to render each book item in the list
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

      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
      </View>
    </View>

  );

  //to render rating stars
  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  //if loading is true, show the loader component
  if (loading) return <Loader size="large" />;

  return (
    <View style={styles.container}>
      <FlatList
        //flatlist only renders the books that are visible on the screen
        data={books}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        showVerticalScrollIndicator={false}

        //to add a pull to refresh feature(refreshControl)
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBooks(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }

        //to handle loading more books when the user reaches the end of the list
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        //if the books array is not empty, show this component
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookWorm 📚</Text>
            <Text style={styles.headerSubtitle}>Discover great reads from the community👇</Text>
          </View>
        }

        //to show a loading indicator when loading more books
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
        }

        //if the books array is empty, show this component
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share a book!</Text>
          </View>
        }
      />

    </View>
  )
}