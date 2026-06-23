# Frontend

Angular workspace with multiple applications:

- **admin-app** — admin panel (`projects/admin-app/`)
- **client-app** — client application (`projects/client-app/`)

## Development server

Admin app (port 4200):

```bash
npm start
# or
ng serve admin-app --port 4200
```

Client app:

```bash
npm run start:client
# or
ng serve client-app
```

## Building

```bash
npm run build          # admin-app
npm run build:client   # client-app
```

Build artifacts are stored in `dist/<project-name>/`.

## Code scaffolding

Generate components in a specific project:

```bash
ng generate component feature-name --project admin-app
ng generate component feature-name --project client-app
```

## Tests

```bash
npm test               # admin-app
npm run test:client    # client-app
```

## Additional Resources

[Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
