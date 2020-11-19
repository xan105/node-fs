'use strict';

const fs = require("../fs.cjs");


(async()=>{

 await fs.win32.attrib("./attrib.cjs",["+R"]);
 console.log ( await fs.win32.attrib.getCurrent("./attrib.cjs") );
 await fs.win32.attrib.removeReadOnly("./attrib.cjs");
 console.log ( await fs.win32.attrib.getCurrent("./attrib.cjs") );

})().catch(console.error);