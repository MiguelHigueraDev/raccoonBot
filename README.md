# RaccoonBot-ts

A multi-purpose discord bot written using TypeScript + [Sapphire Framework](https://www.sapphirejs.dev/) + [Prisma](https://github.com/prisma/prisma).

Still a WIP, it is a rewrite in progress of the [original raccoonBot](https://github.com/MiguelHigueraDev/raccoonBot).

## Features

- Modules: A module system that lets server administrators enable or disable certain features of the bot to their liking.
- Settings (server settings): Similar to the module system, it allows server administrators to change certain settings of the bot in that specific server (like a main channel).
- (User) Preferences: Similar to modules, it allows *users* to enable or disable certain features of the bot, for that specific server that they run the command in.
- Games: Play a game of trivia, take a MBTI personality test. (more games in the works)
- Shuffle commands: Shuffle a list, get a random item from it, or shuffle a group of people into two teams.
- And more!

The first three features are highly extensible and use a database to store metadata related to them, updating dynamically based on the data entered.

More features still being worked on.

## Installation
**NodeJS 18.x or newer is required. A database that's supported by Prisma is also required.**
- Clone the repo
- Run `npm install` to install all the dependencies
- Edit the Prisma schema file in /src/prisma/schema.prisma and your .env file to match your database configuration. More help [here](https://www.prisma.io/docs/getting-started)
- Run `npx prisma db push` to sync the schema file with your database
- Once you are done making changes, run `tsc` to compile all TypeScript to the `/src/dist` folder
- Run the bot by executing `node index.js`

## Special Thanks
- To [iSlammedMyKindle](https://github.com/iSlammedMyKindle) for being an amazing friend and one of my main motivations to do more coding, especially to learn JavaScript, and build cool things with it!
