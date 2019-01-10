import React, {Component} from "react";
import {RadioGroup, Radio} from "@blueprintjs/core";
import "./SelectorEditor.css";

class SelectorEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    const {data} = this.props;
    // Temporarily overload the options list itself as a tracker for checkboxes.
    // Note that before we ship this to the db, we strip out these isDefault booleans.
    data.options = data.options.map(o => {
      if (data.type === "single") {
        o.isDefault = o.option === data.default;
      }
      else if (data.type === "multi") {
        const defaults = data.default.split(",");
        o.isDefault = defaults.includes(o.option);
      }
      return o;
    });
    const showCustom = data.default.includes("{{");
    this.setState({data, showCustom});
  }

  addOption() {
    const {data} = this.state;
    const {variables} = this.props;
    if (!data.options) data.options = [];
    const varList = Object.keys(variables).filter(v => !v.startsWith("_") && !data.options.map(o => o.option).includes(v));
    if (varList.length > 0) {
      data.options.push({option: varList[0], allowed: "always", isDefault: false});
    }
    else {
      data.options.push({option: "", allowed: "always", isDefault: false});
    }
    this.setState({data});
  }

  chooseOption(index, e) {
    const {data} = this.state;
    data.options[index].option = e.target.value;
    this.setState({data});
  }

  chooseAllowed(index, e) {
    const {data} = this.state;
    data.options[index].allowed = e.target.value;
    this.setState({data});
  }

  chooseCustom(e) {
    const {data} = this.state;
    data.default = e.target.value;
    this.setState({data});
  }

  setDefault(option, e) {
    const {data} = this.state;
    const {checked} = e.target;
    if (data.type === "single" && checked) {
      data.options = data.options.map(o => {
        o.isDefault = o.option === option;
        return o;
      });
      data.default = option;
    }
    else if (data.type === "multi") {
      const theOption = data.options.find(o => o.option === option);
      if (theOption) theOption.isDefault = checked;
      data.default = data.options.filter(o => o.isDefault).map(o => o.option).join();
    }
    this.setState({data, showCustom: false});
  }

  deleteOption(i) {
    const {data} = this.state;
    data.options.splice(i, 1);
    // If the last default was deleted, make the first option the new default
    if (data.options.length > 0 && !data.options.map(o => o.isDefault).includes(true)) {
      data.options[0].isDefault = true;
      data.default = data.options[0].option;
    }
    this.setState({data});
  }

  handleTypeChange(e) {
    const {data} = this.state;
    data.type = e.target.value;
    if (data.type === "single") {
      let foundDefault = false;
      data.options = data.options.map(o => {
        if (!foundDefault) {
          if (o.isDefault) {
            foundDefault = true;
            data.default = o.option;
          }
        }
        else {
          o.isDefault = false;
        }
        return o;
      });
    }
    this.setState({data});
  }

  moveUp(i) {
    const {data} = this.state;
    if (i === 0) {
      return;
    }
    else {
      const temp = data.options[i - 1];
      data.options[i - 1] = data.options[i];
      data.options[i] = temp;
    }
    this.setState({data});
  }

  moveDown(i) {
    const {data} = this.state;
    if (i === data.options.length - 1) {
      return;
    }
    else {
      const temp = data.options[i + 1];
      data.options[i + 1] = data.options[i];
      data.options[i] = temp;
    }
    this.setState({data});
  }

  editName(e) {
    const {data} = this.state;
    data.name = e.target.value;
    this.setState({data});
  }

  editTitle(e) {
    const {data} = this.state;
    data.title = e.target.value;
    this.setState({data});
  }

  toggleCustom() {
    this.setState({showCustom: !this.state.showCustom});
  }

  render() {

    const {data, showCustom} = this.state;
    const {variables} = this.props;

    if (!data || !variables) return null;

    const varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables)
        .filter(key => !key.startsWith("_"))
        .sort((a, b) => a.localeCompare(b))
        .map(key => {
          const value = variables[key];
          const type = typeof value;
          const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
          return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
        }));

    const customOptions = Object.keys(variables)
      .filter(key => !key.startsWith("_"))
      .sort((a, b) => a.localeCompare(b))
      .map(key => {
        const value = variables[key];
        const type = typeof value;
        const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
        return <option key={`{{${key}}}`} value={`{{${key}}}`} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
      });

    return (
      <div className="cms-selector-editor">

        <div className="cms-field-group">
          <label className="cms-field-container">
            Title (on page)
            <input className="pt-input" value={data.title} onChange={this.editTitle.bind(this)} />
          </label>
          <label className="cms-field-container">
            Name (in editor)
            <input className="pt-input" value={data.name} onChange={this.editName.bind(this)} />
          </label>
        </div>

        <div className="cms-field-container">
          <RadioGroup
            className="inline-radio-group"
            label="Selector Type: "
            onChange={this.handleTypeChange.bind(this)}
            selectedValue={data.type}
          >
            <Radio label="Single" value="single" />
            <Radio label="Multi" value="multi" />
          </RadioGroup>
        </div>

        <ul className="cms-field-container cms-selector-editor-list">
          {
            data.options && data.options.map((option, i) =>
              <li className="cms-selector-editor-item" key={i}>

                {/* option / allowed */}
                <label className="pt-label">
                  Option
                  <div className="pt-select">
                    <select value={option.option} onChange={this.chooseOption.bind(this, i)}>
                      { varOptions }
                    </select>
                  </div>
                </label>
                <label className="pt-label">
                  Allowed
                  <div className="pt-select">
                    <select value={option.allowed} onChange={this.chooseAllowed.bind(this, i)}>
                      { varOptions }
                    </select>
                  </div>
                </label>

                <ul className="cms-selector-editor-action-list">
                  <li className="cms-selector-editor-action-item">
                    <label className="cms-selector-editor-checkbox">
                      <input type="checkbox" checked={option.isDefault} onChange={this.setDefault.bind(this, option.option)}/> Active
                    </label>
                  </li>
                  <li className="cms-selector-editor-action-item">
                    <button className="cms-button" onClick={this.moveUp.bind(this, i)}>
                      <span className="pt-icon pt-icon-arrow-up" />
                    </button>
                  </li>
                  <li className="cms-selector-editor-action-item">
                    <button className="cms-button" onClick={this.moveDown.bind(this, i)}>
                      <span className="pt-icon pt-icon-arrow-down" />
                    </button>
                  </li>
                  <li className="cms-selector-editor-action-item">
                    <button className="cms-button" onClick={this.deleteOption.bind(this, i)}>
                      <span className="pt-icon pt-icon-trash" /> delete</button>
                  </li>
                </ul>
              </li>
            )
          }
        </ul>
        <div className="cms-selector-editor-button-group">
          <button className="cms-button" onClick={this.addOption.bind(this)}>
            Add option <span className="pt-icon pt-icon-plus"/>
          </button>
          <button className="cms-button" onClick={this.toggleCustom.bind(this)}>
            Custom default <span className={`pt-icon ${showCustom ? "pt-icon-cross" : "pt-icon-cog"}`}/>
          </button>
        </div>

        {/* custom default */}
        {showCustom &&
          <div className="cms-field-container pt-label">
            Custom default
            <div className="pt-select">
              <select value={data.default} onChange={this.chooseCustom.bind(this)}>
                {customOptions}
              </select>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default SelectorEditor;
