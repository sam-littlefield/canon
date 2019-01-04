import axios from "axios";
import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import Loading from "components/Loading";
import TextCard from "../components/cards/TextCard";
import PropTypes from "prop-types";
import "./SectionEditor.css";

const propMap = {
  section_subtitle: "subtitles",
  section_description: "descriptions"
};

class SectionEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      recompiling: true
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)(false);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.hitDB.bind(this)(false);
    }
    if (prevProps.preview !== this.props.preview) {
      this.hitDB.bind(this)(true);
    }
  }

  hitDB(force) {
    axios.get(`/api/cms/section/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data, recompiling: true}, this.fetchVariables.bind(this, force));
    });
  }

  changeField(field, e) {
    const {minData} = this.state;
    minData[field] = e.target.value;
    this.setState({minData});
  }

  chooseVariable(e) {
    const {minData} = this.state;
    minData.allowed = e.target.value;
    this.setState({minData}, this.save.bind(this));
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = {};
    payload.section_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
        this.setState({minData});
      }
    });
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    this.setState({minData});
  }

  onSave(minData) {
    this.setState({recompiling: true});
    if (this.props.reportSave) this.props.reportSave("section", minData.id, minData.title);
  }

  onMove() {
    this.forceUpdate();
  }

  save() {
    const {minData} = this.state;
    axios.post("/api/cms/section/update", minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
      }
    });
  }

  fetchVariables(force) {
    const slug = this.props.masterSlug;
    const id = this.props.preview;
    if (this.props.fetchVariables) {
      this.props.fetchVariables(slug, id, force, () => this.setState({recompiling: false}));
    }
  }

  render() {

    const {minData, recompiling} = this.state;
    const {children, variables} = this.props;

    if (!minData || !variables) return <Loading />;

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

    return (
      <div className="cms-editor-inner">
        {/* profile preview & variable status */}
        <div className="cms-profile-picker">
          {/* search profiles */}
          {children}
          {/* loading status */}
          <div className={recompiling ? "cms-status is-loading cms-alert-color" : "cms-status is-done"}>
            <Icon iconName={ recompiling ? "more" : "tick"} />
            { recompiling ? "Updating Variables" : "Variables Loaded" }
          </div>
        </div>

        {/* current section options */}
        <div className="cms-editor-header">
          {/* change slug */}
          <label className="bp3-label cms-slug">
            Section slug
            <div className="bp3-input-group">
              <input className="bp3-input" type="text" value={minData.slug} onChange={this.changeField.bind(this, "slug")}/>
              <button className="cms-button bp3-button" onClick={this.save.bind(this)}>Rename</button>
            </div>
          </label>
          {/* visibility select */}
          <label className="bp3-label bp3-fill">
            Allowed
            <div className="bp3-select">
              <select id="visibility-select" value={minData.allowed || "always"} onChange={this.chooseVariable.bind(this)}>
                {varOptions}
              </select>
            </div>
          </label>
        </div>

        {/* section title */}
        {/* TODO: move this into section options above */}
        <h2 className="cms-section-heading">
          Section title
          {/* <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "generator")}>
            <span className="bp3-icon bp3-icon-plus" />
          </button> */}
        </h2>
        <div className="cms-card-list">
          <TextCard
            item={minData}
            fields={["title"]}
            type="section"
            onSave={this.onSave.bind(this)}
            variables={variables}
          />
        </div>

        {/* subtitles */}
        <h2 className="cms-section-heading">
          Subtitles
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "section_subtitle")}>
            <span className="bp3-icon bp3-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.subtitles && minData.subtitles.map(s =>
            <TextCard
              key={s.id}
              item={s}
              fields={["subtitle"]}
              type="section_subtitle"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
              parentArray={minData.subtitles}
              onMove={this.onMove.bind(this)}
            />
          )}
        </div>

        {/* descriptions */}
        <h2 className="cms-section-heading">
          Descriptions
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "section_description")}>
            <span className="bp3-icon bp3-icon-plus" />
          </button>
        </h2>
        <div className="cms-card-list">
          { minData.descriptions && minData.descriptions.map(d =>
            <TextCard
              key={d.id}
              item={d}
              fields={["description"]}
              type="section_description"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
              parentArray={minData.descriptions}
              onMove={this.onMove.bind(this)}
            />
          )}
        </div>
      </div>
    );
  }
}

SectionEditor.contextTypes = {
  formatters: PropTypes.object
};

export default SectionEditor;
