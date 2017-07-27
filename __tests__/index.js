import React from 'react';
import { mount } from 'enzyme'
import sinon from 'sinon'

import Expose from '../src/index.js'

test('parent can\'t call childrens childrens methods', () => {
  const func = sinon.spy(() => {});

  class C extends React.Component {
    func() {
      func();
    }
    render() {
      return <span>C</span>;
    }
  }

  class B extends React.Component {
    render() {
      return <C />;
    }
  }

  class A extends React.Component {
    componentDidMount() {
      this.c.func && this.c.func();
    }
    render() {
      return <B ref={c => this.c = c} />
    }
  }

  mount(<A />)

  expect(func.called).toBe(false)
})

test('parent can call childrens childrens methods with react-expose', () => {
  const func = sinon.spy(() => {});

  class C extends React.Component {
    func() {
      func();
    }
    render() {
      return <span>C</span>;
    }
  }

  class B extends React.Component {
    render() {
      return <C />;
    }
  }

  const expose = Expose({
    exposeKeys: ['func'],
    componentTypes: [B],
  });
  const ExposedB = expose(B);

  class A extends React.Component {
    componentDidMount() {
      this.c.func && this.c.func();
    }
    render() {
      return <ExposedB ref={c => this.c = c} />
    }
  }

  mount(<A />)

  expect(func.called).toBe(true)
})
