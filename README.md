VSCode extensions to manage npm commands. This repo is inspired by the official sample.
More commands will come.

## Commands available

* `npm init`
* `npm install`
* `npm install <pkg> --save`
* `npm install <pkg> --save-dev`
* `npm uninstall <pkg> --save`
* `npm uninstall <pkg> --save-dev`
* `npm start`
* `npm test`
* `npm publish [tag]`
* `npm deprecate <pkg>[@version] message` (experimental)
* `npm run <script>`

Not happy with the available commands ? No problem, raw command is also available. Enter any npm command you want.


## Run last executed script

You can also run the last executed script by typing `npm run last...`. Thanks to: [#4](https://github.com/fknop/vscode-npm/pull/4)

## Terminate a script

You can terminate a script with the `terminate` command. It uses the `tree-kill` module that you can find on `npm`.
It has different behaviors on Unix or Windows. 

I have only tried it for `Windows` so it would be nice to have `Unix` users feedback, thanks.

Thanks to `stkb` for his suggestion. https://github.com/fknop/vscode-npm/issues/1

## Contribute

Report a bug or a suggestion by posting an issue on the git repository (https://github.com/fknop/vscode-npm).