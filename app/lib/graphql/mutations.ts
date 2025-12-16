import { gql } from "@apollo/client";

export const GET_NEWS_FEED = gql`
  query GetNewsFeed($limit: Int, $cursor: Int) {
    getNewsFeed(limit: $limit, cursor: $cursor) {
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
`;

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      success
      message
      post {
        id
        content
        postType
        mediaUrls
        location
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
    }
  }
`;
