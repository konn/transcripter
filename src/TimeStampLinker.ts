import { DocumentLinkProvider, TextDocument, CancellationToken, ProviderResult, DocumentLink, Range, Uri, env } from "vscode";

export default class TimeStampLinker implements DocumentLinkProvider {
  constructor() { }

  public async provideDocumentLinks(
    document: TextDocument
  ): Promise<DocumentLink[]> {
    const regex = /\[(((\d+:)?\d+:)\d+(\.\d*)?)\]/g;
    const text = document.getText();
    if (text.length === 0) {
      return [];
    }
    const iter: Iterable<DocumentLink> = {
      [Symbol.iterator]: function* () {
        let match = null;
        do {
          match = regex.exec(text);
          if (match) {
            const start = document.positionAt(match.index + 1);
            const end = document.positionAt(match.index + 1 + match[1].length);
            const ran = new Range(start, end);
            let target = Uri.parse(`${env.uriScheme}://mr-konn.transcripter/${match[1]}`);
            const link = new DocumentLink(ran, target);
            yield link;
          }
        } while (match);
      }
    };
    return Promise.all(iter);
  }
}