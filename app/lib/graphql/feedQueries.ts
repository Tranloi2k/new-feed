import { gql } from "@apollo/client";

export const GET_NEWS_FEED = gql`
  query GetNewsFeed($limit: Int, $cursor: Int) {
    getNewsFeed(limit: $limit, cursor: $cursor) {
      posts {
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
      hasMore
      nextCursor
    }
  }
`;
