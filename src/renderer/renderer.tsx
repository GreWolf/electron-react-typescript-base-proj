/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import '_public/style.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as os from 'os';
import * as fs from 'fs'

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

let dest_path = String.raw`E:\Roslesinforg\Дела\2021.08.15 - СК 63`;

type FileListProps = {}
type FileListState = { paths: string[] }

class FileList extends React.Component<FileListProps, FileListState> {
    constructor(props: Readonly<FileListProps>) {
        super(props);

        this.state = {paths: []}

        this.getFileList = this.getFileList.bind(this);
    }

    getFileList(): void{
    // getFileList(dest_path: string): void{
        this.setState({paths: fs.readdirSync(dest_path)})
    }

    render() {
        return (
            <div>
                <button onClick={this.getFileList}>Вывести список файлов</button>
                <ul>
                    {
                        this.state.paths.map(function(path){
                            return <li>{path}</li>
                        })
                    }
                </ul>
            </div>
        )
}
}

ReactDOM.render(
    <div className="app">
        <h4>Welcome to React, Electron and Typescript</h4>
        <p>Hello</p>
        <ClickButton val="777"/>
        <p>{os.hostname()}</p>
        <p>{[1, 2, 3, 4]}</p>
        <Clock/>
        <FileList/>
    </div>,
    document.getElementById('app'),
);
