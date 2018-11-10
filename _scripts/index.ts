import { auth, Applicant } from './auth';
import { Registrar } from './registrar';

type HttpEvent = {
    queryString: string;
    parameter: {[key: string]: string},
    postData: {
        length: number,
        type: string,
        contents: string,
        name: "postData"
    }
};

export function doPost(evt: HttpEvent) {
    try {
        validateRequest(evt);
        
        const applicant = auth.verify(evt.parameter.id_token);
        const registrar = new Registrar();

        if (registrar.hasSubmitted(applicant))
            return errorHtml(`${applicant.name} has already submitted`);
        
        const doc = createDocFor(applicant, evt.parameter.text);
        registrar.markSubmission(applicant, doc);

        return successHtml(applicant);
    } catch (e) {
        return errorHtml(e);
    }
}

function errorHtml(error: string): GoogleAppsScript.HTML.HtmlOutput {
    const output = HtmlService.createTemplateFromFile('error.html');
    output.error = error;
    return output.evaluate();
}

function successHtml(applicant: Applicant): GoogleAppsScript.HTML.HtmlOutput {
    const output = HtmlService.createTemplateFromFile('success.html');
    output.name = applicant.name;
    return output.evaluate();
}

function createDocFor(applicant: Applicant, text: string): GoogleAppsScript.Document.Document {
    const folder = DriveApp.getFolderById('1tvbuEo0hOmM5ej3Seo4dELmPm1OFe33c');
    const doc = DocumentApp.create(applicant.name);
    doc.addHeader().appendParagraph(applicant.email);
    doc.addFooter().appendParagraph(`Submitted at ${new Date()}`);
    const docBody = doc.getBody();

    docBody.appendParagraph(`${applicant.name}'s submission`).setHeading(
        DocumentApp.ParagraphHeading.TITLE
    );
    docBody.appendParagraph(text);


    folder.addFile(DriveApp.getFileById(doc.getId()));
    doc.saveAndClose();

    return doc;
}

function validateRequest(evt: HttpEvent): void {
    for (let reqParam of ['id_token', 'text'])
        if (!(reqParam in evt.parameter) ||
                evt.parameter[reqParam].trim().length === 0)
            throw `Missing parameter ${reqParam}`;
}