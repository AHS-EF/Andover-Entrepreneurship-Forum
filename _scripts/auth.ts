// https://developers.google.com/identity/sign-in/web/backend-auth
export type Applicant = {
    email: string,
    name: string
};

export namespace auth {
    
    export function verify(idToken: string): Applicant {
        const response = UrlFetchApp.fetch(endpoint(idToken));
        const responseCode = response.getResponseCode();

        if (responseCode / 100 >= 3) {
            throw `Failed to verify idToken; response code ${responseCode}: ${response}`;
        }
        const responseJSON = JSON.parse(response.getContentText());

        if (responseJSON.hd !== andoverDomain) {
            throw `This is not a valid k12.andoverma.us account`;
        }
        if (!isEmailValid(responseJSON.email)) {
            throw `This is not the email address of a current Andover High School student`;
        }

        return responseJSON as Applicant;
    }

    function endpoint(idToken: string): string {
        return `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`;
    }
    function isEmailValid(email: string): boolean {
        return /[a-z]{2,}20[0-2]{2}@k12\.andoverma\.us/.test(email);
    }

    const andoverDomain = "k12.andoverma.us";
}