# buku biru paper generator

this node app generates an html page that contains images laid out in a grid, that you can export to PDF or straight up print.

### Quick start

first copy the .env.example file, name it .env. Set the respective variables:

- PORT: port to run your app, defaults to 3000
- FILE_PATH: path to your kader images.

```sh
# if you're on UNIX like systems
cp .env.example .env
```

and then install dependencies with pnpm

```sh
corepack enable # or whatever installation method you prefer
pnpm i
```

to run the app, use node

```sh
node --env-file=.env app.js
```

then open localhost:3000 or whatever port you set.

## Todo

- [x] create filter for kelompok
