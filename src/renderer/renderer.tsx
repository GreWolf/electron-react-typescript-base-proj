/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import '_public/style.css';

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
type FileListState = { files: string[], destPath: string}

class FileList extends React.Component<FileListProps, FileListState> {
    constructor(props: Readonly<FileListProps>) {
        super(props);

        this.state = {
            files: [],
            destPath: ''
        }

        this.getFileList = this.getFileList.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this);
    }

    getFileList(): void {
        // getFileList(dest_path: string): void{
        this.setState({files: fs.readdirSync(this.state.destPath)})
    }

    handleChange(event: any) {
        this.setState({destPath: event.target.value})
    }

    _handleKeyDown(event: any) {
        console.log(event)
        if (event.key === "Enter"){
            console.log("Enter")

            this.setState({destPath: event.target.value})
        }
    }

    render() {
        return (
            <div>
                <input
                    type="text"
                    onChange={this.handleChange}
                    value={this.state.destPath}
                    onKeyDown={this._handleKeyDown}
                />
                <button onClick={this.getFileList}>Вывести список файлов</button>
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
