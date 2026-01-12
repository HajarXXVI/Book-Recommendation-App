import { useEffect, useState } from "react";
import {
  View,
  Alert,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/config";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/profile.styles";
import ProfileHeader from "../../components/profilHeader";
import LogoutButton from "../../components/logoutButton";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Loader from "../../components/loader";



export default function Profile() {

  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState(null); //used to show loading indicator while deleting a book

  const { token } = useAuthStore();

  const router = useRouter();

  //fetch user books and set them to the books state
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/books/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch user books");

      setBooks(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load profile data. Pull down to refresh.");
    } finally {
      setIsLoading(false);
    }
  };


  //handle delete book
  const handleDeleteBook = async (bookId) => {
    try {
      setDeleteBookId(bookId);

      const response = await fetch(`${API_URL}/api/books/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete book");

      setBooks(books.filter((book) => book._id !== bookId));
      Alert.alert("Success", "Recommendation deleted successfully");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to delete recommendation");
    } finally {
      setDeleteBookId(null);
    }
  };

  //confirm delete for book
  const confirmDelete = (bookId) => {
    if (Platform.OS === 'web') {
      if (confirm("Are you sure you want to delete this recommendation?")) {
        handleDeleteBook(bookId);
      }
    } else {
      Alert.alert("Delete Recommendation", "Are you sure you want to delete this recommendation?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDeleteBook(bookId) },
      ]);
    }
  };


  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={item.image} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
        <Text style={styles.bookCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        <Text style={styles.bookDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item._id)}>
        {deleteBookId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );


  //render rating stars
  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };


  //fetch user books on mount
  useEffect(() => {
    fetchData();
  }, []);



  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      {/* YOUR RECOMMENDATIONS */}
      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Your Recommendations 📚</Text>
        <Text style={styles.booksCount}>{books.length} books</Text>
      </View>


      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        // refreshControl={
        //   <RefreshControl
        //     refreshing={refreshing}
        //     onRefresh={handleRefresh}
        //     colors={[COLORS.primary]}
        //     tintColor={COLORS.primary}
        //   />
        // }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={50} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
              <Text style={styles.addButtonText}>Add Your First Book</Text>
            </TouchableOpacity>
          </View>
        }
      />

    </View>
  )
}