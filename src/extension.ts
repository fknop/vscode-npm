import * as Cp from 'child_process';
import * as Path from 'path';
import * as Fs from 'fs';

import { window as Window, 
         commands as Commands, 
         workspace as Workspace, 
         OutputChannel, ExtensionContext, ViewColumn } from 'vscode';


const outputChannel: OutputChannel = Window.createOutputChannel('npm');

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

const readScripts = function () {
  
    const filename = Path.join(Workspace.rootPath, 'package.json');
    try {
        const content = Fs.readFileSync(filename).toString();
        const json = JSON.parse(content);
        
        if (json.scripts) {
            return json.scripts;
        }
        
        Window.showInformationMessage('No scripts are defined in \'package.json\'');
        return null;
    }
    catch (ignored) {
        showNoPackage();
        return null;
    }
};

const showNoPackage = function () {
  
    Window.showErrorMessage('Cannot read \'package.json\'');  
};


const packageExists = function () {
    
    if (!Workspace.rootPath) {
        return false;
    }

    try {
        const filename = Path.join(Workspace.rootPath, 'package.json');
        const stat = Fs.statSync(filename);
        return stat && stat.isFile();
    }
    catch (ignored) {
        return false;
    }
};

const npmInit = function () {
  
    if (!Workspace.rootPath) {
        Window.showErrorMessage('No project open');
        return;
    }
  
    if (packageExists()) {
        Window.showErrorMessage('\'package.json\' already exists');
        return;
    }  
    
    const directory = Path.basename(Workspace.rootPath);
   
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
    
    Window.showInputBox({
        prompt: 'Package name',
        placeHolder: 'Package name...',
        value: directory
    })
    .then((value) => {
        
        if (value) {
            options.name = value.toLowerCase();
        }
       
        return Window.showInputBox({
            prompt: 'Version',
            placeHolder: '1.0.0',
            value: '1.0.0'
        });
    })
    .then((value) => {
        
        if (value) {
            options.version = value;
        }
        
        return Window.showInputBox({
            prompt: 'Description',
            placeHolder: 'Package description'
        });
    })
    .then((value) => {
        
        if (value) {
            options.description = value;
        }
        
        return Window.showInputBox({
            prompt: 'main (entry point)',
            value: 'index.js'
        });
    })
    .then((value) => {
        
        if (value) {
            options.main = value;
        }        
        
        return Window.showInputBox({
            prompt: 'Test script'
        });
    })
    .then((value) => {
       
        if (value) {
            options.scripts.test = value;
        }
        
        return Window.showInputBox({
            prompt: 'Author'
        });
    })
    .then((value) => {
        
        if (value) {
            options.author = value;
        }
        
        return Window.showInputBox({
            prompt: 'License',
            value: 'ISC'
        });
    })
    .then((value) => {
        
        if (value) {
            options.license = value;
        }
        
        const packageJson = JSON.stringify(options, null, 4);
        const path = Path.join(Workspace.rootPath, 'package.json');
        Fs.writeFile(path, packageJson, (err) => {
            
            if (err) {
                Window.showErrorMessage('Cannot write \'package.json\'');    
            }
            else {
                Window.showInformationMessage('\'package.json\' created successfuly');
                Workspace.openTextDocument(path).then((document) => {
                    Window.showTextDocument(document);
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
    
    Window.showQuickPick(Object.keys(scripts)).then((value) => {
        
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
    
    Window.showInputBox({
        prompt: 'Package to install',
        placeHolder: 'lodash, underscore, ...'
    })
    .then((value) => {
        
        if (!value) {
            Window.showErrorMessage('No value entered');
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
        cwd: Workspace.rootPath,
        env: process.env
    });
    
    child.on('exit', (code, signal) => {
       
        if (code === 0) {
            outputChannel.appendLine('');
            outputChannel.appendLine('--------------------')
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