/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import '_public/style.css';
import * as chokidar from 'chokidar';

import {Game} from './app/app'

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as os from 'os';
import * as fs from 'fs'
import {SyntheticEvent} from "react";

// import * as fs from 'fs';

interface ClickButtonProps {
    val: string
}

// class ClickButton extends React.Component<ClickButtonProps> {
class ClickButton<P extends ClickButtonProps> extends React.Component<P> {

    constructor(props: Readonly<P>) {
        super(props);

        this.press = this.press.bind(this);
    }

    press(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        // console.log(this);
        console.log(e);
        // alert("Hello React!")
    }

    render() {
        return (
            <div>
                <p>props = {this.props.val}</p>
                <button onClick={this.press}>Click</button>
            </div>
        );
    }
}

type ClockProps = {};
type ClockState = { date: Date, name: string };

class Clock extends React.Component<ClockProps, ClockState> {

    timerId: NodeJS.Timeout

    constructor(props: Readonly<ClockProps>) {
        super(props);
        this.state = {date: new Date(), name: "Tom"};
        this.unmount = this.unmount.bind(this);
    }

    unmount() {
        ReactDOM.unmountComponentAtNode(document.getElementById("app")!);
    }

    componentDidMount() {
        this.timerId = setInterval(
            () => this.tick(),
            1000
        );
        console.log("componentDidMount()");
    }

    componentWillUnmount() {
        clearInterval(this.timerId);
        console.log("componentWillUnmount()");
    }

    tick() {
        this.setState({
            date: new Date()
        });
        console.log(this.state);
    }

    render() {
        return (
            <div>
                <h1>Привет, {this.state.name}</h1>
                <h2>Текущее время {this.state.date.toLocaleTimeString()}.</h2>
                <button onClick={this.unmount}>Unmount</button>
            </div>
        );
    }
}

let dest_path = String.raw`E:\2021.05.24_LPP_Comparison`;


type FileProps = {filename: string}
type FileState = {}

class File extends React.Component<FileProps, FileState> {

    render() {
        return (
            <div>
                <p>{this.props.filename}</p>
            </div>
        );
    }
}


type FileListProps = {}
type FileListState = { files: string[], inputValue: string, previousPath: string, watcher: chokidar.FSWatcher, paths: string[]}

class FileList extends React.Component<FileListProps, FileListState> {
    // watcher: undefined | chokidar.FSWatcher;

    constructor(props: Readonly<FileListProps>) {
        super(props);

        const initialPath = '.'

        this.state = {
            files: [],
            inputValue: '',
            paths: [],
            previousPath: "",
            watcher: chokidar.watch(initialPath, {
                    ignored: /(^|[\/\\])\../, // ignore dotfiles
                    persistent: true,
                    ignoreInitial: true,
                    depth: 0
                }),

        }

        this.state.watcher.on('all', (eventName, path, stats) => {
                this.showFileList()
        })

        this.state.watcher.unwatch(initialPath)

        this.showFileList = this.showFileList.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    showFileList(): void {


        return
    }


            // if (this.state.destPath !== this.state.previousPath) {
            //     this.state.watcher.unwatch(this.state.previousPath)
            //     this.state.watcher.add(destPath)
            //     this.state.previousPath = this.state.destPath
            //     this.state.files = []
            // }



        //     if (this.state.watcher) {
        //         console.log("Существует")
        //         console.log(this.state.watcher.getWatched())
        //
        //         console.log("Добавлен путь")
        //         console.log(this.state.watcher.getWatched())
        //     }
        //
        //     this.state.watcher!.on('all', (eventName, path, stats) => {
        //         this.setState({files: fs.readdirSync(destPath)})
        //
        //     })
        //
        // }

    // }

    handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const inputValue: string = event.currentTarget.value
        this.setState({inputValue: inputValue})

        this.showFileList()


        if (fs.existsSync(inputValue)) {
            if (this.state.inputValue !== this.state.previousPath) {

                this.state.watcher.unwatch(this.state.previousPath)
                this.state.watcher.add(inputValue)
                this.setState({files: fs.readdirSync(inputValue)})
            }
        }
    }
    //
    // _handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void  {
    //
    //     if (event.key === "Enter"){
    //         this.setState({inputValue: event.currentTarget.value})
    //     }
    // }

    render() {
        const destPath = this.state.inputValue;

        return (
            <div>
                <input
                    type="text"
                    onChange={this.handleChange}
                    value={this.state.inputValue}
                    // onKeyDown={this._handleKeyDown}
                />
                <ul>
                    {
                        this.state.files.map(function (file) {
                            return <li key={file}><File filename={file}/></li>
                        })
                    }
                </ul>
            </div>
        )

    }
}

ReactDOM.render(
    <FileList />,
    document.getElementById('root'),
);
