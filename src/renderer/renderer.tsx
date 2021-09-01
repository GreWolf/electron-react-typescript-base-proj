/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import '_public/style.css';
import '_public/images/file.png'
import '_public/images/folder.png'

import * as chokidar from 'chokidar';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as fs from 'fs'
import * as path from 'path'
import * as child_process from 'child_process'

function getCommandLine() {
    switch (process.platform) {
        case 'darwin' :
            return 'open';
        case 'win32' :
            return 'start';
        // case 'win64' : return 'start';
        default :
            return 'xdg-open';
    }
}

function getFileInfo(fullPath: string) {
    let access = true

    let isDirectory = false
    let isFile = false
    let filename = path.basename(fullPath)
    let extension = null
    let size = null

    try {
        fs.accessSync(fullPath, fs.constants.R_OK | fs.constants.F_OK)
        fs.lstatSync(fullPath)
    } catch (err) {
        access = false
    }

    if (access) {
        const stat: fs.Stats = fs.lstatSync(fullPath)
        isDirectory = stat.isDirectory()
        isFile = stat.isFile()
        extension = isFile ? path.extname(fullPath).substring(1).toLowerCase() : null
        size = !stat.isDirectory() ? stat.size : null
    }

    return {
        filename: filename,
        isDirectory: isDirectory,
        extension: extension,
        size: size,
        isFile: isFile
    }

}

type FileProps = {
    filename: string,
    path: string,
    isSelected: boolean,
    clickHandler: (path: string) => void,
    selectHandler: (key: string) => void
}
type FileState = {}

class File extends React.Component<FileProps, FileState> {
    private clickTimeout: NodeJS.Timeout | null;

    constructor(props: Readonly<FileProps>) {
        super(props);
        this.clickTimeout = null
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {

        this.props.selectHandler(this.props.filename)

        if (this.clickTimeout !== null) {
            console.log('double click executes')
            clearTimeout(this.clickTimeout)
            this.clickTimeout = null

            const destPath = path.join(this.props.path, this.props.filename)

            const fileInfo = getFileInfo(destPath)

            if (fileInfo.isDirectory) {
                this.props.clickHandler(destPath)
            }

            if (fileInfo.isFile) {
                const command = getCommandLine() + ' "" "' + destPath + '"'
                console.log(command)
                child_process.exec(command)
            }

        } else {
            console.log('single click')
            this.clickTimeout = setTimeout(() => {
                console.log('first click executes ')
                clearTimeout(this.clickTimeout!)
                this.clickTimeout = null
            }, 500)
        }
    }

    render() {

        const fileInfo = getFileInfo(path.join(this.props.path, this.props.filename))

        return (
            <tr className={this.props.isSelected ? "selectedRow" : undefined} onClick={() => this.handleClick()}>
                <td><img className={'fileImage'}
                         src={fileInfo.isDirectory ? "./public/images/folder.png" : "./public/images/file.png"}
                         alt={"Иконка"}
                /></td>
                <td>{fileInfo.filename}</td>
                <td>{fileInfo.extension}</td>
                <td>{fileInfo.size}</td>
            </tr>
        )
    }
}

type FileListProps = {}
type FileListState = {
    inputValue: string,
    path: string,
    watcher: chokidar.FSWatcher,
    selectedItem: string
    sorting: {sortKey: string, ascending: true}
}

class FileList extends React.Component<FileListProps, FileListState> {

    private previousPath: string;

    constructor(props: Readonly<FileListProps>) {
        super(props);

        const initialPath = __dirname

        console.log(initialPath)

        this.previousPath = initialPath

        this.state = {
            inputValue: '',
            path: initialPath,
            selectedItem: "",
            watcher: chokidar.watch(initialPath, {
                ignored: /(^|[\/\\])\../, // ignore dotfiles
                persistent: true,
                ignoreInitial: true,
                depth: 0
            }),
            sorting: {sortKey: "Имя", ascending: true}

        }

        this.state.watcher.on('all', (eventName, path, stats) => {
            console.log("on")
            this.setState({path: this.state.path})
        })

        this.state.watcher.unwatch(initialPath)

        this.changeHandler = this.changeHandler.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.keyHandler = this.keyHandler.bind(this);
        this.selectHandler = this.selectHandler.bind(this);
    }

    changeHandler(event: React.ChangeEvent<HTMLInputElement>): void {
        const inputValue: string = event.currentTarget.value

        if (fs.existsSync(inputValue)) {
            if (this.state.path !== inputValue) {
                this.setState({inputValue: inputValue, path: inputValue})
            } else {
                this.setState({inputValue: inputValue})
            }
        } else {
            this.setState({inputValue: inputValue})
        }
    }

    selectHandler(filename: string) {
        this.setState({selectedItem: filename})
    }

    keyHandler(e: KeyboardEvent) {
        if (e.key === "Backspace") {
            const newPath = path.dirname(this.state.path)
            this.setState({inputValue: newPath, path: newPath})
        }
    }

    clickHandler(path: string): void {
        this.setState({inputValue: path, path: path})
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyHandler);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyHandler);
    }

    render() {
        const destPath = this.state.path;

        if (fs.existsSync(destPath)) {
            if (this.previousPath !== destPath) {
                this.state.watcher.unwatch(this.previousPath)
                this.state.watcher.add(destPath)
                this.previousPath = destPath
            }
        }

        console.log(this.state.watcher.getWatched())

        const files: string[] = fs.readdirSync(destPath);
        files.sort()

        return (
            <div>
                <input
                    type="text"
                    onChange={this.changeHandler}
                    value={this.state.inputValue}
                />

                <table>
                    <thead>
                    <tr>
                        <th>Тип</th>
                        <th>Имя</th>
                        <th>Тип</th>
                        <th>Размер</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        files.map((file) => {
                            return <File
                                clickHandler={this.clickHandler}
                                key={file}
                                filename={file}
                                path={destPath}
                                isSelected={file === this.state.selectedItem}
                                selectHandler={this.selectHandler}
                            />
                        })
                    }
                    </tbody>
                </table>
            </div>
        )
    }
}

ReactDOM.render(
    <FileList/>,
    document.getElementById('root'),
);
