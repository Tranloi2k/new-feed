import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";

export type Maybe<T> = T | null;

export type User = {
  __typename?: "User";
  id: number;
  username: string;
  email: string;
  fullName?: Maybe<string>;
  avatarUrl?: Maybe<string>;
};

export type Post = {
  __typename?: "Post";
  id: number;
  content?: Maybe<string>;
  postType: string;
  mediaUrls?: Maybe<Array<Maybe<string>>>;
  location?: Maybe<string>;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  user?: Maybe<User>;
};

export type NewsFeedResponse = {
  __typename?: "NewsFeedResponse";
  posts: Array<Post>;
  hasMore: boolean;
  nextCursor?: Maybe<number>;
};

export type CreatePostInput = {
  content?: Maybe<string>;
  postType: string;
  mediaUrls?: Maybe<Array<string>>;
  location?: Maybe<string>;
};

export type CreatePostResponse = {
  __typename?: "CreatePostResponse";
  success: boolean;
  message: string;
  post?: Maybe<Post>;
};

export type GetNewsFeedQueryVariables = {
  limit?: Maybe<number>;
  cursor?: Maybe<number>;
};

export type GetNewsFeedQuery = {
  getNewsFeed: NewsFeedResponse;
};

export type CreatePostMutationVariables = {
  input: CreatePostInput;
};

export type CreatePostMutation = {
  createPost: CreatePostResponse;
};

export type Comment = {
  __typename?: "Comment";
  id: number;
  content: string;
  createdAt: string;
  user?: Maybe<User>;
  replies?: Maybe<Array<Maybe<Comment>>>;
};

export type CommentsResponse = {
  __typename?: "CommentsResponse";
  comments: Array<Comment>;
  hasMore: boolean;
  nextCursor?: Maybe<number>;
};

export type CreateCommentInput = {
  postId: number;
  content: string;
  parentCommentId?: Maybe<number>;
};

export type CreateCommentResponse = {
  __typename?: "CreateCommentResponse";
  success: boolean;
  message: string;
  comment?: Maybe<Comment>;
};

export type GetCommentsQueryVariables = {
  postId: number;
  limit?: Maybe<number>;
  cursor?: Maybe<number>;
};

export type GetCommentsQuery = {
  getComments: CommentsResponse;
};

export type CreateCommentMutationVariables = {
  input: CreateCommentInput;
};

export type CreateCommentMutation = {
  createComment: CreateCommentResponse;
};

export type CommentAddedSubscriptionVariables = {
  postId: number;
};

export type CommentAddedSubscription = {
  commentAdded: Comment;
};

export type CommentDeletedSubscriptionVariables = {
  postId: number;
};

export type CommentDeletedSubscription = {
  commentDeleted: number;
};

export const GetNewsFeedDocument = gql`
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
` as TypedDocumentNode<GetNewsFeedQuery, GetNewsFeedQueryVariables>;

export const CreatePostDocument = gql`
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
` as TypedDocumentNode<CreatePostMutation, CreatePostMutationVariables>;

export const GetCommentsDocument = gql`
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
` as TypedDocumentNode<GetCommentsQuery, GetCommentsQueryVariables>;

export const CreateCommentDocument = gql`
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
` as TypedDocumentNode<
  CreateCommentMutation,
  CreateCommentMutationVariables
>;

export const CommentAddedDocument = gql`
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
` as TypedDocumentNode<
  CommentAddedSubscription,
  CommentAddedSubscriptionVariables
>;

export const CommentDeletedDocument = gql`
  subscription CommentDeleted($postId: Int!) {
    commentDeleted(postId: $postId)
  }
` as TypedDocumentNode<
  CommentDeletedSubscription,
  CommentDeletedSubscriptionVariables
>;
