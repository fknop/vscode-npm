import * as Cp from 'child_process';
import { workspace as Workspace, ViewColumn } from 'vscode';

import { outputChannel } from './output';


export function runCommand(args) {
    
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