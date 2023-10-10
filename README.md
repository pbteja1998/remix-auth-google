# GoogleStrategy

<!-- Description -->

The Google strategy is used to authenticate users against a Google account. It extends the OAuth2Strategy.

## Supported runtimes

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | ✅          |

<!-- If it doesn't support one runtime, explain here why -->

## Usage

### Create an OAuth application

Follow the steps on [the Google documentation](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred) to create a new application and get a client ID and secret.

### Create the strategy instance

```ts
// app/services/auth.server.ts
import { GoogleStrategy } from 'remix-auth-google'

let googleStrategy = new GoogleStrategy(
  {
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'https://example.com/auth/google/callback',
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    return User.findOrCreate({ email: profile.emails[0].value })
  }
)

authenticator.use(googleStrategy)
```

### Setup your routes

```tsx
// app/routes/login.tsx
export default function Login() {
  return (
    <Form action="/auth/google" method="post">
      <button>Login with Google</button>
    </Form>
  )
}
```

```tsx
// app/routes/auth/google.tsx
import { ActionArgs } from '@remix-run/node'
import { authenticator } from '~/services/auth.server'

export let loader = () => redirect('/login')

export let action = ({ request }: ActionArgs) => {
  return authenticator.authenticate('google', request)
}
```

```tsx
// app/routes/auth/google/callback.tsx
import { LoaderArgs } from '@remix-run/node'
import { authenticator } from '~/services/auth.server'

export let loader = ({ request }: LoaderArgs) => {
  return authenticator.authenticate('google', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
}
```
