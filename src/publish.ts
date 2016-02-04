
import { window as Window } from 'vscode';

import { packageExists } from './utils';
import * as Messages from './messages';
import { runCommand } from './run-command';


export function npmPublish () {
    
    _do('publish');
};

// Bad practice to unpublish a package
// export function npmUnpublish () {
  
//     _do('unpublish');
// };


const _do = function (cmd) {
    
    if (!packageExists()) {
        Messages.noPackageError();
        return;
    }
    
    Window.showInputBox({
        prompt: 'Optional tag (enter to skip tag)',
        placeHolder: 'latest, 1.0.0, ...'
    })
    .then((value) => {
        
        if (!value) {
            runCommand([cmd])
            return;
        }
        
        if (value.includes(' ')) {
            Messages.invalidTagError();
            return;
        }
        
        runCommand([cmd, '--tag', value]);
    });
};