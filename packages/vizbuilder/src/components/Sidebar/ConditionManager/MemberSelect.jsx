import React from "react";
import classnames from "classnames";
import escapeRegExp from "lodash/escapeRegExp";

import {Spinner} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/labs";

const spinner = <Spinner className="pt-small" />;

function MemberSelect(props) {
  props.className = classnames("select-box select-member", props.className);
  props.tagInputProps.onRemove = props.onItemRemove;
  props.tagInputProps.rightElement = props.loading ? spinner : null;
  return React.createElement(MultiSelect, props);
}

MemberSelect.defaultProps = {
  itemListPredicate(query, items) {
    query = query.trim();
    query = escapeRegExp(query);
    query = query.replace(/\s+/g, ".+");
    const tester = RegExp(query || ".", "i");
    return items.filter(item => tester.test(item.caption || item.name));
  },
  itemRenderer({handleClick, item, isActive}) {
    return (
      <li
        className={classnames("select-option", {active: isActive})}
        onClick={handleClick}
      >
        {item.caption}
      </li>
    );
  },
  tagRenderer: item => item.caption,
  popoverProps: {
    popoverClassName: "select-box select-box-popover select-member pt-minimal"
  },
  tagInputProps: {}
};

export default MemberSelect;