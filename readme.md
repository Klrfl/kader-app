# buku biru paper generator

this Astro SSR app generates an html page that contains images laid out in a grid that you can print and cut right away.

All images are placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

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

to run the app, use

```sh
pnpm dev
```

then open localhost:4321.

Use the `database.sqlite` file as a base.
