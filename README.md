# Recurly Metafield Shopify

This App can get the hostedLoginToken from each active membership from recurly and pass it as a metafield to their shopify customer as a metafield.

Is made with NodeJS EJS templates.

You can see this alive, [Click here](https://recurly-metafield-shopify.herokuapp.com/).

## Getting Started

Click in the download button and get the .zip file. Extract the contents of the zip file.

Or can clone this repository, just copy the git url and open your terminal and run git clone + repository url:

```
git clone git@github.com:ejgdev/recurly-metafield-shopify.git
```

### Prerequisites

It is necessary to have installed a package manager like npm or yarn.

- [NodeJS website](https://nodejs.org/).
- [Yarn website](https://yarnpkg.com/).

### Enviroment Keys configuration
```
API_KEY=
API_PASS=
SHOP_URL=
API_URL=
RECURLY_API=
PORT=
INTERNAL_KEY=
```

#### App  configuration
Only left two more configuration.
- one of them is the `PORT`, you can use your own port or by default is `3000`.
- The last one is the `APP_URL`, you can use your own url website or `http://localhost:3000/`.

You can see the `.env.example` file for references.

### Installing

For install this repository, just need to run this command:

```
yarn install
```

### Start the Project
When everything is setup, you can run the project with this command:

```
yarn start
```
Then open http://localhost:3000/ to see your app. By default run on port 3000.

## Deployment

There are different way to Deployment.

If you want use Heroku, you can follow this [article](https://devcenter.heroku.com/articles/git).

When your heroku app is created, just need deploy with this command:

```
git push heroku master
```

### Links
[Demo App](https://recurly-metafield-shopify.herokuapp.com/)

[GitHub](https://github.com/ejgdev/recurly-metafield-shopify)
