import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '../services/api';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function AppApolloProvider({ children }: Props) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}

