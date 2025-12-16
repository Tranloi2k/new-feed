import { gql } from "@apollo/client";

export const GET_POST_COMMENTS = gql`
  query GetComments($postId: Int!, $limit: Int, $cursor: Int) {
    getComments(postId: $postId, limit: $limit, cursor: $cursor) {
      comments {
        id
        content
        createdAt
        user {
          id
          username
          fullName
          avatarUrl
        }
        replies {
          id
          content
          createdAt
          user {
            id
            username
            fullName
            avatarUrl
          }
        }
      }
      hasMore
      nextCursor
    }
  }
`;

// export const CREATE_COMMENT = gql`
//   mutation CreateComment($postId: ID!, $content: String!) {
//     createComment(postId: $postId, content: $content) {
//       success
//       message
//       comment {
//         id
//         content
//         createdAt
//         user {
//           id
//           username
//           fullName
//           avatarUrl
//         }
//       }
//     }
//   }
// `;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      success
      message
      comment {
        id
        content
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

// GraphQL Subscription cho real-time comments
export const COMMENT_ADDED = gql`
  subscription CommentAdded($postId: Int!) {
    commentAdded(postId: $postId) {
      id
      content
      createdAt
      user {
        id
        username
        fullName
        avatarUrl
      }
      replies {
        id
        content
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

// Comment deleted subscription - returns commentId (Int!)
export const COMMENT_DELETED = gql`
  subscription CommentDeleted($postId: Int!) {
    commentDeleted(postId: $postId)
  }
`;
