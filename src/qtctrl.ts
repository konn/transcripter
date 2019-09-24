import { Application, QuickTimePlayer as qt } from "@jxa/types";
import "@jxa/global-type";
import { run } from "@jxa/run";
import QTConfig from "./qtconfig";
import { Disposable } from "vscode";

export default class QTController implements Disposable {
  windowId: number = -1;
  fps: number = 0;
  constructor(private path: string, private config: QTConfig) {
    this.openAudio();
  }

  public dispose() {
  }

  public async togglePlay() {
    run((windowId: number, fps: number, config: QTConfig) => {
      const app = Application<qt.QuickTimePlayer>("QuickTime Player");
      const theWindow = app.windows.whose({ id: windowId })[0];
      const doc: qt.QuickTimePlayer.Document = theWindow.document();
      if (doc.playing()) {
        app.stop(doc);
        app.stepBackward(doc, { by: config.resumeDelay * fps });
      } else {
        app.play(doc);
      }
    }, this.windowId, this.fps, this.config);
  }

  public async forwardSeconds(seconds: number = this.config.defaultForwardSeconds) {
    run((windowId, fps, seconds) => {
      const app = Application<qt.QuickTimePlayer>("QuickTime Player");
      const theWindow = app.windows.whose({ id: windowId })[0];
      const doc: qt.QuickTimePlayer.Document = theWindow.document();
      app.stepForward(doc, { by: fps * seconds });
    },
      this.windowId, this.fps, seconds
    );
  }

  public async backwardSeconds(seconds: number = this.config.defaultBackwardSeconds) {
    run((windowId, fps, seconds) => {
      const app = Application<qt.QuickTimePlayer>("QuickTime Player");
      const theWindow = app.windows.whose({ id: windowId })[0];
      const doc: qt.QuickTimePlayer.Document = theWindow.document();
      app.stepBackward(doc, { by: fps * seconds });
    },
      this.windowId, this.fps, seconds
    );
  }

  public async setCurrentTime(seconds: number) {
    run((windowId: number, seconds: number) => {
      const app = Application<qt.QuickTimePlayer>("QuickTime Player");
      const theWindow = app.windows.whose({ id: windowId })[0];
      const doc: qt.QuickTimePlayer.Document = theWindow.document();
      doc.currentTime.set(seconds);
    }, this.windowId, seconds);
  }

  public async openAudio() {
    const { windowId, fps } = await run((path) => {
      const app = Application<qt.QuickTimePlayer>("QuickTime Player");
      app.open(path);
      const theWindow = app.windows.whose({ "index": 1 })[0];
      const windowId = theWindow.id();
      const doc: qt.QuickTimePlayer.Document = theWindow.document();
      const t0: number = doc.currentTime();
      doc.currentTime.set(0.0);
      app.stepForward(doc, { by: 1 });
      const fps = 1.0 / doc.currentTime();
      doc.currentTime.set(t0);
      return { fps, windowId };
    }, this.path);
    this.fps = fps;
    this.windowId = windowId;
  }
}