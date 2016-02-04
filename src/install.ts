
import { window as Window } from 'vscode';

import { packageExists } from './utils';
import * as Messages from './messages';
import { runCommand } from './run-command';


export function npmInstallSavedPackages () {
    
    if (!packageExists()) {
        Messages.noPackageError();
        return;
    }
    
    runCommand(['install']); 
};

export function npmInstallPackage () {

    return _installPackage(false);
};

export function npmInstallPackageDev () {
    
    return _installPackage(true);
};

const _installPackage = function (dev) {
    
    if (!packageExists()) {
        Messages.noPackageError();
        return;
    }
    
    Window.showInputBox({
        prompt: 'Package to install',
        placeHolder: 'lodash, underscore, ...'
    })
    .then((value) => {
        
        if (!value) {
            Messages.noValueError();
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
            const save = dev ? '--save-dev' : '--save';
            runCommand([...args, save])
        }
    });
};