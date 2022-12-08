import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer, gql } from "apollo-server-express";

const User = gql`
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

    # This "Book" type defines the queryable fields for every book in our data source.
    type Paper {
        camera: String
    }
    type Book {
        title: String
        author: String
        paper: Paper
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "books" query returns an array of zero or more Books (defined above).
    type Query {
        getAllBooks: [Book]
        book(title: String!): Book
    }
`;
const books = [
    {
        title: "The Awakening",
        author: "Kate Chopin",
        paper: {
            camera: "Camera 1",
        },
    },
    {
        title: "City of Glass",
        author: "Paul Auster",
    },
];
const BookResolver = {
    Query: {
        getAllBooks: (a, b, c, d) => {
            console.log("getAllBooks run!", a, b, c.body, d);
            return books;
        },
        book: (_, obj) => {
            console.log("title", obj);
            return books.find((book) => book.title === obj.title);
        },
    },
};

const createApolloServerTest = async () => {
    return new ApolloServer({
        typeDefs: [User],
        resolvers: [BookResolver],
        csrfPrevention: true,
        cache: "bounded",
        context: ({ req, res }) => ({ req, res }),
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    });
};
export default createApolloServerTest;
