import { commands as Commands, ExtensionContext } from 'vscode';

import { outputChannel } from './output';
import * as Messages from './messages';
import { runCommand } from './run-command';

import npmRunScript from './run';
import npmInit from './init';
import { npmInstallPackage, npmInstallPackageDev, npmInstallSavedPackages } from './install';
import { npmUninstallPackage, npmUninstallPackageDev } from './uninstall';
import { npmPublish } from './publish';
import { npmDeprecate } from './deprecate';
import { npmRawCommand } from './raw';
import npmTerminate from './terminate';

export const activate = function (context: ExtensionContext) {

    const disposables = [
        Commands.registerCommand('npm-script.installSavedPackages', npmInstallSavedPackages),  
        Commands.registerCommand('npm-script.installPackage', npmInstallPackage),
        Commands.registerCommand('npm-script.installPackageDev', npmInstallPackageDev),
        Commands.registerCommand('npm-script.runScript', npmRunScript),
        Commands.registerCommand('npm-script.init', npmInit),
        Commands.registerCommand('npm-script.uninstallPackage', npmUninstallPackage),
        Commands.registerCommand('npm-script.uninstallPackageDev', npmUninstallPackageDev),
        Commands.registerCommand('npm-script.publish', npmPublish),
        Commands.registerCommand('npm-script.deprecate', npmDeprecate),
        Commands.registerCommand('npm-script.raw', npmRawCommand),
        Commands.registerCommand('npm-script.terminate', npmTerminate)
    ];
    
	context.subscriptions.push(...disposables, outputChannel);
}

export function deactivate() {
}