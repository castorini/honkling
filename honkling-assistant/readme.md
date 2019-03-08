# Honkling-assistant

[Honkling-assistant](https://github.com/castorini/honkling/tree/master/honkling-assistant) is an customizable voice-enabled virtual assistants implemented with [Honkling-node](https://github.com/castorini/honkling/tree/master/honkling-node) and [Electron](https://electronjs.org/).

## Installation

1. First, make sure [Honkling-node](https://github.com/castorini/honkling/tree/master/honkling-node#installation) is ready

2. Link honkling-node to honkling-assistant

&nbsp;&nbsp;&nbsp;&nbsp;`npm link ../honkling-node`

3. Install necessary node packages

&nbsp;&nbsp;&nbsp;&nbsp;`npm install`

4. Start up honkling-assistant!

&nbsp;&nbsp;&nbsp;&nbsp;`npm start`

## Usage

### Keyboard Inputs

* <kbd>control + shift + space</kbd><br> - Open honkling-assistant

* <kbd>esc</kbd><br> -  Exit

### Voice Commands

* `volume` [ `up` / `down` ] - control volume

* `list` [ `documents` / `workspace` / `documents` / `home` ] - list directory

  Use `up` / `right` / `left` / `1` ~ `5` to navigate and `open` to open folder or start up application

* `top` - display system resource usage of running processors

* `memory` - display memory usage of running processors

## Built with

* [maxogden/menubar](https://github.com/maxogden/menubar)
* [muan/mojibar](https://github.com/muan/mojibar)
