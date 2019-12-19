# This is a work in progress

The project was initially meant to simply be a Discord bot with simple functions.\
I quickly realized I wanted to add functions to it which aren't strictly Discord-related.\
For that reason, I've decided to release this and push out my progress as I go along with syncing it up with my website and/or an Electron app I am creating as a side project.

## Features

Extremely limited, but gives a good baseline for addition of features by others.
- Commands (!run, !inv)
- Simple logging
- node-ipc base setup
  


## Usage

- Open your preferred command line in the folder where you'd like the project placed in.
- Clone the repo using `git clone https://github.com/Heijos/KatBot`.
- Run `npm i` in the root folder of the project
- Add a `.env` file in the root folder, adding necessary variables into the file in following fashion:
  ```
  BOT_TOKEN=PlaceYourDiscordBotTokenHereWithNoEncapsulation
  NEXT_VARIABLE=ShouldGoHereLikeThis
  ```
- Finally, run `npm start`, and the bot should be running.

