# Fritter

Build your own not-quite-[Twitter](https://twitter.com/)!

<!-- ## Starter Code

  This starter code implements users (with login/sessions), and freets so that you may focus on implementing your own design ideas.

The project is structured as follows:

- `index.ts` sets up the database connection and the Express server
- `/freet` contains files related to freet concept
  - `collection.ts` contains freet collection class to wrap around MongoDB database
  - `middleware.ts` contains freet middleware
  - `model.ts` contains definition of freet datatype
  - `router.ts` contains backend freet routes
  - `util.ts` contains freet utility functions for transforming data returned to the client
- `/user` contains files related to user concept
  - `collection.ts` contains user collection class to wrap around MongoDB database
  - `middleware.ts` contains user middleware
  - `model.ts` - contains definition of user datatype
  - `router.ts` - contains backend user routes
  - `util.ts` contains user utility functions for transforming data returned to the client
- `/public` contains the code for the frontend (HTML/CSS/browser JS)

## Installation

Make a copy of this repository under your personal GitHub account by clicking the `Use this template` button. Make sure to enable the `Include all branches` option.

If you did **not** take 6.031 in Fall 2021 or Spring 2022, to ensure that your machine has the necessary software for the assignment, please follow Steps 1, 2, 5, and 6 on [this page](https://web.mit.edu/6.031/www/sp22/getting-started/) from the [6.031 website](https://web.mit.edu/6.031/www/sp22/) (now 6.1020).

### Setting up the demo branch (optional, but very helpful as a reference!)

- Navigate to the root folder of your cloned repository.
- Run `source demo-setup.sh` to set up the demo branches.
- Check your local branches with `git branch`; you should have one new branch, with a new commit.
  - `view-demo` demos how to extend functionality of a resource
- If everything looks good, run `git push --all origin`. At this point, you should see the demo branch at `https://github.com/<username>/<repo-name>/branches` (and the `view-demo-code` branch can now be deleted!)
- Now, if you navigate to the commit history of this branch (`https://github.com/<username>/<repo-name>/commits/<branch-name>`), you can click on the "demo:" commit and see exactly what we changed for each demo!

### MongoDB Atlas setup

Follow the instructions [here](https://docs.google.com/presentation/d/1HJ4Lz1a2IH5oKu21fQGYgs8G2irtMqnVI9vWDheGfKM/edit?usp=sharing) to add your fritter project to MongoDB Atlas.

After following the instructions above, you should have copied a secret that looks something like `mongodb+srv://xxxxxx:xxxxxxxxx@cluster0.yc2imit.mongodb.net/?retryWrites=true&w=majority`. Note that this allows complete access to your database, so do not include it anywhere that is pushed to GitHub or any other publicly accessible location.

To allow your local server to connect to the database you just created, create a file named `.env` in the project's root directory with the contents

```
MONGO_SRV=mongodb+srv://xxxxxx:xxxxxxxxx@cluster0.yc2imit.mongodb.net/?retryWrites=true&w=majority
```

where the secret is replaced with the one you obtained.

### Post-Installation

After finishing setup, we recommend testing both locally running the starter code, and deploying the code to Vercel, to make sure that both work before you run into issues later. The instructions can be found in the following two sections.

## Running your code locally

Firstly, open the terminal or command prompt and `cd` to the directory for this assignment. Before you make any changes, run the command `npm install` to install all the packages in `package.json`. You do not need to run this command every time you make any changes, unless you add a new package to the dependencies in `package.json`.

Finally, to test your changes locally, run the command `npm start` in the terminal or command prompt and navigate to `localhost:3000` and interact with the frontend to test your routes.

## Deployment to Vercel

We will be using Vercel to host a publicly accessible deployment of your application.

1. Create a fork of this repository through GitHub. This will create a repository in your GitHub account with a copy of the starter code. You'll use this copy to push your work and to deploy from.

2. [Create a Vercel account](https://vercel.com) using your GitHub account.

3. After you log in, go to the [project creation page](https://vercel.com/new) and select `Continue with GitHub` and give Vercel the permissions it asks for.

4. Find the repository you just created and click `Import`. For the `Framework Preset`, choose `Other`. In the `Environment Variables` section, add an entry where `NAME` is `MONGO_SRV` and `VALUE` is your [MongoDB secret](#mongodb-atlas-setup).

5. Click `Deploy` and you will get a link like `https://fritter-starter-abcd.vercel.app/` where you can access your site.

Vercel will automatically deploy the latest version of your code whenever a push is made to the `main` branch.

## Adding new concepts to Fritter

### Backend

The data that Fritter stores is divided into modular collections called "resources". The starter code has only two resources, "freets" and "users". The codebase has the following:

- A model file for each resource (e.g. `freet/model.ts`). This defines the resource's datatype, which defines the resource's backend type, and should be a distilled form of the information this resource holds (as in ADTs). This also defines its schema, which tells MongoDB how to store our resource, and should match with the datatype.
- A collection file for each resource (e.g. `freet/collection.ts`). This defines operations Fritter might want to perform on the resource. Each operation works on the entire database table (represented by e.g. `FreetModel`), so you would operate on one Freet by using `FreetModel.findOne()`.
- Routes file (e.g. `freet/router.ts`). This contains the Fritter backend's REST API routes for freets resource, and interact with the resource collection. All the routes in the file are automatically prefixed by e.g. `/api/freets`.
- Middleware file (e.g `freet/middleware.ts`). This contains methods that validate the state of the resource before performing logic for a given API route. For instance `isFreetExists` in `freet/middleware.ts` ensures that a freet with given `freetId` exists in the database

To add a resource or edit functionality of an existing resource:

- Create/modify files in the four above categories, making sure you have one model file, one collection one router file, and one middleware file per resource.
  - It helps to go in the order that they're listed above, starting with the resource's datatype.
- In `freet/utils.ts` and `user/utils.ts` there are type definitions for frontend representations of resources, and functions to convert from a backend resource type. Create/modify these as necessary.
  - An example: the frontend type definition for User lacks a `password` property, because the frontend should never be receiving users' passwords.

### Frontend

For this assignment, we provide an extremely basic frontend for users to interact with the backend. Each box (html form) represents exactly one API route, with a textbox for each parameter that the route takes.

To add a new route to the frontend, two components need to be added: a form in `public/index.html` and a corresponding event handler in `public/scripts/index.js`. The form will allow the user to input any necessary fields for the route, and the event handler will take the values of these fields and make an API call to your backend.

For example, the form for the user creation route looks like:

```
<form id="create-user">
    <h3>Create User</h3>
    <div>
        <label for="username">Username:</label>
        <input id="username" name="username">
    </div>
    <div>
        <label for="password">Password:</label>
        <input id="password" name="password">
    </div>
    <input type="submit" value="Create User">
</form>
```

In `public/scripts/user.js`, there is an event handler for this form (event handlers are separated in files by concept, currently `user.js` and `freet.js`), which makes a POST request to the backend:

```
function createUser(fields) {
  fetch('/api/users', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}
```

Here, `fields` is a `JSON` object which contains key/value pairs, where the key is the name associated with the input field in the form and the value is whatever is entered on the frontend. For instance, in the `form` above, the first input field has name, `username`, which will be a key in `fields` object whose value is whatever has been entered as the username on the frontend. Thus, whatever name you attach to any input field is the same name you will can use to access the value entered in that input field from `fields` object.

To link the form and event handler together, there is an entry in the `formsAndHandlers` object (the key is the `id` attribute of the `<form>` tag and the value is the event handler function) in `public/scripts/index.js`:

```
const formsAndHandlers = {
  'create-user': createUser,
  ...
};
```

## MongoDB

MongoDB is how you will be storing the data of your application. It is essentially a document database that stores data as JSON-like objects that have dynamic schema. You can see the current starter code schema in `freet/model.ts` and `user/model.ts`.

### Mongoose

You will be using Mongoose, a Node.js-Object Data Modeling (ORM) library for MongoDB. This is a NoSQL database, so you aren't constrained to a rigid data model, meaning you can add/remove fields as needed. The application connects to the MongoDB database using Mongoose in `index.ts`, where you see `mongoose.connects(...)`. After it connects, you will be able to make [mongoose queries](https://mongoosejs.com/docs/queries.html) such as `FindOne` or `deleteMany`.

### Schemas

In this starter code, we have provided `user` and `freet` collections. Each collection has defined schemas in `*/model.ts`. Once you defined a `Schema`, you must create a `Model` object out of the schema. The instances of your model are what we call "documents", which is what is stored in collections. Each schema maps to a MongoDB collection and defines the shape and structure of documents in that collection, such as what fields the document has. When a schema is defined, documents in the collection _must_ follow the schema structure. You can read more about documents [here](https://mongoosejs.com/docs/documents.html).

To create a new Schema, you first need to define an interface which represents the type definition. You can then create a new `Schema` object by declaring `const ExampleSchema = new Schema<Example>(...)` where `Example` is the type definition on the backend. Then, you can create a model like `const ExampleModel = model<Example>("Example", ExampleSchema)`. You can see a more detailed schema in the `model.ts` files mentioned above.

#### Validation

Mongoose allows you to use schema validation if you want to ensure that certain fields exist. For example, if you look at `freet/model.ts`, you will find fields like

```
  content: {
    type: String,
    required: true
  }
```

within the schema. This tells us that the `content` field must have type `String`, and that it is required for documents in that collection. A freet must have a `String` type value for the `content` field to be added to the freets collection. -->

## API routes

The following api routes will be implemented:

#### `GET /` - Render the `index.html` file that will be used to interact with the backend

#### `POST /api/users` - Create a new user account

**Body**

- `username` _{string}_ - the user's username
- `password` _{string}_ - the user's password

**Returns**

- A success message
- An object with the created user's details (without password)

**Throws**

- `400` if `username` or `password` is in the wrong format
- `403` if there is a user already logged in
- `409` if `username` is already in use

#### `PUT /api/users` - Update the user's profile

**Body** _(no need to add fields that are not being changed)_

- `displayName` _{string}_ - the user's new display name
- `password` _{string}_ - the user's new password

**Returns**

- A success message
- An object with the updated user details (without password)

**Throws**

- `400` if `username` or `password` is in the wrong format
- `403` if the user is not logged in
- `409` if the `username` is already in use

#### `DELETE /api/users` - Delete user

**Returns**

- A success message

**Throws**

- `403` if the user is not logged in

#### `GET /api/rrpicture` - See current profile picture of the user

**Returns**

- The user's current profile picture

**Throws**

- `403` if the user is not logged in
- `404` if `username` cannot be found

#### `GET /api/rrpicture/:username` - See current profile picture for the specified user

**Returns**

- The current profile picture of `username`

**Throws**

- `404` if `username` cannot be found

#### `POST /api/rrpicture` - Set a new current profile picture for the user

**Body**

- `picture` _{image}_ - the desired new profile picture
- `maintainPrevious` _{boolean}_ - whether to store the current profile picture in the list of maintained previous profile pictures (ignored if the current profile picture is `None`)

**Returns**

- A success message
- The user's new profile picture

**Throws**

- `400` if `picture` is in the wrong format
- `403` if the user is not logged in

#### `DELETE /api/rrpicture` - Delete the current profile picture of the user

**Returns**

- A success message

**Throws**

- `403` if the user is not logged

#### `GET /api/rrpicture/previous` - Get the user's list of maintained previous profile pictures

**Returns**

- The user's list of maintained previous profile pictures

**Throws**

- `403` if the user is not logged in

#### `POST /api/rrpicture/previous` - Add a picture to the user's list of maintained previous profile pictures

**Body**

- `picture` _{image}_ - picture to add to the list of previous maintained pictures

**Returns**

- A success message
- The user's updated list of maintained previous profile pictures

**Throws**

- `400` if `picture` is in the wrong format
- `403` if the user is not logged in

#### `DELETE /api/rrpicture/previous/:pictureIndex` - Remove the picture from the user's list of maintained previous profile pictures

**Returns**

- A success message
- The user's updated list of maintained previous profile pictures

**Throws**

- `400` if `pictureIndex` is outside of the indicies of the list of maintained previous profile pictures
- `403` if the user is not logged in

#### `POST /api/users/session` - Sign in user

**Body**

- `username` _{string}_ - The user's username
- `password` _{string}_ - The user's password

**Returns**

- A success message
- An object with user's details (without password)

**Throws**

- `400` if `username` or `password` is not in correct format or missing in the req
- `401` if the user login credentials are invalid
- `403` if the user is already logged in

#### `DELETE /api/users/session` - Sign out user

**Returns**

- A success message

**Throws**

- `403` if user is not logged in

#### `GET /api/follow/followers` - View the list of who the user's followers are

**Returns**

- The list of followers

**Throws**

- `403` if the user is not logged in

#### `GET /api/follow/following` - View the list of who the user is following

**Returns**

- The list that the user follows

**Throws**

- `403` if the user is not logged in

#### `POST /api/follow` - Let the user follow another user

**Body**

- `followee` _{string}_ - the user to follow

**Returns**

- A success message
- The new follow object

**Throws**

- `400` if the `followee` is empty
- `403` if the user is not logged in
- `404` if the `followee` cannot be found
- `409` if the user is already following `followee` or the user is `followee`

#### `DELETE /api/follow/:followee` - Let the user unfollow another user

**Returns**

- A success message

**Throws**

- `403` if the user is not logged in
- `404` if `followee` cannot be found
- `409` if the user was not following `followee` or the user is `followee`

#### `GET /api/groups` - Get the user's view groups

**Returns**

- List of group objects

**Throws**

- `403` if the user is not logged in

#### `GET /api/groups/:name` - Get the details of the view group

**Returns**

- The group object

**Throws**

- `403` if the user is not logged in
- `404` if the `name` cannot be found

#### `POST /api/groups` - Make a new view group that views the user

**Body**

- `name` _{string}_ - a name for the group

**Returns**

- A success message
- The new group object

**Throws**

- `400` if `name` is not in correct format or missing in the req
- `403` if the user is not logged in
- `409` if the user already has a group named `name`

#### `PUT /api/groups/:name` - Update the view group with a new member

**Body**

- `username` - the username of the member to add to the group

**Returns**

- A success message
- The updated viewGroup object

**Throws**

- `400` if `username` is not in correct format or missing in the req
- `403` if the user is not logged in
- `404` if the group `name` cannot be found for the user or `username` cannot be found
- `409` if the group `name` already contains `username`

#### `DELETE /api/groups/:name/:username` - Delete the member from the view group

**Returns**

- A success message
- The updated viewGroup object

**Throws**

- `400` if `username` is not in correct format or missing in the req
- `403` if the user is not logged in
- `404` if the group `name` cannot be found for the user or `username` cannot be found
- `409` if the group `name` did not contain `username`

#### `DELETE /api/groups/:name` - Delete the view group

**Returns**

- A success message

**Throws**

- `403` if the user is not logged in
- `404` if the group `name` cannot be found

#### `GET /api/freets/:freetId` - View the freet

**Returns**

- The freet object

**Throws**

- `404` if `freetId` cannot be found or the user is not a member of the audience of the freet

#### `POST /api/freets` - Create a new freet

**Body**

- `content` _{string}_ - The content of the freet
- `response-to` _{freetId, None}_ - The freet to which the current freet responds
- `audience` _{group, None}_ - The audience to which the freet is addressed (and would see the freet)

**Returns**

- A success message
- The new freet object

**Throws**

- `400` if the `content`, `response-to`, or `audience` is not in the correct format
- `403` if the user is not logged in
- `404` if the `response-to` or any of the `audience` cannot be found

<!-- #### `GET /api/freets` - Get all the freets

**Returns**

- An array of all freets sorted in descending order by date modified

#### `GET /api/freets?freeter=USERNAME` - Get freets by freeter

**Returns**

- An array of freets created by user with username `freeter`

**Throws**

- `400` if `freeter` is not given
- `404` if `freeter` is not a recognized username of any user

#### `DELETE /api/freets/:freetId?` - Delete an existing freet

**Returns**

- A success message

**Throws**

- `403` if the user is not logged in
- `403` if the user is not the author of the freet
- `404` if the freetId is invalid

#### `PUT /api/freets/:freetId?` - Update an existing freet

**Body**

- `content` _{string}_ - The new content of the freet

**Returns**

- A success message
- An object with the updated freet

**Throws**

- `403` if the user is not logged in
- `404` if the freetId is invalid
- `403` if the user is not the author of the freet
- `400` if the new freet content is empty or a stream of empty spaces
- `413` if the new freet content is more than 140 characters long -->

#### `GET /api/filter?expression=EXPRESSION` - Get the freets that match the filter expression

**Returns**

- List of objects that the user has rights to view that match the expression, in descending order by date posted

**Throws**

- `404` if the `expression` is invalid

#### `GET /api/feed` - Get the list of tabs for the user

**Returns**

- List of tab objects, including only the default "all" tab if the user is not logged in
