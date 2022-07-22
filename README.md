# VariaMos Bug Tracker | PERN-TypeScript <img src="https://variamos.azurewebsites.net/favicon.ico" width="40px" height="40px" />

Bug tracking app made with PERN + TS

This bug tracker is a modified version of the open source one made by [amand33p](https://github.com/amand33p)

## Built using

#### Front-end

- [ReactJS](https://reactjs.org/) - Frontend framework
- [Redux w/ hooks](https://redux.js.org/) - State management library
- [Redux Toolkit](https://redux-toolkit.js.org/) - Toolset for efficient Redux development
- [Redux Thunk](https://github.com/reduxjs/redux-thunk) - Middleware which allows action creators to return a function
- [React Router](https://reactrouter.com/) - Library for general routing & navigation
- [React Hook Form](https://react-hook-form.com/) - Library for flexible & extensible forms
- [Material-UI w/ lots of CSS customisations](https://material-ui.com/) - UI library
- [Yup](https://github.com/jquense/yup) - Form validation tool
- [date-fns](https://date-fns.org/) - Library for manipulating/formatting of timestamps

#### Back-end

- [Node.js](https://nodejs.org/en/) - Runtime environment for JS
- [Express.js](https://expressjs.com/) - Node.js framework, makes process of building APIs easier & faster
- [PostgreSQL](https://www.postgresql.org/) - Opens-source SQL database to store data
- [TypeORM](https://typeorm.io/) - TS-based ORM for mostly SQL-based databases
- [JSON Web Token](https://jwt.io/) - A standard to secure/authenticate HTTP requests
- [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) - For hashing passwords
- [Crypto](https://nodejs.org/api/crypto.html) - For generating random passwords
- [Nodemailer](https://nodemailer.com/about/) - For email notifications
- [Dotenv](https://www.npmjs.com/package/dotenv) - To load environment variables from a .env file

## Features

- Authentication (login/register w/ username, password & optional email adress)
- CRUD bugs, with title, description, priority & optional file (image, gif, video)
- Email notifications (can be turned off)
- Anyone can add a bug and leave notes
- Users can create an account to receive email notifications
- Admins can add/remove other admins, delete, close, update & assign bugs
- Sort bugs by various parameters like priority, recentely closed etc.
- Filter bugs by name/title/assignments & other parameters
- CRUD notes, for guiding other members with possibility to reply
- Descriptive color indicators for bug priority & status
- Error management with descriptive messages
- Toast notifications for actions: creating projects, removing membes etc.
- Loading spinners for fetching processes
- Dark mode toggle w/ local storage save
- Proper responsive UI for all screens

## Usage

#### Env variable

Create a .env file in server directory and add the following:

```
PORT = 3005
```

#### Client

Open client/src/backendUrl.js & change "backend" variable to `"http://localhost:3005"`

Run client development server:

```
cd client
npm install
npm start
```

#### Server

Open ormconfig.js & update the local PostgreSQL credentials to match with yours.

To compile the project, go to server dir & run this command:
`npx tsc --project .\tsconfig.json`

To run the migrations, go to server dir & run this command:
`npm run typeorm migration:run`

To clear the database, go to server dir & run this command:
`npm run typeorm schema:drop`

Run backend development server:

```
cd server
npm install
npm run dev
```

#### VariaMos online
You can check the VariaMos application here: [VariaMos](https://variamos.azurewebsites.net/)
