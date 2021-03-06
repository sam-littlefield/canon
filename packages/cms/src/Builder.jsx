import libs from "./utils/libs";
import React, {Component} from "react";
import PropTypes from "prop-types";
import ProfileBuilder from "./profile/ProfileBuilder";
import StoryBuilder from "./story/StoryBuilder";
import FormatterEditor from "./formatter/FormatterEditor";
import {fetchData} from "@datawheel/canon-core";
import {connect} from "react-redux";
import {Switch} from "@blueprintjs/core";

import "./cms.css";
import "./themes/cms-dark.css";
import "./themes/cms-light.css";

class Builder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentTab: "profiles",
      theme: "cms-light",
      locales: false,
      locale: false,
      localeDefault: false,
      showLocale: false,

      formatters: (props.formatters || []).reduce((acc, d) => {
        const f = Function("n", "libs", "formatters", d.logic);
        const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs, acc);
        return acc;
      }, {})
    };
  }

  componentDidMount() {
    const {isEnabled, env} = this.props;
    // The CMS is only accessible on localhost/dev. Redirect the user to root otherwise.
    if (!isEnabled && typeof window !== "undefined" && window.location.pathname !== "/") window.location = "/";
    
    // env.CANON_LANGUAGES = false;
    // Retrieve the langs from canon vars, use it to build the second language select dropdown.
    const localeDefault = env.CANON_LANGUAGE_DEFAULT || "en";
    if (env.CANON_LANGUAGES && env.CANON_LANGUAGES.includes(",")) {
      const locales = env.CANON_LANGUAGES.split(",").filter(l => l !== localeDefault);
      const locale = locales[0];
      this.setState({locales, locale, localeDefault});
    }
    else {
      this.setState({localeDefault});
    }
  }

  getChildContext() {
    const {formatters} = this.state;
    return {formatters};
  }

  handleTabChange(newTab) {
    const {currentTab} = this.state;
    if (newTab !== currentTab) {
      this.setState({currentTab: newTab});
    }
  }

  /*
  setPath(node) {
    const {router} = this.props;
    const {pslug, tslug} = this.props.params;
    let path;
    if (node.itemType === "profile") {
      path = `/cms-profile/${node.data.slug}`;
    }
    else if (node.itemType === "topic") {
      path = `/cms-profile/${node.masterSlug}/${node.data.slug}`;
    }
    router.push(path);
  }
  */

  toggleLocale(e) {
    const {locales} = this.state;
    const locale = e.target.checked ? false : locales[0];
    const showLocale = e.target.checked;
    this.setState({showLocale, locale});
  }

  handleThemeSelect(e) {
    this.setState({theme: e.target.value});
  }

  handleLocaleSelect(e) {
    this.setState({locale: e.target.value});
  }

  render() {
    const {currentTab, theme, locale, locales, localeDefault, showLocale} = this.state;
    const {isEnabled} = this.props;
    const navLinks = ["profiles", "stories", "formatters"];

    /*
    const {profileSlug, topicSlug} = this.props.params;

    const pathObj = {profileSlug, topicSlug};
    */

    if (!isEnabled) return null;

    return (
      <div className={`cms ${theme}`}>
        <div className="cms-nav">
          {navLinks.map(navLink =>
            <button
              key={navLink}
              className={`cms-nav-link${navLink === currentTab ? " is-active" : ""}`}
              onClick={this.handleTabChange.bind(this, navLink)}>
              {navLink}
            </button>
          )}
          {locales && locale && <label className="cms-select-label cms-theme-select">default language: {localeDefault}, second language: 
            <select
              className="cms-select"
              name="select-theme"
              id="select-theme"
              value={locale}
              onChange={this.handleLocaleSelect.bind(this)}
            >
              {locales.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </label>}
          {locales && <Switch className="cms-lang-toggle" checked={showLocale} label={showLocale ? "Show Both Locales" : "Show One Locale"} onChange={this.toggleLocale.bind(this)} />}
          <label className="cms-select-label cms-theme-select">theme: 
            <select
              className="cms-select"
              name="select-theme"
              id="select-theme"
              value={this.state.selectValue}
              onChange={this.handleThemeSelect.bind(this)}
            >
              <option value="cms-light">light</option>
              <option value="cms-dark">dark</option>
            </select>
          </label>
        </div>
        {currentTab === "profiles" && <ProfileBuilder /* pathObj={pathObj} setPath={this.setPath.bind(this)} */ localeDefault={localeDefault} locale={locale}/>}
        {currentTab === "stories" && <StoryBuilder /* pathObj={pathObj} setPath={this.setPath.bind(this)} */ localeDefault={localeDefault} locale={locale}/>}
        {currentTab === "formatters" && <FormatterEditor />}
      </div>
    );
  }
}

Builder.childContextTypes = {
  formatters: PropTypes.object
};

Builder.need = [
  fetchData("formatters", "/api/formatters"),
  fetchData("isEnabled", "/api/cms")
];

export default connect(state => ({
  formatters: state.data.formatters,
  env: state.env,
  isEnabled: state.data.isEnabled
}))(Builder);
