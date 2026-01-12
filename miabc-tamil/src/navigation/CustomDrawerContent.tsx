import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';

const user = { username: 'User', profilePic: null };

const drawerItems = [
  { label: 'Home / முகப்பு', screen: 'Home', icon: require('../../assets/home-menu-icon.png') },
  { label: 'Alphabet / அகரவரிசை', screen: 'Alphabet', icon: require('../../assets/alphabet-icon.png') },
  { label: 'Sounds / ஒலிகள்', screen: 'Sounds', icon: require('../../assets/sound-menu-icon.png') },
  { label: 'Words / சொற்கள்', screen: 'Words', icon: require('../../assets/words-menu-icon.png') },
  { label: 'To complete / முடிக்க', screen: 'Complete', icon: require('../../assets/complete-menu-icon.png') },
  { label: 'Family / குடும்பம்', screen: 'Family', icon: require('../../assets/family-menu-icon.png') },
  { label: 'Colors / நிறங்கள்', screen: 'Colors', icon: require('../../assets/colors-menu-icon.png') },
  { label: 'Math / கணிதம்', screen: 'Mathematics', icon: require('../../assets/math-menu-icon.png') },
  { label: 'Festivals / விழாக்கள்', screen: 'Festivals', icon: require('../../assets/festival-menu-icon.png') },
  { label: 'I can write / நான் எழுதுவேன்', screen: 'Write', icon: require('../../assets/writing-menu-icon.png') },
  { label: 'I can read / நான் படிப்பேன்', screen: 'Read', icon: require('../../assets/reading-menu-icon.png') },
];

const CustomDrawerContent = (props) => {
  const activeRouteName = props.state.routes[props.state.index].name;

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* HEADER IMAGE */}
        <ImageBackground
          source={require('../../assets/slidebar-top image.png')}
          style={styles.topHeaderSection}
          resizeMode="cover"
        />

        {/* BODY */}
        <View style={styles.drawerBody}>
          {/* PROFILE (NO GAP) */}
          <View style={styles.profileSection}>
            <View style={styles.profileContainer}>
              <Image
                source={user.profilePic || require('../../assets/user-icon.png')}
                style={styles.profilePic}
              />
            </View>
          </View>

          {/* MENU ITEMS */}
          {drawerItems.map((item, index) => {
            const isFocused = activeRouteName === item.screen;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => props.navigation.navigate(item.screen)}
                style={[
                  styles.drawerItem,
                  isFocused && styles.focusedDrawerItem,
                ]}
              >
                <Image source={item.icon} style={styles.drawerIcon} />
                <Text style={styles.drawerLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

export default CustomDrawerContent;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff4500',
  },

  scrollContainer: {
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: '#ff4500',
  },

  topHeaderSection: {
    width: '100%',
    height: 190,
    marginBottom: -50, // 🔥 removes gap between image & profile
  },

  drawerBody: {
    backgroundColor: '#ff4500',
  },

  profileSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },

  profileContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4f4f4f',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 45,
    tintColor: '#fff',
  },

  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ff7f50',
  },

  focusedDrawerItem: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },

  drawerIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: '#fff',
    marginRight: 20,
  },

  drawerLabel: {
    flex: 1,
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },

  footer: {
    padding: 12,
    backgroundColor: '#ff4500',
  },

  footerText: {
    textAlign: 'center',
    color: '#fff',
    opacity: 0.8,
  },
});
