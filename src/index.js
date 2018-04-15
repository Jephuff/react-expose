import React from "react";

function getValue(source, key) {
  if (source) {
    if (typeof source[key] === "function") {
      return source[key].bind(source);
    } else {
      return source[key];
    }
  } else {
    return undefined;
  }
}

const reactExpose = ({ exposeKeys = [], target, passthrough = [] }) => {
  if (!target && passthrough.length === 0) {
    console.warn(
      "no target component or passthrogh components passed in. Doing nothing"
    );
    return c => c;
  }

  if (exposeKeys.length === 0) {
    console.warn("no keys passed in to expose. Doing nothing");
    return c => c;
  }

  function expose(Component, exposeStatic) {
    if (
      target === Component ||
      (passthrough.length && !passthrough.includes(Component))
    )
      return Component;

    class NewComponent extends Component {
      render() {
        const rendered = super.render.call({
          ...Object.entries(this).reduce((acc, [k, v]) => {
            acc[k] = v;
            return acc;
          }, {}),
          props: {
            ...this.props,
            children: React.Children.map(this.props.children, child => ({
              ...child,
              type: expose(child.type)
            }))
          }
        });

        return !rendered || typeof rendered !== "object"
          ? rendered
          : React.cloneElement(rendered, {
              ...rendered.props,
              ref: c => (this.child = c)
            });
      }
    }

    exposeKeys.forEach(key => {
      Object.defineProperty(NewComponent.prototype, key, {
        get: function() {
          return getValue(this.child, key);
        }
      });

      if (exposeStatic && target) {
        Object.defineProperty(NewComponent, key, {
          get: function() {
            return getValue(target, key);
          }
        });
      }
    });

    return NewComponent;
  }

  return Component => expose(Component, true);
};
