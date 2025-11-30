import { ApolloClient, InMemoryCache, createHttpLink, split, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || "http://localhost:8000/graphql/",
  credentials: "include",
});

// Auth link pour ajouter le token JWT
const authLink = setContext((_, { headers }) => {
  // Récupérer le token depuis le store (sera géré côté client)
  const token = typeof window !== "undefined" ? localStorage.getItem("auth-storage") : null;
  let parsedToken = null;
  
  if (token) {
    try {
      const authData = JSON.parse(token);
      parsedToken = authData?.state?.token;
    } catch (e) {
      // Ignore
    }
  }

  return {
    headers: {
      ...headers,
      authorization: parsedToken ? `JWT ${parsedToken}` : "",
    },
  };
});

// WebSocket link pour les subscriptions
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URI || "ws://localhost:8000/graphql/",
          connectionParams: () => {
            const token = localStorage.getItem("auth-storage");
            let parsedToken = null;
            
            if (token) {
              try {
                const authData = JSON.parse(token);
                parsedToken = authData?.state?.token;
              } catch (e) {
                // Ignore
              }
            }

            return {
              authorization: parsedToken ? `JWT ${parsedToken}` : "",
            };
          },
        })
      )
    : null;

// Split link pour utiliser HTTP pour les queries/mutations et WebSocket pour les subscriptions
const splitLink =
  typeof window !== "undefined" && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        from([authLink, httpLink])
      )
    : from([authLink, httpLink]);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});

