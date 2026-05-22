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

let wsTokenCache: string | null | undefined;

async function fetchWsAccessToken(): Promise<string | null> {
  if (wsTokenCache !== undefined) return wsTokenCache;
  try {
    const res = await fetch("/api/auth/access-token", { credentials: "include" });
    if (!res.ok) {
      wsTokenCache = null;
      return null;
    }
    const data = (await res.json()) as { token?: string };
    wsTokenCache = data.token ?? null;
    return wsTokenCache;
  } catch {
    wsTokenCache = null;
    return null;
  }
}

function buildCommentWsUrl(token: string | null): string {
  const base = process.env.NEXT_PUBLIC_WS_COMMENT_URL || "";
  if (!token) return base;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}access_token=${encodeURIComponent(token)}`;
}

const wsLink =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_WS_COMMENT_URL
    ? new GraphQLWsLink(
        createClient({
          url: async () => {
            const token = await fetchWsAccessToken();
            return buildCommentWsUrl(token);
          },
          connectionParams: async () => {
            const token = await fetchWsAccessToken();
            return { accessToken: token || "" };
          },
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
