import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../i18n';

import { useAuth } from '../context/AuthContext';
import { couleurs, espacements, rayon, ombre, typo } from '../theme/colors';
import LanguageToggle from '../components/LanguageToggle';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CandidatesScreen from '../screens/CandidatesScreen';
import VoteConfirmScreen from '../screens/VoteConfirmScreen';
import ResultsScreen from '../screens/ResultsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/** Écrans accessibles avant connexion */
function NavigationAuth() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Connexion" component={LoginScreen} />
      <Stack.Screen name="Inscription" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

/** Onglets principaux une fois connecté */
function OngletsPrincipaux() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerRight: () => <LanguageToggle />,
        tabBarActiveTintColor: '#1EB53A',
        tabBarInactiveTintColor: couleurs.grisClair,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse';
          if (route.name === 'Candidats') {
            iconName = 'people';
          } else if (route.name === 'Résultats') {
            iconName = 'stats-chart';
          } else if (route.name === 'Profil') {
            iconName = 'person';
          }
          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Candidats" 
        component={CandidatesScreen} 
        options={{ 
          tabBarLabel: t('Candidats'),
          title: t('Candidats')
        }} 
      />
      <Tab.Screen 
        name="Résultats" 
        component={ResultsScreen} 
        options={{ 
          tabBarLabel: t('Résultats'),
          title: t('Résultats')
        }} 
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: t('Profil'),
          title: t('Profil')
        }} 
      />
    </Tab.Navigator>
  );
}

/** Pile principale : onglets + écran de confirmation de vote (au-dessus des onglets) */
function NavigationPrincipale() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CandidatsStack" component={OngletsPrincipaux} />
      <Stack.Screen
        name="ConfirmationVote"
        component={VoteConfirmScreen}
        options={{ presentation: 'modal', headerShown: true, title: t('Confirmer le vote') }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { utilisateur, chargement } = useAuth();

  if (chargement) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {utilisateur ? <NavigationPrincipale /> : <NavigationAuth />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopColor: couleurs.grisTresClair,
    height: 58,
    paddingBottom: 6,
    paddingTop: 6,
  }
});
