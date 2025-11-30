import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Constants from 'expo-constants';

// Configuration de l'URL GraphQL (à adapter selon votre backend)
// Pour Android, utiliser l'IP de votre machine au lieu de localhost
const GRAPHQL_URI = 
  Constants.expoConfig?.extra?.graphqlUri || 
  __DEV__ 
    ? 'http://192.168.0.100:8000/graphql/'  // IP de votre machine pour Android
    : 'http://localhost:8000/graphql/';

const httpLink = createHttpLink({
  uri: GRAPHQL_URI,
});

const authLink = setContext((_, { headers }) => {
  // Récupérer le token JWT depuis le store
  let token = '';
  try {
    // Import dynamique pour éviter les dépendances circulaires
    const authStore = require('../stores/authStore');
    token = authStore.useAuthStore.getState().token || '';
  } catch (e) {
    // Store pas encore initialisé ou erreur
    console.warn('Auth store not available:', e);
  }
  
  return {
    headers: {
      ...headers,
      authorization: token ? `JWT ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Requêtes GraphQL
export const REGISTER = gql`
  mutation Register($phone: String!, $password: String!, $name: String, $age: Int) {
    register(phone: $phone, password: $password, name: $name, age: $age) {
      success
      message
      token
      user {
        id
        phone
        name
        age
        pathologies
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($phone: String!, $password: String!) {
    login(phone: $phone, password: $password) {
      token
      user {
        id
        phone
        name
        age
        pathologies
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: ProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      age
      pathologies
    }
  }
`;

export const GET_DOCTORS = gql`
  query GetDoctors {
    doctors {
      id
      name
      specialty
      avatar
      price
      isOnline
      rating
    }
  }
`;

export const AI_TRIAGE = gql`
  mutation AITriage($symptoms: String!) {
    aiTriage(symptoms: $symptoms) {
      id
      severity
      advice
      recommendation
    }
  }
`;

