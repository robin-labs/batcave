const React = require("react");
const {render} = require("react-dom");

const injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

const MuiThemeProvider = require("material-ui/styles/MuiThemeProvider").default;

require("browserify-css");
require("../css/style.css");

const {RobinApp} = require("./views/app.jsx");
const {Remote} = require("./remote.js");

var appRoot;
document.addEventListener("DOMContentLoaded", function() {
    appRoot = document.getElementById("root");
    doRender();
});

function doRender() {
    render(<MuiThemeProvider>
		<RobinApp remote={remote}/>
    </MuiThemeProvider>, appRoot);
}

const remote = new Remote(doRender);
