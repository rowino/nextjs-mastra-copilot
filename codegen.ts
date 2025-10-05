import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './graphql/schema.graphql',
  documents: ['src/**/*.{ts,tsx}', '!src/lib/graphql/generated/**/*'],
  generates: {
    './src/lib/graphql/generated/': {
      preset: 'client',
      plugins: [],
      config: {
        scalars: {
          DateTimeTz: 'string',
          JSON: 'Record<string, any>',
          Upload: 'File',
        },
      },
      presetConfig: {
        gqlTagName: 'graphql',
        fragmentMasking: false,
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
