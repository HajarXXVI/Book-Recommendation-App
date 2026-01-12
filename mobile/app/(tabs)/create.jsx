import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Platform
} from 'react-native'
import React, {useState} from 'react'
import { useRouter } from 'expo-router';
import styles from '../../assets/styles/create.styles';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors.js'

export default function Create() {

  const [title, setTitle] = useState(""); // post title
  const [caption, setCaption] = useState(""); // post caption
  const [rating, setRating] = useState(3); // default rating
  const [image, setImage] = useState(null); // to display the selected image
  const [imageBase64, setImageBase64] = useState(null); //to upload and to display the selected image, and base64 is a way to turn images into text so they can be easily sent over the internet, it's like translating a picture into words that computers can send in messages. in order to store the image as string to send it into the body of a POST request
  const [loading, setLoading] = useState(false); // to show loading indicator during upload

  const router = useRouter();

  const pickImage = async () => {}

  const handleSubmit = async () => {}

  return (
    // KeyboardAvoidingView is used to adjust the view when the keyboard is open, so that input fields are not hidden behind the keyboard
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recommendation</Text>
            <Text style={styles.subtitle}>Share your favorite reads with others</Text>
          </View>

          <View style={styles.form}>

          {/* BOOK TITLE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter book title"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}