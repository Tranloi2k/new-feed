import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// HTTP connection to the API
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  credentials: "include",
  fetchOptions: {
    mode: "cors",
  },
});

const authLink = new SetContextLink((prevContext) => {
  const token = getCookie("access_token");
  const userId = getCookie("user_id");

  return {
    credentials: "include",
    headers: {
      ...prevContext.headers,
      ...(token && { authorization: `Bearer ${token}` }),
      ...(userId && { "x-user-id": userId }),
    },
  };
});

// WebSocket connection for subscriptions
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: process.env.NEXT_PUBLIC_WS_COMMENT_URL!,
          connectionParams: () => {
            const token = getCookie("access_token");
            const userId = getCookie("user_id");
            return {
              accessToken: token || "",
              userId: userId || "",
            };
          },
        })
      )
    : null;

// Split link: HTTP for queries/mutations, WebSocket for subscriptions
const httpLinkWithAuth = authLink.concat(httpLink);

const splitLink = wsLink
  ? ApolloLink.split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLinkWithAuth
    )
  : httpLinkWithAuth;

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getNewsFeed: {
            keyArgs: false,
            merge(existing, incoming, { args }) {
              if (!incoming) return existing;
              if (!existing) return incoming;

              // If cursor is null, it's initial load - replace everything
              if (!args?.cursor) {
                return incoming;
              }

              // For pagination, merge posts and deduplicate by id
              const existingPosts = existing.posts || [];
              const incomingPosts = incoming.posts || [];

              const existingIds = new Set(
                existingPosts.map((post: any) => post.__ref || post.id)
              );
              const newPosts = incomingPosts.filter(
                (post: any) => !existingIds.has(post.__ref || post.id)
              );

              return {
                ...incoming,
                posts: [...existingPosts, ...newPosts],
              };
            },
          },
          getComments: {
            keyArgs: ["postId"], // Mỗi postId có cache riêng
            merge(existing, incoming, { args }) {
              if (!incoming) return existing;
              if (!existing) return incoming;

              // If cursor is null, it's initial load - replace everything
              if (!args?.cursor) {
                return incoming;
              }

              // For pagination, merge comments and deduplicate
              const existingComments = existing.comments || [];
              const incomingComments = incoming.comments || [];

              const existingIds = new Set(
                existingComments.map(
                  (comment: any) => comment.__ref || comment.id
                )
              );
              const newComments = incomingComments.filter(
                (comment: any) => !existingIds.has(comment.__ref || comment.id)
              );

              return {
                ...incoming,
                comments: [...existingComments, ...newComments],
              };
            },
          },
        },
      },
    },
  }),
});

export default client;
