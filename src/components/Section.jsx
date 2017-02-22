import React, {Component} from "react";
import "./Section.css";

class Section extends Component {

  render() {
    const {children, title, type} = this.props;
    return (
      <section>
        { title ? <h4 className="sectionTitle">{ title }</h4> : null }
        <div className={ type }>{ children }</div>
      </section>
    );
  }

}

Section.contextTypes = {
  data: React.PropTypes.object
};

Section.defaultProps = {
  type: "columns"
};

class SectionColumns extends Section {}
SectionColumns.defaultProps = {
  type: "columns"
};

class SectionRows extends Section {}
SectionRows.defaultProps = {
  type: "rows"
};

export default Section;
export {Section, SectionColumns, SectionRows};
