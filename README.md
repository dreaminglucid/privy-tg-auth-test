# Privy Auth `create-react-app` Starter

This is a minimal template for integrating [Privy Auth](https://www.privy.io/) into a new [`create-react-app`](https://create-react-app.dev/) project. Check out the deployed app [here](https://create-react-app.privy.io/)!

## Setup:

1. Clone this repository and open it in your terminal.
```
git clone https://github.com/privy-io/create-react-app.git
```

2. Install the necessary dependencies (including [Privy Auth](https://www.npmjs.com/package/@privy-io/react-auth)) with `npm`.
```sh
npm i 
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env` file. Then, [paste your Privy App ID from the console](https://docs.privy.io/guide/console/api-keys) in `.env`.
```sh
# In your terminal, create .env from .env.example
cp .env.example .env

# Add your Privy App ID to .env
REACT_APP_PRIVY_APP_ID=<your-privy-app-id>
```

## Building locally:

In your project directory, run `npm run start`. You can now visit http://localhost:3000 to see your app and login with Privy!

## Check out:

- `src/index.js` for how to use the `PrivyProvider` and initialize it with your Privy App ID
- `src/App.js` for how to use the `usePrivy()` hook, fields like `authenticated` and `user`, and methods like `login` and `logout`
- `config-overrides.js` for how to [handle common issues with Webpack 5](https://docs.privy.io/guide/troubleshooting/webpack)

**Check out [our docs](https://docs.privy.io/) for more guidance around using Privy in your app!**

## How to expose and set domain for telegram bot:

- `/setdomain` with botfather bot on telegram
- `npm install -g localtunnel`
- `npx localtunnel --port 3000`
- or `ngrok http 3000`


## TODO:

- expose over https using ngrok or npm localtunnel 
- need privy account with telegram login activated (must rewuest access)

### Privy limitations and considerations:
- Privy is free up to 150 users. We will need a premium account to support more users.
- Privy is a fairly centralized solution, with a dashboard for managing users. We will need to consider how we handle data redundancy and how we handle data privacy.
- Privy has a smartwallet feature that uses embedded wallets. We will be able to use it in conjuntion with Redstone network. We need to consider how these features could be used in our application.
- When logging into telegram from outside of the telegram app, the user will be redirected to a browser window which asks them for their phone number. This is not ideal for our application. We will need to consider how we handle this.