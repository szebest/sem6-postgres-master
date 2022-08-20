# sem6-postgres-master

## Purpose of this repo
This repo contains code for the main backend. This backend handles authentication, holds slave information (seperate parking backends individual to a single parking)

### Used technologies
1. Written in NodeJS
2. Authentication using jwt's access token and refresh token approach
3. PostgreSQL database
4. Prisma ORM for database operations
5. Redis for storing information about jwt tokens
6. API based on Express.js framework

#### How to set up
1. Clone this repo
2. Localize the .env.example file
3. Create a .env file with the instructions given in the .env.example file
4. Make sure you have NodeJS installed
5. Inside the root folder type `npm i` to install the dependencies

#### Launch scripts
1. `npm run swagger` - used for generating the documentation file
2. `npm run dev` - used for local development
3. `npm run build` - used for generating the prisma client based on the prisma schema file
4. `npm run start` - used for local development but without hot reload on changes

### Deployment
1. There is a Procfile that is configured to host this project on heroku

Deployed on Heroku - [link]([(https://sem6-postgres-master.herokuapp.com/)])

Endpoint documentation [link]([https://sem6-postgres-master.herokuapp.com/docs/])

The routes in this project start with an prefix `/api/v1/`

For example to login you have to send a POST request to the following URL: https://sem6-postgres-master.herokuapp.com/api/v1/users/login
