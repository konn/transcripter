// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import QTController from './qtctrl';
import QTConfig from './qtconfig';

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

        if (path && path[0] && config) {
          // Use the console to output diagnostic information (console.log) and errors (console.error)
          // This line of code will only be executed once when your extension is activated
          console.log('Congratulations, your extension "transcripter" is now active!');

          const ctrl = new QTController(path[0].path, config);
          context.subscriptions.push(ctrl);
          context.subscriptions.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.togglePlay",
              ctrl.togglePlay,
              ctrl
            )
          );
          context.subscriptions.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.backwards",
              ctrl.backwardSeconds,
              ctrl
            )
          );
          context.subscriptions.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.forwards",
              ctrl.forwardSeconds,
              ctrl
            )
          );
          context.subscriptions.push(
            vscode.commands.registerCommand(
              "mr-konn.transcripter.commands.jump",
              ctrl.setCurrentTime,
              ctrl
            )
          );
        }
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() { }
