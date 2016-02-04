
import { window as Window } from 'vscode';

import { packageExists } from './utils';
import * as Messages from './messages';
import { runCommand } from './run-command';


export function npmUninstallPackage () {

    return _uninstallPackage(false);
};

export function npmUninstallPackageDev () {
    
    return _uninstallPackage(true);
};

const _uninstallPackage = function (dev) {
    
    if (!packageExists()) {
        Messages.noPackageError();
        return;
    }
    
    Window.showInputBox({
        prompt: 'Package to uninstall',
        placeHolder: 'lodash, underscore, ...'
    })
    .then((value) => {
        
        if (!value) {
            Messages.noValue();
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
        
        const args = ['uninstall', ...packages];
        
        if (hasSaveOption) {
            runCommand(args);
        }
        else {
            const save = dev ? '--save-dev' : '--save';
            runCommand([...args, save])
        }
    });
};