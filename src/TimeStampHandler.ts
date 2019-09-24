import { Disposable, UriHandler, Uri } from "vscode";
import { run } from "@jxa/run";
import QTController from "./qtctrl";
import { parseTimeToSeconds } from "./utils";

export default class TimeStampHandler implements Disposable, UriHandler {
  constructor(public qtctrl: QTController) { }

  public handleUri(uri: Uri) {
    const match = uri.path.slice(1);
    this.qtctrl.setCurrentTime(parseTimeToSeconds(match));
  }
  dispose() {
    this.qtctrl.dispose();
  }
}