import * as Cp from 'child_process';
import * as Path from 'path';
import * as Fs from 'fs';

import { window, commands, workspace, OutputChannel, ExtensionContext, ViewColumn } from 'vscode';


const outputChannel: OutputChannel = window.createOutputChannel('npm');

export function activate(context: ExtensionContext) {

	const disposables = [
        commands.registerCommand('npm-script.installSavedPackages', npmInstallSavedPackages),  
        commands.registerCommand('npm-script.installPackage', npmInstallPackage),
        commands.registerCommand('npm-script.installPackageDev', npmInstallPackageDev),
        commands.registerCommand('npm-script.runScript', npmRunScript)
    ];
    
	context.subscriptions.push(...disposables);
}

const readScripts = function () {
  
    const filename = Path.join(workspace.rootPath, 'package.json');
    try {
        const content = Fs.readFileSync(filename).toString();
        const json = JSON.parse(content);
        
        if (json.scripts) {
            return json.scripts;
        }
        
        window.showInformationMessage('No scripts are defined in \'package.json\'');
        return null;
    }
    catch (ignored) {
        showNoPackage();
        return null;
    }
};

const showNoPackage = function () {
  
    window.showErrorMessage('Cannot read \'package.json\'');  
};


const packageExists = function () {
    
    if (!workspace.rootPath) {
        return false;
    }
    
    const filename = Path.join(workspace.rootPath, 'package.json');
    const stat = Fs.statSync(filename);
    return stat && stat.isFile();
};

const npmRunScript = function () {
    
    const scripts = readScripts();
    if (!scripts) {
        return;
    }
    
    window.showQuickPick(Object.keys(scripts)).then((value) => {
        
        runCommand(['run', value]);
    });
};


const npmInstallSavedPackages = function () {
    
    if (!packageExists()) {
        showNoPackage();
        return;
    }
    
    runCommand(['install']); 
};

const npmInstallPackage = function () {

    return _installPackage(false);
};

const npmInstallPackageDev = function () {
    
    return _installPackage(true);
};

const _installPackage = function (dev) {
    
    if (!packageExists()) {
        showNoPackage();
        return;
    }
    
    window.showInputBox({
        prompt: 'Package to install',
        placeHolder: 'lodash, underscore, ...'
    })
    .then(value => {
        
        const packages = value.split(' ');
        
        const hasSaveOption = packages.find((value) => {
           
           return value === '-D' ||
                  value === '--save-dev' ||
                  value === '-S' ||
                  value === '--save' ||
                  value === '-O' ||
                  value === '--save-optional' ||
                  value === '-E' ||
                  value === '--save-exact'
        });
        
        const args = ['install', ...packages];
        
        if (hasSaveOption) {
            runCommand(args);
        }
        else {
            const save = dev ? '-D' : '--save';
            runCommand([...args, save])
        }
    });
};


const runCommand = function (args) {
    
    const cmd = 'npm ' + args.join(' ');
    const child = Cp.exec(cmd, {
        cwd: workspace.rootPath,
        env: process.env
    });
    
    child.on('exit', (code, signal) => {
       
        if (code === 0) {
            outputChannel.hide();
        } 
    });
    
    outputChannel.appendLine(cmd);
    outputChannel.appendLine('...');
    
    const append = function (data) { 
        
        outputChannel.append(data);  
    };
    
    child.stderr.on('data', append);
    child.stdout.on('data', append);
    outputChannel.show(ViewColumn.Three);
};

export function deactivate() {
}