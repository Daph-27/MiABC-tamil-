import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { UserProvider } from './state/UserContext';
import HomeScreen from './screens/HomeScreen';
import { AlphabetScreen } from './screens/AlphabetScreen';
import { SoundsScreen } from './screens/SoundsScreen';
import { MathematicsScreen } from './screens/MathematicsScreen';
import { FamilyScreen } from './screens/FamilyScreen';
import { WriteScreen } from './screens/WriteScreen';
import { ReadScreen } from './screens/ReadScreen';
import { CompleteScreen } from './screens/CompleteScreen';
import { WordsScreen } from './screens/WordsScreen';
import { FestivalsScreen } from './screens/FestivalsScreen';
import { ColorsScreen } from './screens/ColorsScreen';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import ProfilePictureScreen from './screens/ProfilePictureScreen';
import CustomDrawerContent from './navigation/CustomDrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const AppDrawer = () => {
  return (
    <Drawer.Navigator 
      initialRouteName="Dashboard" 
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Dashboard" component={HomeScreen} options={{ headerShown: false }} />
    </Drawer.Navigator>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 4000);
  }, []);

  return (
    <UserProvider>
      <NavigationContainer>
        {showSplash ? (
          <SplashScreen />
        ) : (
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegistrationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ProfilePicture" component={ProfilePictureScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={AppDrawer} options={{ headerShown: false }} />
            <Stack.Screen name="Alphabet" component={AlphabetScreen} />
            <Stack.Screen name="Sounds" component={SoundsScreen} />
            <Stack.Screen name="Mathematics" component={MathematicsScreen} />
            <Stack.Screen name="Family" component={FamilyScreen} />
            <Stack.Screen name="Write" component={WriteScreen} />
            <Stack.Screen name="Read" component={ReadScreen} />
            <Stack.Screen name="Complete" component={CompleteScreen} />
            <Stack.Screen name="Words" component={WordsScreen} />
            <Stack.Screen name="Festivals" component={FestivalsScreen} />
            <Stack.Screen name="Colors" component={ColorsScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
