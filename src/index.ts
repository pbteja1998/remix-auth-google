import type { StrategyVerifyCallback } from 'remix-auth'
import type {
  OAuth2Profile,
  OAuth2StrategyVerifyParams,
} from 'remix-auth-oauth2'
import { OAuth2Strategy } from 'remix-auth-oauth2'

/**
 * @see https://developers.google.com/identity/protocols/oauth2/scopes#oauth2
 */
export type GoogleScope = 'openid' | 'email' | 'profile'

export type GoogleStrategyOptions = {
  clientID: string
  clientSecret: string
  callbackURL: string
  /**
   * @default "openid profile email"
   */
  scope?: GoogleScope[] | string
  accessType?: 'online' | 'offline'
  includeGrantedScopes?: boolean
  prompt?: 'none' | 'consent' | 'select_account'
  hd?: string
  loginHint?: string
}

export type GoogleProfile = {
  id: string
  displayName: string
  name: {
    familyName: string
    givenName: string
  }
  emails: [{ value: string }]
  photos: [{ value: string }]
  _json: {
    sub: string
    name: string
    given_name: string
    family_name: string
    picture: string
    locale: string
    email: string
    email_verified: boolean
    hd: string
  }
} & OAuth2Profile

export type GoogleExtraParams = {
  expires_in: 3920
  token_type: 'Bearer'
  scope: string
  id_token: string
} & Record<string, string | number>

export const GoogleStrategyDefaultScopes: GoogleScope[] = [
  'openid',
  'profile',
  'email',
]
export const GoogleStrategyDefaultName = 'google'
export const GoogleStrategyScopeSeperator = ' '

export class GoogleStrategy<User> extends OAuth2Strategy<
  User,
  GoogleProfile,
  GoogleExtraParams
> {
  public name = GoogleStrategyDefaultName

  private readonly scope: GoogleScope[]

  private readonly accessType: string

  private readonly prompt?: 'none' | 'consent' | 'select_account'

  private readonly includeGrantedScopes: boolean

  private readonly hd?: string

  private readonly loginHint?: string

  private readonly userInfoURL = 'https://www.googleapis.com/oauth2/v3/userinfo'

  constructor(
    {
      clientID,
      clientSecret,
      callbackURL,
      scope,
      accessType,
      includeGrantedScopes,
      prompt,
      hd,
      loginHint,
    }: GoogleStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<GoogleProfile, GoogleExtraParams>
    >
  ) {
    super(
      {
        clientID,
        clientSecret,
        callbackURL,
        authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenURL: 'https://oauth2.googleapis.com/token',
      },
      verify
    )
    this.scope = this.getScope(scope)
    this.accessType = accessType ?? 'online'
    this.includeGrantedScopes = includeGrantedScopes ?? false
    this.prompt = prompt
    this.hd = hd
    this.loginHint = loginHint
  }

  protected authorizationParams(): URLSearchParams {
    const params = new URLSearchParams({
      scope: this.scope.join(GoogleStrategyScopeSeperator),
      access_type: this.accessType,
      include_granted_scopes: String(this.includeGrantedScopes),
    })
    if (this.prompt) {
      params.set('prompt', this.prompt)
    }
    if (this.hd) {
      params.set('hd', this.hd)
    }
    if (this.loginHint) {
      params.set('login_hint', this.loginHint)
    }
    return params
  }

  protected async userProfile(accessToken: string): Promise<GoogleProfile> {
    const response = await fetch(this.userInfoURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const raw: GoogleProfile['_json'] = await response.json()
    const profile: GoogleProfile = {
      provider: 'google',
      id: raw.sub,
      displayName: raw.name,
      name: {
        familyName: raw.family_name,
        givenName: raw.given_name,
      },
      emails: [{ value: raw.email }],
      photos: [{ value: raw.picture }],
      _json: raw,
    }
    return profile
  }

  // Allow users the option to pass a scope string, or typed array
  private getScope(scope: GoogleStrategyOptions['scope']) {
    if (!scope) {
      return GoogleStrategyDefaultScopes
    } else if (typeof scope === 'string') {
      return scope.split(GoogleStrategyScopeSeperator) as GoogleScope[]
    }

    return scope
  }
}
