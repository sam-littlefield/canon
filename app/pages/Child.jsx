import React from "react";
import {Treemap} from "d3plus-react";

import {fetchData} from "../../src/actions/fetchData";

import {SectionColumns} from "../../src/components/Section";
import {SectionTitle} from "../../src/components/SectionTitle";

class Child extends SectionColumns {

  render() {
    const data = this.context.data.harvested_area;
    return (
      <SectionColumns>
        <SectionTitle>My Cool Title</SectionTitle>
        <article>Some Text</article>
        <Treemap config={{
          data,
          groupBy: "crop",
          label: d => d.crop_name,
          legend: false,
          sum: d => d.harvested_area
        }} />
      </SectionColumns>
    );
  }
}

Child.need = [
  fetchData("harvested_area", "api/join/?geo=<id>&show=crop&required=harvested_area,value_of_production&order=harvested_area&sort=desc&display_names=true")
];

export default Child;
