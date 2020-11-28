require("dotenv").config();
const { ApolloServer, gql } = require("apollo-server");
const mongoose = require("mongoose");

//Connect to database
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    throw new Error(error);
  });

//Database Model
const toDoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const ToDo = mongoose.model("ToDo", toDoSchema);

//GraphQL Schemas
const typeDefs = gql`
  type ToDo {
    id: ID!
    title: String!
    description: String!
  }

  input ToDoInput {
    title: String!
    description: String!
  }

  type Query {
    getToDo(toDoId: ID!): ToDo!
    getToDos: [ToDo!]!
  }

  type Mutation {
    createToDo(toDoInput: ToDoInput): ToDo
    updateToDo(toDoId: ID!, toDoInput: ToDoInput): ToDo
    deleteToDo(toDoId: ID!): ToDo
    deleteToDos: [ToDo!]!
  }
`;

const resolvers = {
  Query: {
    getToDo: async (parent, args) => {
      try {
        const { toDoId } = args;
        return await ToDo.findById(toDoId);
      } catch (error) {
        throw new Error(error);
      }
    },
    getToDos: async (parent, args) => {
      try {
        return await ToDo.find();
      } catch (error) {
        throw new Error(error);
      }
    },
  },

  Mutation: {
    createToDo: async (parent, args) => {
      try {
        const { toDoInput } = args;
        return await ToDo.create(toDoInput);
      } catch (error) {
        throw new Error(error);
      }
    },
    updateToDo: async (parent, args) => {
      try {
        const { toDoId, toDoInput } = args;
        return await ToDo.findOneAndUpdate(toDoId, toDoInput, { new: true });
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteToDo: async (parent, args) => {
      try {
        const { toDoId } = args;
        return await ToDo.findByIdAndDelete(toDoId);
      } catch (error) {
        throw new Error(error);
      }
    },
    deleteToDos: async (parent, args) => {
      try {
        return await ToDo.remove();
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
