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
- [Cypress](https://www.cypress.io/) - Frontend testing tool framework

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
- [Multer](https://www.npmjs.com/package/multer) - For file (image/gif/video/JSON) storage
- [ReCAPTCHA](https://github.com/dozoisch/react-google-recaptcha) - Library to distinguish humans and automated access to websites
- [Node Fetch](https://www.npmjs.com/package/node-fetch) - For making API Requests

## Features

- Synchronization with Github Issues through REST API (issues, assignments, comments)
- Authentication (login/register w/ username, password & optional email adress)
- CRUD bugs, with title, description, priority, category & optional file (image, gif, video, JSON)
- Email notifications (can be turned off)
- Anyone can add a bug and leave notes
- Users can create an account to receive email notifications
- Admins can add/remove other admins, delete, close, update, assign bugs, download JSON files associated to them and link the tracker to their Github account
- ReCAPTCHA test to access the admin invite verification page
- Sort bugs by various parameters like priority, recently closed etc.
- Filter bugs by name/title/assignments & other parameters
- CRUD notes, for guiding other members with possibility to reply
- Descriptive color indicators for bug priority & status
- Error management with descriptive messages
- Toast notifications for actions: creating projects, removing membes etc.
- Loading spinners for fetching processes
- Dark mode toggle w/ local storage save
- Proper responsive UI for all screens

## Usage
#### VariaMos deployment
If you are a VariaMos developer you'll want to read the [AdminREADME](https://github.com/SamNzo/Bug-tracker-VariaMos/blob/master/AdminsREADME.md) file.

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

#### Docker <img src="https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png" width="40px" heigth="40px">
If you need to use [Docker](https://www.docker.com/), do the following:

To build the container, run this command in the root directory:
`docker-compose build`

To run it, run this command:
`docker-compose up`

## Documentation
You can find more documentation on the [wiki](https://github.com/SamNzo/Bug-tracker-VariaMos/wiki).

#### VariaMos online
Here you can check the VariaMos [application](https://variamos.azurewebsites.net/) and [website](https://variamos.com/home/).
