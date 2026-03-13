import gql from "graphql-tag";

export const authType = gql`

  type AuthPayload {
    token: String!
  }

  extend type Mutation {

    register(
      email: String!
      password: String!
    ): AuthPayload!

    login(
      email: String!
      password: String!
    ): AuthPayload!
  }

`;