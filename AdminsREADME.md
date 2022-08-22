# Informations for VariaMos team
This file is intended for VariaMos developers.

## Database
As explained in the README file you have to change the parameters in `ormconfig.js` to connect to the VariaMos database.

## Google reCAPTCHA
If the reCAPTCHA does not work, a new key should be generated [here](https://www.google.com/recaptcha/admin/create).

You will have to change the `GoogleReCaptchaKey` variable in `client/src/utils/variables` with the secret key and 
the `siteKey` variable in `client/src/pages/Auth/InviteVerificationPage.tsx` with the site key.

## Github REST API
In order to use the Github REST API to synchronize the Bug Tracker with Github Issues a **personal access token** is required.

It should be created by the owner of the VariaMos github repository.

To create it go to **Settings > Developer settings > Personnal access token** and select the scope **repo** (more info [here](https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-token)).

Then change the `GithubPersonnalToken`, `GithubRepo` and `GithubUser` variables in `server/src/utils/variables` to respectively match the newly created token and the names of the VariaMos repository and its owner.

*Note: The token is deleted if it is pushed to github (for security)*

