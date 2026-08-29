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

function getBrowserWebSocketUrl(configuredUrl?: string): string | null {
  if (typeof window === "undefined" || !configuredUrl) return null;

  try {
    const url = new URL(configuredUrl, window.location.origin);
    const pageIsRemote = !["localhost", "127.0.0.1"].includes(
      window.location.hostname
    );
    const socketIsLocal = ["localhost", "127.0.0.1"].includes(url.hostname);

    // A localhost socket in a public/forwarded browser points at the viewer's
    // own machine, not at this application server.
    if (pageIsRemote && socketIsLocal) return null;

    if (window.location.protocol === "https:" && url.protocol === "ws:") {
      url.protocol = "wss:";
    }

    return url.toString();
  } catch {
    return null;
  }
}

/** HttpOnly cookie is sent via same-origin rewrites (localhost:3000 → gateway). */
const authLink = new SetContextLink((prevContext) => ({
  credentials: "include",
  headers: {
    ...prevContext.headers,
  },
}));

const postHttpLink = authLink.concat(
  new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_POST_URL,
    credentials: "include",
    fetchOptions: { mode: "cors" },
  })
);

const commentHttpLink = authLink.concat(
  new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_COMMENT_URL,
    credentials: "include",
    fetchOptions: { mode: "cors" },
  })
);

const httpSplitLink = ApolloLink.split(
  (operation) => operation.getContext().graphqlService === "comment",
  commentHttpLink,
  postHttpLink
);

const commentWebSocketUrl = getBrowserWebSocketUrl(
  process.env.NEXT_PUBLIC_WS_COMMENT_URL
);

const wsLink =
  commentWebSocketUrl
    ? new GraphQLWsLink(
        createClient({
          // The browser sends the HttpOnly access-token cookie during the
          // WebSocket handshake. Never expose the JWT to client JavaScript.
          url: commentWebSocketUrl,
        })
      )
    : null;

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
      httpSplitLink
    )
  : httpSplitLink;

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
              if (!args?.cursor) return incoming;

              const existingPosts = existing.posts || [];
              const incomingPosts = incoming.posts || [];
              const existingIds = new Set(
                existingPosts.map((post: { __ref?: string; id?: number }) =>
                  post.__ref || post.id
                )
              );
              const newPosts = incomingPosts.filter(
                (post: { __ref?: string; id?: number }) =>
                  !existingIds.has(post.__ref || post.id)
              );

              return {
                ...incoming,
                posts: [...existingPosts, ...newPosts],
              };
            },
          },
          getComments: {
            keyArgs: ["postId"],
            merge(existing, incoming, { args }) {
              if (!incoming) return existing;
              if (!existing) return incoming;
              if (!args?.cursor) return incoming;

              const existingComments = existing.comments || [];
              const incomingComments = incoming.comments || [];
              const existingIds = new Set(
                existingComments.map(
                  (comment: { __ref?: string; id?: number }) =>
                    comment.__ref || comment.id
                )
              );
              const newComments = incomingComments.filter(
                (comment: { __ref?: string; id?: number }) =>
                  !existingIds.has(comment.__ref || comment.id)
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

/** Route operations to the comment GraphQL service */
export const commentServiceContext = { graphqlService: "comment" as const };

export default client;
