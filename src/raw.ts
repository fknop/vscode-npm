
import { window as Window } from 'vscode';

import { packageExists } from './utils';
import * as Messages from './messages';
import { runCommand } from './run-command';


export function npmRawCommand () {
    
    if (!packageExists()) {
        Messages.noPackageError();
        return;
    }
    
    Window.showInputBox({
        prompt: 'npm command',
        placeHolder: 'install lodash@latest, ...'
    })
    .then((value) => {
        
        if (!value) {
            Messages.noValueError();
            return;
        }
        
        const args = value.split(' ');
        
        runCommand(args);
    });
};