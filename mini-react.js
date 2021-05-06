// 声明编译指示
/** @jsx DiyReact.createElement */

// 导入我们下面要实现的API
const DiyReact = importFromBelow();

// 业务代码
const randomLikes = () => Math.ceil(Math.random() * 100);
const stories = [
  { name: "React", url: "https://reactjs.org/", likes: randomLikes() },
  { name: "Node", url: "https://nodejs.org/en/", likes: randomLikes() },
  { name: "Webpack", url: "https://webpack.js.org/", likes: randomLikes() }
];

const ItemRender = props => {
  const { name, url } = props;
  return (
    <a href={url}>{name}</a>
  );
};

class App extends DiyReact.Component {
  render() {
    return (
      <div>
        <h1>DiyReact Stories</h1>
        <ul>
          {this.props.stories.map(story => {
            return <Story name={story.name} url={story.url} />;
          })}
        </ul>
      </div>
    );
  }

  componentWillMount() {
    console.log('execute componentWillMount');
  }

  componentDidMount() {
    console.log('execute componentDidMount');
  }

  componentWillUnmount() {
    console.log('execute componentWillUnmount');
  }
}

class Story extends DiyReact.Component {
  constructor(props) {
    super(props);
    this.state = { likes: Math.ceil(Math.random() * 100) };
  }
  like() {
    this.setState({
      likes: this.state.likes + 1
    });
  }
  render() {
    const { name, url } = this.props;
    const { likes } = this.state;
    const likesElement = <span />;
    return (
      <li>
        <button onClick={e => this.like()}>{likes}<b>❤️</b></button>
        <ItemRender {...itemRenderProps} />
      </li>
    );
  }

  // shouldcomponentUpdate() {
  //   return true;
  // }

  componentWillUpdate() {
    console.log('execute componentWillUpdate');
  }

  componentDidUpdate() {
    console.log('execute componentDidUpdate');
  }
}

// 将组件渲染到根dom节点
DiyReact.render(<App stories={stories} />, document.getElementById("root"));






// 实现createElement
function createElement(type, props, ...children) {
  props = Object.assign({}, props)
  props.children = [].concat(...children)
    .filter(child => child != null && child !== false)
    .map(child => child instanceof Object
      ? child
      : createTextElement(child))
  return { type, props }
}

// 实现render
let rootInstance = null
function render(element, parentDom) {
  const prevInstance = rootInstance
  const nextInstance = diff(parentDom, prevInstance, element)
  rootInstance = nextInstance
}

//实现instantate
function instantiate(element) {
  const { type, props = {} } = element
  const isDomElement = typeof type === 'string'
  const isClassElement = !!(type.prototype && type.prototype.isReactComponent)
  if (isDomElement) {
    //创建Dom
    const isTextElement = type === TEXT_ELEMENT
    const dom = isTextElement ? document.createTextNode('') : document.createElement(type)

    //设置Dom的事件，数据属性
    updateDomProperties(dom, [], element.props)
    const children = props.children || []
    const childInstances = children.map(instantiate)
    const childDoms = childInstances.map(childInstances => childInstances.dom)
    childDoms.forEach(childDom => dom.appendChild(childDom))
    const instance = { element, dom, childInstances }
    return instance
  } else if (isClassElement) {
    const instance = {}
    const publicInstance = createPublicInstance(element, instance)
    const childElement = publicInstance.render()
    const childInstance = instantiate(childElement)
    Object.assign(instance, { dom: childInstance.dom, element, childInstance, publicInstance })
    return instance
  } else {
    const childElement = type(element.props)
    const childInstance = instantiate(childElement)
    const instance = {
      dom: childInstance.dom,
      element,
      childInstance,
      fn: type
    };
    return instance
  }
}

//打标记
Component.prototype.isReactComponent = {}
//区分组件类型
const type = element.type
const isDomElement = typeof type === 'string'
const isClassElement = !!(type.prototype && type.prototype.isReactComponent)