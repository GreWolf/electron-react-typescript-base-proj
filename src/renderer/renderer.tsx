/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import '_public/style.css';
import * as chokidar from 'chokidar';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as fs from 'fs'
import * as path from 'path'

type FileProps = { filename: string, path: string, clickHandler: (path: string) => void }
type FileState = {}

class File extends React.Component<FileProps, FileState> {
    private clickTimeout: NodeJS.Timeout | null;

    constructor(props: Readonly<FileProps>) {
        super(props);

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {

        if (this.clickTimeout !== null) {
            console.log('double click executes')
            clearTimeout(this.clickTimeout)
            this.clickTimeout = null

            const destPath = path.join(this.props.path, this.props.filename)

            const fileInfo = this.getFileInfo(destPath)

            if (fileInfo.isDirectory) {
                console.log("isDirectory")
                this.props.clickHandler(destPath)
            }

        } else {
            console.log('single click')
            this.clickTimeout = setTimeout(() => {
                console.log('first click executes ')
                clearTimeout(this.clickTimeout!)
                this.clickTimeout = null
            }, 2000)
        }


    }

    componentWillMount() {
        this.clickTimeout = null
    }

    getFileInfo(fullPath: string) {
        let access = true

        let isDirectory = false
        let filename = this.props.filename
        let extension = null
        let size = null

        try {
            fs.lstatSync(fullPath)
        } catch (err) {
            access = false
        }

        if (access) {
            const stat: fs.Stats = fs.lstatSync(fullPath)
            isDirectory = stat.isDirectory()
            extension = null
            size = !stat.isDirectory() ? stat.size : null
        }

        return {
            filename: filename,
            isDirectory: isDirectory,
            extension: extension,
            size: size
        }

    }

    render() {

        const fileInfo = this.getFileInfo(path.join(this.props.path, this.props.filename))

        return (
            <tr onClick={() => this.handleClick()}>
                <td>{fileInfo.isDirectory}</td>
                <td>{fileInfo.filename}</td>
                <td>{fileInfo.extension}</td>
                <td>{fileInfo.size}</td>
            </tr>
        )

    }
}


type FileListProps = {}
type FileListState = { inputValue: string, path: string, watcher: chokidar.FSWatcher }

class FileList extends React.Component<FileListProps, FileListState> {

    constructor(props: Readonly<FileListProps>) {
        super(props);

        const initialPath = __dirname

        console.log(initialPath)

        this.state = {
            inputValue: '',
            path: initialPath,
            watcher: chokidar.watch(initialPath, {
                ignored: /(^|[\/\\])\../, // ignore dotfiles
                persistent: true,
                ignoreInitial: true,
                depth: 0
            }),

        }

        this.state.watcher.on('all', (eventName, path, stats) => {
            console.log('this.state.watcher.on')
            console.log(this.state.watcher.getWatched())
            this.setState({path: this.state.path})
        })

        this.state.watcher.unwatch(initialPath)

        this.handleChange = this.handleChange.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.onKeyPressed = this.onKeyPressed.bind(this);
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const inputValue: string = event.currentTarget.value

        console.log("handleChange()")
        console.log(this.state.watcher.getWatched())

        if (fs.existsSync(inputValue)) {
            if (this.state.path !== inputValue) {
                this.state.watcher.unwatch(this.state.path)
                this.state.watcher.add(inputValue)
                this.setState({inputValue: inputValue, path: inputValue})
            } else {
                this.setState({inputValue: inputValue})
            }
        } else {
            this.setState({inputValue: inputValue})
        }
    }

    onKeyPressed(e: React.KeyboardEvent<HTMLDivElement>) {
        if(e.key === "Backspace"){
            const newPath = path.dirname(this.state.path)
            this.setState({inputValue: newPath, path: newPath})
        }
    }

    clickHandler(path: string): void {
        this.setState({inputValue: path, path: path})
    }

    render() {
        console.log("render()")
        console.log(this.state.watcher.getWatched())
        const destPath = this.state.path;

        const files: string[] = fs.readdirSync(destPath);
        files.sort()

        return (
            <div onKeyDown={this.onKeyPressed} tabIndex={0}>
                <input
                    type="text"
                    onChange={this.handleChange}
                    value={this.state.inputValue}
                />

                <table>
                    <thead>
                    <tr>
                        <th>Тип</th>
                        <th>Имя</th>
                        <th>Расширение</th>
                        <th>Размер</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        files.map((file) => {
                            return <File clickHandler={this.clickHandler} key={file} filename={file} path={destPath}/>
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
