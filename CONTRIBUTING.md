# Working on Civic Wise

This is how code moves from your machine to civicwise.online.

```
feature branch  ->  pull request into develop  ->  CI checks  ->  merge
develop         ->  pull request into main     ->  CI checks  ->  merge  ->  automatic deploy
```

## The branches

| Branch | What it is | Who pushes to it |
|--------|------------|------------------|
| `main` | What is live on civicwise.online. Every merge here deploys. | Nobody directly. Only merged pull requests. |
| `develop` | The next release, being put together and tested. | Merged pull requests. Small fixes can be pushed directly. |
| `feature/...`, `fix/...`, `content/...` | One piece of work each. | You. Delete it after it is merged. |

## Day to day

Start from the latest `develop`:

```bash
git checkout develop
git pull
git checkout -b feature/short-name
```

Work, commit as often as you like:

```bash
git add -A
git commit -m "Add page builder gallery block"
```

Push the branch and open a pull request into `develop`:

```bash
git push -u origin feature/short-name
```

GitHub prints a link to open the pull request. CI runs on it. Fix anything red, push again, and CI re-runs. When it is green, merge it and delete the branch.

## Releasing to the live site

When `develop` has what you want live, open a pull request from `develop` into `main` and title it like `Release: page builder and news`. CI runs again. Merge it, and the Deploy workflow ships it to the server. Watch it in the Actions tab.

## If CI fails

Open the red run in the Actions tab, click the failed step, and read the last lines. Most failures are one of these:

| Step | Usual cause | Fix |
|------|-------------|-----|
| Typecheck | A TypeScript error | Run `npm run typecheck` in that folder |
| Unit tests | A test broke | Run `npm test` in that folder |
| Apply migrations | Bad SQL in a new migration | Run `npm run migrate` locally against a fresh database |
| Validate course content | A course JSON file is invalid | `npm run seed -- --check` shows which file and field |
| Route tree is committed | A new route file, but `routeTree.gen.ts` was not committed | Run `npm run build` in `client`, commit the changed file |

## If a deploy fails

The deploy script stops at the first error. If a build fails, nothing new is published and the live site keeps the previous version. Migrations run before the builds and only ever add to the database, so the old code keeps working with them. Read the failed step in the Actions tab, fix it on a branch, and release again.

To put an older version back by hand, on the server:

```bash
bash /var/www/civicwise/app/deploy/deploy.sh <commit-sha>
```

This rolls back code, not the database.

## Database changes

Never edit an old migration. Add a new file with the next number, for example `server/migrations/031_something.sql`. The migration runner wraps each file in a transaction, so do not add `begin` or `commit`.

## Commit messages

Plain, short, present tense: `Fix lesson outline on mobile`, `Add Bemba translations for module 2`.
