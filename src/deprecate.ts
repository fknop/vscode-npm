
import * as Fs from 'fs';
import * as Path from 'path';
import { window as Window, workspace as Workspace } from 'vscode';

import { packageExists } from './utils';
import * as Messages from './messages';
import { runCommand } from './run-command';


export function npmDeprecate () {
    
    if (!packageExists()) {
        Messages.noPackageError();
        return;
    }
    
    const cmd = 'deprecate';
    const options = {
        version: '',
        message: ''
    };
    
    Window.showInformationMessage('This feature is experimental... (close this to continue)').then(() => {
        
        return Window.showInputBox({
            prompt: 'Optional version (enter to deprecate all versions)',
            placeHolder: '< 0.2.3, 1.0.0, ...'
        })
    })
    .then((value) => {
        
        if (value) {
            options.version = '@'.concat(value);
        }
        
        return Window.showInputBox({
            prompt: 'Deprecation message (required)'
        });
    })
    .then((value) => {
        
        if (!value) {
            Messages.noValueError();
            return;
        }
        
        options.message = value;
        
        const path = Path.join(Workspace.rootPath, 'package.json');
        Fs.readFile(path, (err, data) => {
            
            const json = JSON.parse(data.toString());
            const name = json.name;
            
            
            const args = [cmd, name.concat(options.version), options.message]; 
            runCommand(args);
        });
        
    });
};
