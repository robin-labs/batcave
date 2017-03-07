const React = require("react");
const {render} = require("react-dom");
const _ = require("underscore");

require("browserify-css");
require("../css/style.css");

class App extends React.Component {
    render() {
        return <div> :) </div>;
    }
}

var appRoot;
document.addEventListener("DOMContentLoaded", function() {
    appRoot = document.getElementById("root");
    doRender();
});

function doRender() {
    render(<App/>, appRoot);
    window.requestAnimationFrame(doRender);
}

