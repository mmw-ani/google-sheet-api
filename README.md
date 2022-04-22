## SETUP

-   Create a creds.json file in root folder having google client credentials

```
Eg - creds.json
{
	"web": {
		"client_id": "client id",
		"project_id": "project id",
		"auth_uri": "https://accounts.google.com/o/oauth2/auth",
		"token_uri": "https://oauth2.googleapis.com/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		"client_secret": "client secret code",
		"redirect_uris": ["http://localhost:3001/login"]
	}
}

```

-   Create a .env file with following value

```
	JWT_TOKEN_SECRET = 'Some JWT token secret key.'
```

-   Install the packages by doing `npm install`

-   Start the server by `npm start`
