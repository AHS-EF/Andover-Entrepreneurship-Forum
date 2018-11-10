import { Applicant } from "./auth";

export class Registrar {
    cache: {[email: string]: string};

    public constructor() {
        this.loadCache();
    }

    public hasSubmitted(applicant: Applicant): boolean {
        return applicant.email in this.cache;
    }

    public markSubmission(applicant: Applicant, doc: GoogleAppsScript.Document.Document) {
        this.cache[applicant.email] = doc.getUrl();
        this.saveCache();
    }

    private loadCache() {
        const json = PropertiesService.getScriptProperties().getProperty('submissions') || '[]';
        this.cache = JSON.parse(json);
    }
    private saveCache() {
        const json = JSON.stringify(this.cache);
        PropertiesService.getScriptProperties().setProperty('submissions', json);
    }
}