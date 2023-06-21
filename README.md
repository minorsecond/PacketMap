# PacketMap
A constantly changing map of Amateur Radio operators who  enjoy packet radio (see mh-stats for backend)

Note: Must add the following to the imported modules for the sidebar to display:

add `export {default as Sidebar} from 'sidebar-v2/js/ol5-sidebar.js';` to node_modules/ol/control.js and
`import {Sidebar} from 'ol/control.js';` to main.js

You must also add an `ol` dependency to `node_modules/sidebar-v2/package.json`.