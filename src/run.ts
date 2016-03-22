import * as Path from 'path';
import * as Fs from 'fs';

import { workspace as Workspace,
         window as Window, QuickPickItem } from 'vscode';

import * as Messages from './messages';
import { runCommand } from './run-command';

export default function () {
    
    const scripts = readScripts();
    if (!scripts) {
        return;
    }
    
    const items: QuickPickItem[] = Object.keys(scripts).map((key) => {
        
        return { label: key, description: scripts[key] };
    });
    
    Window.showQuickPick(items).then((value) => {
        
        runCommand(['run', value.label]);
    });
};

const readScripts = function () {
  
    const filename = Path.join(Workspace.rootPath, 'package.json');
    try {
        const content = Fs.readFileSync(filename).toString();
        const json = JSON.parse(content);
        
        if (json.scripts) {
            return json.scripts;
        }
        
        Messages.noScriptsInfo();
        return null;
    }
    catch (ignored) {
        Messages.noPackageError();
        return null;
    }
};

