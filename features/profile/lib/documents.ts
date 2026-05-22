import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import type { GetNewsFeedQuery } from "@/features/shared/generated/graphql";

export type GetUserPostsQuery = {
  getUserPosts: GetNewsFeedQuery["getNewsFeed"];
};

export type GetUserPostsQueryVariables = {
  userId: number;
  limit?: number | null;
  cursor?: number | null;
};

export const GetUserPostsDocument = gql`
  query GetUserPosts($userId: Int!, $limit: Int, $cursor: Int) {
    getUserPosts(userId: $userId, limit: $limit, cursor: $cursor) {
      posts {
        id
        content
        postType
        mediaUrls
        likeCount
        commentCount
        shareCount
        createdAt
        user {
          id
          username
          fullName
          avatarUrl
        }
      }
      hasMore
      nextCursor
    }
  }
` as TypedDocumentNode<GetUserPostsQuery, GetUserPostsQueryVariables>;
