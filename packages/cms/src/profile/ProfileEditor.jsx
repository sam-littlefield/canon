import axios from "axios";
import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import PropTypes from "prop-types";
import Loading from "components/Loading";

import GeneratorCard from "../components/cards/GeneratorCard";
import TextCard from "../components/cards/TextCard";
import MoveButtons from "../components/MoveButtons";

import "./ProfileEditor.css";

const propMap = {
  generator: "generators",
  materializer: "materializers"
};

class ProfileEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      variables: null,
      recompiling: true
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
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
    axios.get(`/api/cms/profile/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data, recompiling: true}, this.fetchVariables.bind(this, force));
    });
  }

  fetchVariables(force) {
    const slug = this.props.masterSlug;
    const id = this.props.preview;
    if (this.props.fetchVariables) {
      this.props.fetchVariables(slug, id, force, () => this.setState({recompiling: false}));
    }
  }

  changeField(field, e) {
    const {minData} = this.state;
    minData[field] = e.target.value;
    this.setState({minData});
  }

  onSave() {
    this.setState({recompiling: true}, this.fetchVariables.bind(this, true));
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    if (type === "generator" || type === "materializer") {
      this.setState({minData, recompiling: true}, this.fetchVariables.bind(this, true));
    }
    else {
      this.setState({minData});
    }
  }

  save() {
    const {minData} = this.state;
    axios.post("/api/cms/profile/update", minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        if (this.props.reportSave) this.props.reportSave("profile", minData.id, minData.slug);
      }
    });
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = {};
    payload.profile_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        if (type === "generator" || type === "materializer") {
          minData[propMap[type]].push({id: resp.data.id, name: resp.data.name, ordering: resp.data.ordering || null});
          this.setState({minData}, this.fetchVariables.bind(this, true));
        }
        else {
          minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
          this.setState({minData});
        }
      }
    });
  }

  onMove() {
    this.forceUpdate();
  }

  render() {

    const {minData, recompiling} = this.state;
    const {children, variables, preview, locale} = this.props;

    if (!minData || !variables) return <Loading />;

    return (
      <div className="cms-editor-inner">
        {/* profile preview & variable status */}
        <div className="cms-profile-picker">
          {/* search profiles*/}
          {children}
          {/* loading status */}
          <div className={recompiling ? "cms-status is-loading cms-alert-color" : "cms-status is-done"}>
            <Icon iconName={ recompiling ? "more" : "tick"} />
            { recompiling ? "Updating Variables" : "Variables Loaded" }
          </div>
        </div>

        {/* current profile options */}
        <div className="cms-editor-header">
          {/* change slug */}
          <label className="pt-label cms-slug">
            Profile slug
            <div className="pt-input-group">
              <input className="pt-input" type="text" value={minData.slug} onChange={this.changeField.bind(this, "slug")}/>
              <button className="cms-button pt-button" onClick={this.save.bind(this)}>Rename</button>
            </div>
          </label>
        </div>

        {/* generators */}
        <h2 className="cms-section-heading">
          Generators
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "generator")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <p className="pt-text-muted">Variables constructed from JSON data calls.</p>
        <div className="cms-card-list">
          { minData.generators && minData.generators
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(g => <GeneratorCard
              key={g.id}
              item={g}
              preview={preview}
              onSave={this.onSave.bind(this)}
              onDelete={this.onDelete.bind(this)}
              type="generator"
              variables={variables}
            />)
          }
        </div>

        {/* materializers */}
        <h2 className="cms-section-heading">
          Materializers
          <button className="cms-button cms-section-heading-button" onClick={this.addItem.bind(this, "materializer")}>
            <span className="pt-icon pt-icon-plus" />
          </button>
        </h2>
        <p className="pt-text-muted">Variables constructed from other variables. No API calls needed.</p>
        <div className="cms-card-list materializers">
          { minData.materializers && minData.materializers
            .map(m =>
              <GeneratorCard
                key={m.id}
                item={m}
                onSave={this.onSave.bind(this)}
                onDelete={this.onDelete.bind(this)}
                type="materializer"
                variables={variables}
                parentArray={minData.materializers}
                onMove={this.onMove.bind(this)}
              />
            )}
        </div>

        {/* Top-level Profile */}
        <h2 className="cms-section-heading">
          Profile
        </h2>
        <div
          className="cms-splash-wrapper"
          style={{backgroundImage: `url("/api/profile/${minData.slug}/${preview}/thumb")`}}
        >
          <div className="cms-card-list cms-profile-header">
            <TextCard
              locale="en"
              item={minData}
              fields={["title", "subtitle"]}
              type="profile"
              variables={variables}
            />
            <TextCard
              locale={locale}
              item={minData}
              fields={["title", "subtitle"]}
              type="profile"
              variables={variables}
            />
          </div>
        </div>

      </div>
    );
  }
}

ProfileEditor.contextTypes = {
  formatters: PropTypes.object
};

export default ProfileEditor;
