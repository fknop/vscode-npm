import { commands as Commands, ExtensionContext } from 'vscode';

import { outputChannel } from './output';
import * as Messages from './messages';
import { runCommand } from './run-command';

import npmRunScript from './run';
import npmInit from './init';
import { npmInstallPackage, npmInstallPackageDev, npmInstallSavedPackages } from './install';

export const activate = function (context: ExtensionContext) {

    const disposables = [
        Commands.registerCommand('npm-script.installSavedPackages', npmInstallSavedPackages),  
        Commands.registerCommand('npm-script.installPackage', npmInstallPackage),
        Commands.registerCommand('npm-script.installPackageDev', npmInstallPackageDev),
        Commands.registerCommand('npm-script.runScript', npmRunScript),
        Commands.registerCommand('npm-script.init', npmInit)    
    ];
    
	context.subscriptions.push(...disposables, outputChannel);
}

export function deactivate() {
}