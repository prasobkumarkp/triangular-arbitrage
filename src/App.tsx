import * as React from 'react';
import './App.css';
import { FxAction } from './components/FxAction';
import FxScreen from './components/FxScreen';
import { Pip } from './entities/Pip';

interface IAppState {
  currencyPairs: any[];
  pips: Pip[];
  pip: number;
  fxActionText: string;
}

class App extends React.Component<{}, IAppState> {

  private idCount: number = 0;
  public constructor(props: any) {
    super(props);

    this.state = {
      currencyPairs: [],
      fxActionText: "Evaluating...",
      pip: 0.0001,
      pips: []
    }
  }

  public render() {
    return (
      <div className="App">
        <input type="number" onChange={this.pipChanged} />
        <FxScreen currencyPairs={this.state.currencyPairs} getId={this.GenerateIdForFxScreen} pipUpdateCallback={this.updatePip} />
        <FxScreen currencyPairs={this.state.currencyPairs} getId={this.GenerateIdForFxScreen} pipUpdateCallback={this.updatePip} />
        <FxScreen currencyPairs={this.state.currencyPairs} getId={this.GenerateIdForFxScreen} pipUpdateCallback={this.updatePip} />

        <FxAction text={this.state.fxActionText} />
      </div>
    );
  }

  public componentDidMount() {
    this.InitializeCurrencyPairs();
  }

  public updatePip = (pip: Pip) => {
    this.setState((preState) => ({
      pips: (() => {
        const pips: Pip[] = preState.pips;
        const pipToUpdate: Pip | undefined = pips.find(p => p.Id === pip.Id);
        if (pipToUpdate !== undefined) {
          pipToUpdate.Value = pip.Value;
        } else {
          pips.push(pip);
        }
        return pips
      })()
    }), this.calculateFxAction)
  }

  private pipChanged = (e: any) => {
    const pip: number = e.target.value;
    this.setState(() => ({ pip: (pip * 0.0001) }));
  }

  private InitializeCurrencyPairs = async () => {
    const currencyPairs: [] = await fetch("https://restsimulator.intuhire.com/currency_pairs").then(data => data.json().then(jsonData => jsonData));
    this.setState(() => ({ currencyPairs: currencyPairs.map((data: any) => data.currency_name) }))
  }

  private GenerateIdForFxScreen = (): number => {
    this.idCount += 1;
    return this.idCount;
  }

  private calculateFxAction = () => {
    if (this.state.pips.length === 3) {
      const pips = this.state.pips;
      const valueOfPrices = (pips[0].Value / pips[1].Value) - pips[2].Value;
      console.log(valueOfPrices);
      let actionText = "";
      // (A/B)-C < -N - BUY - GREEN
      if (valueOfPrices < (this.state.pip * -1)) {
        actionText = "BUY";
      } else if (valueOfPrices > this.state.pip) {
        // (A/B)-C > N SELL - RED
        actionText = "SELL";
      } else if (this.state.pip < valueOfPrices && valueOfPrices < (this.state.pip * -1)) {
        // (A/B)-C is between N and -N NO TEXT
        actionText = "---";
      }

      if (this.state.fxActionText !== actionText) {
        this.setState(() => ({ fxActionText: actionText }))
      }
    }
  }
}


export default App;
