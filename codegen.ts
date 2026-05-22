import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: [
    "graphql/schemas/post.graphql",
    "graphql/schemas/comment.graphql",
  ],
  documents: [
    "features/feed/graphql/**/*.graphql",
    "features/comments/graphql/**/*.graphql",
  ],
  generates: {
    "features/shared/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typed-document-node",
      ],
      config: {
        avoidOptionals: true,
        dedupeFragments: true,
      },
    },
  },
  ignoreNoDocuments: false,
};

export default config;
