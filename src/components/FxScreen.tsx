import * as React from 'react';
import { Pip } from 'src/entities/Pip';


interface IFxScreenProps {
    getId: () => number;
    currencyPairs: string[];
    pipUpdateCallback: (pip: Pip) => void;
}

interface IFxScreenState {
    id: number;
    currencyPair: string;
    pip: number[];
    error: any;
}

export default class FxScreen extends React.Component<IFxScreenProps, IFxScreenState>{

    private webSocket: WebSocket;

    public constructor(props: IFxScreenProps) {
        super(props);

        this.state = {
            currencyPair: "EURUSD",
            error: "",
            id: 0,
            pip: []
        }
    }

    public render() {
        return <div>
            <span>Select currency pair : </span>
            <select onChange={this.currencyPairSelected}>
                {this.props.currencyPairs.map((currencyPair, i) => <option key={i}>{currencyPair}</option>)}
            </select>

            <div>
                Selected currency pair : <span> {this.state.currencyPair}</span>
            </div>

            <div>
                <div>Graph</div>
                {this.state.pip}
            </div>
            <div>
                error :  {this.state.error}
            </div>
            <br />
            <hr />
        </div>
    }

    public componentDidMount() {
        const id: number = this.props.getId();
        this.setState(() => ({ id }))
        this.initializeWebSocket("EURUSD")
    }

    public componentWillUnmount() {
        this.webSocket.close();
    }

    private currencyPairSelected = (event: any) => {
        const currencyPair = event.target.value;
        this.setState(() => ({ currencyPair }),
            () => this.initializeWebSocket(this.state.currencyPair));
    }

    private initializeWebSocket = (currencyPair: string) => {

        if (this.webSocket !== undefined) {
            debugger;
            this.webSocket.close();
        }
        this.webSocket = new WebSocket("wss://stocksimulator.intuhire.com");


        this.webSocket.onopen = () => {
            this.webSocket.send(JSON.stringify({ currencyPair }));
        }

        this.webSocket.onerror = (event: MessageEvent) => {
            this.setState(() => ({ error: event }))
        }

        this.webSocket.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            this.setState((prevState) => ({
                pip: (() => {
                    const pip: number[] = prevState.pip;
                    if (pip.length > 2) {
                        pip.shift()
                    }
                    return [...pip, data]
                })()
            }));

            this.props.pipUpdateCallback({ Id: this.state.id, Value: data })
        }
    }
}