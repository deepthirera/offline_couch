
var React = window.React = require('react'),
    Timer = require("./ui/Timer"),
    mountNode = document.getElementById("app");

var db = new PouchDB('sources');
var remoteCouch = "http://localhost:5984/sources";
db.sync(remoteCouch, {live: true, retry: true}).on('error', console.log.bind(console));
var TodoList = React.createClass({
  render: function() {
    var createItem = function(itemText) {
        return <li>{itemText.title}</li>;
    };
    return <ul>{this.props.items.map(createItem)}</ul>;
  }
});

var TodoApp = React.createClass({
  getInitialState: function() {
      return {items: [], text: ''};
  },

    componentDidMount: function() {
        var srcs = [];
        var self=this;
        db.allDocs({include_docs: true, descending: true}, function(err, response) {
                srcs = response.rows.map(function(src){return src.doc})
                if (self.isMounted()) {
                    self.setState({
                        items: srcs,
                        text: ''
                    });
                }
            }
        );
    },
  onChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
      var self=this;
      var src = {
          _id: new Date().toISOString(),
          title: self.state.text,
          url: "www.url.com"
      };
      db.put(src, function callback(err, result) {
        var nextItems = self.state.items.concat([src]);
        var nextText = '';
        self.setState({items: nextItems, text: nextText});
      });
  },
  render: function() {
    return (
      <div>
        <h3>TODO</h3>
        <TodoList items={this.state.items} />
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.onChange} value={this.state.text} />
          <button>{'Add #' + (this.state.items.length + 1)}</button>
        </form>
      </div>
    );
  }
});


React.render(<TodoApp />, mountNode);

