import { createElement } from "react";
import * as lucideIcons from "lucide-react";
import PropTypes from "prop-types";

function Lucide({ icon = "", className = "", ...computedProps }) {
  try {
    if (lucideIcons[icon] !== undefined) {
      return createElement(lucideIcons[icon], {
        ...computedProps,
        className: `lucide ${className}`,
      });
    } else {
      throw icon;
    }
  } catch (err) {
    throw `Lucide icon '${icon}' not found.`;
  }
}

Lucide.propTypes = {
  icon: PropTypes.string,
  className: PropTypes.string,
};

export default Lucide;
