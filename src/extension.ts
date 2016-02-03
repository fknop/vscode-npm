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
        commands.registerCommand('npm-script.runScript', npmRunScript),
        commands.registerCommand('npm-script.init', npmInit)    
    ];
    
	context.subscriptions.push(...disposables, outputChannel);
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

    try {
        const filename = Path.join(workspace.rootPath, 'package.json');
        const stat = Fs.statSync(filename);
        return stat && stat.isFile();
    }
    catch (ignored) {
        return false;
    }
};

const npmInit = function () {
  
    if (!workspace.rootPath) {
        window.showErrorMessage('No project open');
        return;
    }
  
    if (packageExists()) {
        window.showErrorMessage('\'package.json\' already exists');
        return;
    }  
    
    const directory = Path.basename(workspace.rootPath);
   
    const options = {
        name: directory,
        version: '1.0.0',
        description: '',
        main: 'index.js',
        scripts: {
            test: 'echo "Error: no test specified" && exit 1'
        },
        author: '',
        license: 'ISC'
    };
    
    window.showInputBox({
        prompt: 'Package name',
        placeHolder: 'Package name...',
        value: directory
    })
    .then((value) => {
        
        if (value) {
            options.name = value.toLowerCase();
        }
       
        return window.showInputBox({
            prompt: 'Version',
            placeHolder: '1.0.0',
            value: '1.0.0'
        });
    })
    .then((value) => {
        
        if (value) {
            options.version = value;
        }
        
        return window.showInputBox({
            prompt: 'Description',
            placeHolder: 'Package description'
        });
    })
    .then((value) => {
        
        if (value) {
            options.description = value;
        }
        
        return window.showInputBox({
            prompt: 'main (entry point)',
            value: 'index.js'
        });
    })
    .then((value) => {
        
        if (value) {
            options.main = value;
        }        
        
        return window.showInputBox({
            prompt: 'Test script'
        });
    })
    .then((value) => {
       
        if (value) {
            options.scripts.test = value;
        }
        
        return window.showInputBox({
            prompt: 'Author'
        });
    })
    .then((value) => {
        
        if (value) {
            options.author = value;
        }
        
        return window.showInputBox({
            prompt: 'License',
            value: 'ISC'
        });
    })
    .then((value) => {
        
        if (value) {
            options.license = value;
        }
        
        const packageJson = JSON.stringify(options, null, 4);
        const path = Path.join(workspace.rootPath, 'package.json');
        Fs.writeFile(path, packageJson, (err) => {
            
            if (err) {
                window.showErrorMessage('Cannot write \'package.json\'');    
            }
            else {
                window.showInformationMessage('\'package.json\' created successfuly');
                workspace.openTextDocument(path).then((document) => {
                    window.showTextDocument(document);
                });
            }
        })
    });
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
        
        if (!value) {
            window.showErrorMessage('No value entered');
            return;
        }
        
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
            outputChannel.appendLine('');
            outputChannel.appendLine('-----------------')
            outputChannel.appendLine('');
            outputChannel.hide();
        } 
    });
    
    outputChannel.appendLine(cmd);
    outputChannel.appendLine('');
    
    const append = function (data) { 
        
        outputChannel.append(data);  
    };
    
    child.stderr.on('data', append);
    child.stdout.on('data', append);
    outputChannel.show(ViewColumn.Three);
};

export function deactivate() {
}