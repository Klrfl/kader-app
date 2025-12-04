# Kader App

![screenshot of kader app](./public/screenshot.png)
this Astro SSR app

- keeps track of your bonding progress
- generates a page that contains your buku biru images laid out in a grid that you can print and cut right away.

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

- DATABASE_URL: where your SQLite database file is located. Defaults to `./database.sqlite`
- UPLOAD_BASE: base to upload your kader images to. set this to whatever you want, I personally set this to `/var/www/images/`.

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

then open http://localhost:4321.

### Uploading images

After setting `UPLOAD_BASE`, you can make a symbolic link from `public/images` to `UPLOAD_BASE` so the app can serve your photos from `UPLOAD_BASE`

```sh
# if you're on UNIX like systems
# make sure to execute the following once in the root of your project
# so you can see images in dev mode
sudo ln -s /storage/public/images /public/images
```

### Build for prod

If you want to use an optimized version of the app, you can do so with the following commmands

```sh
pnpm build
chmod +x ./postbuild.sh && ./postbuild.sh # run postbuild commands
UPLOAD_BASE=your/upload/base/path node dist/server/entry.mjs # run app in production mode
```

### Database setup

For a quick start, can use the `example.sqlite` database file as a base. copy it and name it `database.sqlite`

```sh
cp example.sqlite database.sqlite
```

**Note**: this database was last exported in 2025-12-04. Most students have no groups and to prevent null values I put the default group as _ROC_, you'll have to update them manually

From this point on you can use the app as normal.

> [!info] OR if you want to start from scratch...
> first create the database file
>
> ```sh
> touch database.sqlite
> ```
>
> to migrate and seed the database, you can run the kysely CLI
>
> ```sh
> pnpm kysely migrate latest
> pnpm kysely seed run # run seeders
> ```
