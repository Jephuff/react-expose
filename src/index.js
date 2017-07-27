import React from "react";

export default ({ exposeKeys = [], componentTypes = [] }) => {
  return function expose(Component) {
    if (!componentTypes.includes(Component)) return Component;

    class NewComponent extends Component {
      render() {
        const rendered = super.render.call({
          ...this,
          props: {
            ...this.props,
            children: React.Children.map(this.props.children, child => ({
              ...child,
              type: expose(child.type),
            }))
          }
        });

        return (!rendered || typeof rendered !== 'object') ? rendered : (
          React.cloneElement(rendered, {
            ...rendered.props,
            ref: c => (this.child = c),
          })
        );
      }
    }

    exposeKeys.forEach(key => {
      Object.defineProperty(NewComponent.prototype, key, {
        get: function () {
          if (this.child && this.child[key]) {
            if (typeof this.child[key] === 'function') {
              return this.child[key].bind(this.child);
            } else {
              return this.child[key];
            }
          }
        }
      });
    });

    return NewComponent;
  };
};
