import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import styles from '../../assets/styles/create.styles';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors.js';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { API_URL } from "../../constants/config.js";
import { useAuthStore } from '../../store/authStore.js';

export default function Create() {

  const [title, setTitle] = useState(""); // post title
  const [caption, setCaption] = useState(""); // post caption
  const [rating, setRating] = useState(3); // default rating
  const [image, setImage] = useState(null); // to display the selected image
  const [imageBase64, setImageBase64] = useState(null); //to upload and to display the selected image, and base64 is a way to turn images into text so they can be easily sent over the internet, it's like translating a picture into words that computers can send in messages. in order to store the image as string to send it into the body of a POST request
  const [loading, setLoading] = useState(false); // to show loading indicator during upload

  const router = useRouter();

  const { token } = useAuthStore();

  //this is used to pick an image from the device's media library
  const pickImage = async () => {
    try {
      // request permission if needed
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); //this is used to request permission to access the media library (camera roll) on the device

        if (status !== "granted") {
          Alert.alert("Permission Denied", "We need camera roll permissions to upload an image");
          return;
        }
      }

      // launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // lower quality for smaller base64
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);

        // if base64 is provided, use it

        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          // otherwise, convert to base64
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "There was a problem selecting your image");
    }
  };

  //this is used to handle the submission of the book recommendation form
  const handleSubmit = async () => {
    //if any field is missing, show an alert and return early
    if (!title || !caption || !imageBase64 || !rating) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // Determine image type safely
      let imageType = "image/jpeg"; // Default fallback
      if (image) {
        const uriParts = image.split(".");
        const potentialExtension = uriParts[uriParts.length - 1];
        // Check if the extension looks valid (alphanumeric and reasonable length)
        if (potentialExtension && /^[a-zA-Z0-9]{3,4}$/.test(potentialExtension)) {
          imageType = `image/${potentialExtension.toLowerCase()}`;
        }
      }

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`; //to create a data URL that includes the image's MIME type and its base64-encoded data

      const response = await fetch(`${API_URL}/api/books`, { // Send a POST request to the /books endpoint of the API to create a new book recommendation
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header in order to authenticate the request
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          caption,
          rating: rating.toString(),
          image: imageDataUrl,
        }),
      });

      //parse the response from the server which means converting the response data from JSON format into a JavaScript object
      // DEBUG: log raw text
      const text = await response.text();
      console.log("Raw response:", text); // <-- see what the server actually sent

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        throw new Error(`Server returned invalid JSON. Text: ${text.substring(0, 200)}`);
      }
      //if the post is created successfully, show a success alert and reset the form fields
      Alert.alert("Success", "Your book recommendation has been posted!");
      //reset form fields after successful submission
      setTitle("");
      setCaption("");
      setRating(3);
      setImage(null);
      setImageBase64(null);
      //navigate back to the home screen after successful submission
      router.push("/");
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  //render rating picker component
  const renderRatingPicker = () => {
    const stars = [];
    //every single time an icon is pressed, the setRating function is called with the corresponding rating value (i), updating the rating state
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };


  return (
    // KeyboardAvoidingView is used to adjust the view when the keyboard is open, so that input fields are not hidden behind the keyboard
    <KeyboardAvoidingView
      style={{ flex: 1 }}
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

            {/* RATING */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Rating</Text>
              {renderRatingPicker()}
            </View>

            {/* IMAGE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
                    <Text style={styles.placeholderText}>Tap to select image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* CAPTION */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Write your review or thoughts about this book..."
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Share</Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}