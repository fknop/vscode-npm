import { ChildProcess, exec } from 'child_process';
import { workspace as Workspace, ViewColumn } from 'vscode';

import { outputChannel } from './output';

const kill = require('tree-kill');

export interface ChildCommand {
    child: ChildProcess,
    cmd: string
}

export const childs: Map<number, ChildCommand> = new Map();

export function terminate (pid) {
    
    const childCommand = childs.get(pid);
    if (childCommand.child) {
        kill(pid, 'SIGTERM');
    }
}

export function runCommand (args: string[]) {
    

    const cmd = 'npm ' + args.join(' ');
    const options = {
        cwd: Workspace.rootPath,
        env: process.env
    }
    
    const child = exec(cmd, options);
    
    childs.set(child.pid, { child: child, cmd: cmd });
    
    child.on('exit', (code, signal) => {
        
        childs.delete(child.pid);
        
        
        if (signal === 'SIGTERM') {
            outputChannel.appendLine('');
            outputChannel.appendLine('Successfuly killed process');
            outputChannel.appendLine('');
            outputChannel.appendLine('--------------------')
            outputChannel.appendLine('');
        }
        
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