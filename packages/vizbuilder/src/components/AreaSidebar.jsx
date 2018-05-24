import React from "react";
import PropTypes from "prop-types";

import BaseSelect from "./BaseSelect";
import MeasureSelect from "./MeasureSelect";
import {
  removeDrilldown,
  setDrilldown,
  setMeasure,
  updateLocalContext
} from "../actions/events";
import {fetchCubes, fetchQuery} from "../actions/fetch";

import "./AreaSidebar.css";
import LevelSelect from "./LevelSelect";

class AreaSidebar extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setMeasure = setMeasure.bind(this);
    this.setDrilldown = setDrilldown.bind(this);
    this.removeDrilldown = removeDrilldown.bind(this);
    this.fetchQuery = fetchQuery.bind(this);
    this.updateLocalContext = updateLocalContext.bind(this);
  }

  componentDidMount() {
    this.context.loadWrapper(fetchCubes.bind(this), this.fetchQuery);
  }

  render() {
    const {query, options} = this.props;

    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <div className="group">
            <h3>Measure</h3>
            <MeasureSelect
              items={options.measures}
              value={query.measure}
              onItemSelect={this.setMeasure}
            />
          </div>
          <div className="group">
            <h3>Level</h3>
            <LevelSelect
              items={options.levels}
              value={query.drilldowns}
              onItemSelect={this.setDrilldown}
              onItemRemove={this.removeDrilldown}
            />
          </div>
        </div>
      </div>
    );
  }
}

AreaSidebar.contextTypes = {
  queryUpdate: PropTypes.func,
  optionsUpdate: PropTypes.func,
  datasetUpdate: PropTypes.func,
  loadWrapper: PropTypes.func
};

export default AreaSidebar;
