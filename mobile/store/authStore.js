//this is a file to handle authentication state using Zustand
//zustand is a small, fast and scalable bearbones state-management solution using simplified flux principles used to manage global state in react applications means we can access the auth state from any component without prop drilling because pop drilling can get messy and hard to manage in larger applications
//to manage global stats, zustand provides a simple and intuitive API to create a store that holds the state and provides methods to update it
//differece ebetween zustand and useState is that useState is used to manage local state within a single component, while zustand is used to manage global state across multiple components
import { create } from 'zustand';
//AsyncStorage is like local storage for react native applications, it allows us to store data persistently on the device
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

//create the auth store to manage authentication state instead of using useState in multiple components
export const useAuthStore = create((set) => ({ //this setter function is used to update the state of a component in the store
    user: null, //initial user state
    token: null, //initial token state
    isLoading: false, //initial loading state to manage loading during async operations like signup/login
    isCheckingAuth: true, //initial state to manage auth checking during app load

    //method to signup a user
    register: async (username, email, password) => {
        //here loading true when the registration process starts
        set({ isLoading: true });
        try {
            console.log("[AUTH] Registering with URL:", `${API_URL}/api/auth/register`);
            const response = await fetch(`${API_URL}/api/auth/register`, { //make a post request to the backend api to register the user
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }), //send username, email and password in the request body
            })

            console.log("[AUTH] Fetch completed. Status:", response.status);

            // Check if we actually got a response
            const text = await response.text(); // read raw response first
            console.log("[AUTH] Raw response text:", text);

            // Try parsing JSON safely
            let data;
            try {
                data = JSON.parse(text);
                console.log("[AUTH] Parsed JSON response:", data);
            } catch (jsonError) {
                console.error("[AUTH] JSON parse error:", jsonError.message);
                console.error("[AUTH] Response content lead:", text.substring(0, 500)); // Log first 500 chars
                throw new Error(`Server returned invalid JSON. Status: ${response.status}. Content: ${text.substring(0, 100)}...`);
            }

            if (!response.ok) {
                console.error("[AUTH] Response not OK:", data.message || text);
                throw new Error(data.message || "Something went wrong");
            }

            //in the endpoints in the authRoutes.js file in the backend, we send back the user and token upon successful registration
            await AsyncStorage.setItem('user', JSON.stringify(data.user)); //store the user data in async storage for persistent login
            await AsyncStorage.setItem('token', data.token); //store the token in async storage for persistent login

            set({
                user: data.user, //update the user state with the registered user data
                token: data.token, //update the token state with the received token
                isLoading: false, //set loading to false when registration is complete
            });

            console.log("[AUTH] Registration successful, user stored in AsyncStorage.");

            return { success: true }; //return success true if registration is successful
        } catch (error) {
            set({ isLoading: false }); //set loading to false if there is an error during registration
            return { success: false, error: error.message }; //return success false and the error message
        }
    },


    //method to login a user
    login: async (email, password) => {
        set({ isLoading: true }); //set loading to true when login process starts
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, { //make a post request to the backend api to login the user
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), //send email and password in the request body
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }
            //in the endpoints in the authRoutes.js file in the backend, we send back the user and token upon successful login
            await AsyncStorage.setItem('user', JSON.stringify(data.user));
            await AsyncStorage.setItem('token', data.token);

            set({
                user: data.user, //update the user state with the logged in user data
                token: data.token, //update the token state with the received token
                isLoading: false, //set loading to false when login is complete
            });
            return { success: true }; //return success true if login is successful
        } catch (error) {
            set({ isLoading: false }); //set loading to false if there is an error during login
            return { success: false, error: error.message }; //return success false and the error message
        }
    },

    //used to keep user logged in between app restarts by checking async storage for existing user and token
    checkAuth : async () => {
        try{
            const token = await AsyncStorage.getItem('token');
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;
            set({user, token});
        } catch (error) {
            console.log("Error checking auth:", error);
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    logout : async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        set({ user: null, token: null });
    }
}));