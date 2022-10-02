# Informations for VariaMos team
This file is intended for VariaMos developers.

## Database
The app is currently connected to the VariaMos database.
If you want to change it, change the parameters in `ormconfig.js`.

## Google reCAPTCHA
If the reCAPTCHA does not work, a new key should be generated [here](https://www.google.com/recaptcha/admin/create) (version 2).

You will have to change the `GoogleReCaptchaKey` variable in `client/src/utils/variables` with the secret key and 
the `siteKey` variable in `client/src/pages/Auth/InviteVerificationPage.tsx` with the site key.

## Github REST API
In order to use the Github REST API to synchronize the Bug Tracker with Github Issues a **personal access token** is required.

It should be created by the owner of the VariaMos github repository.

To create it go to **Settings > Developer settings > Personnal access token** and select the scope **repo** (more info [here](https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-token)).

Then change the `GithubPersonnalToken`, `GithubRepo` and `GithubUser` variables in `server/src/utils/variables` to respectively match the newly created token and the names of the VariaMos repository and its owner.

```
// Credentials to use the Github Rest API
// To interact with Github Issues
const GithubUser = 'put variamos repository owner's username here';
const GithubRepo = 'put variamos repository name here';
const GithubPersonnalToken = 'put personal access token here';
```

*Note: The token is deleted if it is pushed to github (for security)*

## Grant admin privilege
The first admin has to be added by hand by setting the **isAdmin** field to **true** in the database.
Once one admin is added he can add others via the app.

**Note: In the table *users* do not change the row of the user named 'user'**

## URL
Once the app is deployed you have to change the `backendUrl` variable in `client/src/backendUrl.ts` with the new url.

Finally, replace *http://locahost:3000* with the new URL in `server/src/controllers/users/inviteAdmin` line 202.

