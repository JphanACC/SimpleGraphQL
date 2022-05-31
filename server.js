const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP //have to destructure
const { //import Schema in order to work
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const app = express()

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

//TODO. Models
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
      id: { type: GraphQLNonNull(GraphQLInt) },
      name: { type: GraphQLNonNull(GraphQLString) },
      authorId: { type: GraphQLNonNull(GraphQLInt) },
      author: {
        type: AuthorType,
        resolve: (book) => {
          return authors.find(author => author.id === book.authorId)
        }
      }
    })
  })
  
  const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents a author of a book',
    fields: () => ({
      id: { type: GraphQLNonNull(GraphQLInt) },
      name: { type: GraphQLNonNull(GraphQLString) },
      books: {
        type: new GraphQLList(BookType),
        resolve: (author) => {
          return books.filter(book => book.authorId === author.id)
        }
      }
    })
  })


/*
const schema = new GraphQLSchema({
    query: new GraphQLObjectType({ //make an Object.
        name: "HelloUser",
        fields: () => ({ //make a function then return the fields
            message: {
                type: GraphQLString, //define type of the message. Import GraphQL String as type
                resolve: () => 'Hello Word' //Use resolve to tell graphl where to get information from with function
             } 
        })
    })
})
*/

//In controller, you make these query?
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields:() => ({
        book: {
            type: BookType, 
            description: 'Give one book',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => books.find(book => book.id === args.id) //the resolve returns just one single books object
        },
        books: {
            type: new GraphQLList(BookType), //create a new GrapQL List with BookType
            description: 'List of All Books',
            resolve: () => books //the resolve returns just one single books object
        },
        author: {
            type: AuthorType, 
            description: 'Give one author',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id) //the resolve returns just one single books object
        },
        authors: {
            type: new GraphQLList(AuthorType), //create a new GrapQL List with BookType
            description: 'List of All Authors',
            resolve: () => authors 
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Mutation Root',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a Book',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = {id: books.length + 1, name: args.name, authorId: args.authorId }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an Author',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                const author = {id: authors.length + 1, name: args.name }
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

//this gives an user interface to access the GraphQL without having to use Postman
app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))
//listen to server port
app.listen(5000., () => console.log('Server Running...'))

