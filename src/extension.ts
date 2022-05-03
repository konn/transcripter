// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import QTController from './qtctrl';
import QTConfig from './qtconfig';
import { parseTimeToSeconds } from './utils';
import { sprintf } from 'sprintf-js';
import TimeStampHandler from './TimeStampHandler';
import TimeStampLinker from './TimeStampLinker';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mr-konn.transcripter.commands.activate",
      async () => {
        const path = await vscode.window.showOpenDialog({
          canSelectMany: false,
          filters: {
            MPEG: ["mp4", "m4a", "m4v", "mp3"],
            MOVIE: ["mov"]
          }
        });

        const config: QTConfig | undefined
          = vscode.workspace.getConfiguration("mr-konn.transcripter").get("config");

        const editor = vscode.window.activeTextEditor;

        if (editor && path && path[0] && config) {
          const doc = editor.document;
          const disps: vscode.Disposable[] = [];
          console.log('Congratulations, your extension "transcripter" is now active!');

          const ctrl = new QTController(path[0].path, config);
          const hndler = new TimeStampHandler(ctrl);
          disps.push(hndler);
          vscode.window.registerUriHandler(hndler);
          vscode.languages.registerDocumentLinkProvider(
            doc.uri,
            new TimeStampLinker()
          );
          disps.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.togglePlay",
              ctrl.togglePlay,
              ctrl
            )
          );
          disps.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.backwards",
              ctrl.backwardSeconds,
              ctrl
            )
          );
          disps.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.forwards",
              ctrl.forwardSeconds,
              ctrl
            )
          );
          disps.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.forwardsBy",
              async () => {
                const playing = await ctrl.playing();
                await ctrl.forceStop();
                const secs = await vscode.window.showInputBox({
                  placeHolder: "Seconds to forward",
                  value: String(config.defaultForwardSeconds)
                });
                await ctrl.forwardSeconds(Number(secs));
                if (playing) { ctrl.forcePlay(); }
              },
              ctrl
            )
          );
          disps.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.backwardsBy",
              async () => {
                const playing = await ctrl.playing();
                try {
                  await ctrl.forceStop();
                  const secs = await vscode.window.showInputBox({
                    placeHolder: "Seconds to Rewind",
                    value: String(config.defaultForwardSeconds)
                  });
                  if (secs) {
                    await ctrl.backwardSeconds(parseTimeToSeconds(secs));
                  }
                } finally {
                  if (playing) { await ctrl.forcePlay(); }
                }
              },
              ctrl
            )
          );
          disps.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.jump",
              async () => {
                const resl = await vscode.window.showInputBox({
                  prompt: "Input the timestamp",
                  validateInput: (input) => {
                    if (input.match(/^((\d+:)?\d+:)?\d+(\.\d*)?$/)) {
                      return null;
                    } else {
                      return "Input must be of form [[HH:]MM:]SS";
                    }
                  }
                });
                if (resl) {
                  ctrl.setCurrentTime(parseTimeToSeconds(resl));
                }
              },
              ctrl
            )
          );
          disps.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.faster",
              async () => {
                ctrl.faster();
              },
              ctrl
            )
          );
          disps.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.slower",
              async () => {
                ctrl.slower();
              },
              ctrl
            )
          );
          disps.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.resetRate",
              async () => {
                ctrl.resetRate();
              },
              ctrl
            )
          );
          disps.push(
            vscode.commands.registerTextEditorCommand(
              "mr-konn.transcripter.commands.insertTimeStamp",
              async (editor) => {
                const now: number = await ctrl.currentTime();
                editor.insertSnippet(new vscode.SnippetString(
                  sprintf("[%02d:%02d:%02f]", now / 3600, (now % 3600) / 60, now % 60)
                ));
              },
              ctrl
            )
          );
          for (const d of disps) {
            context.subscriptions.push(d);
          }
        }
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
}
