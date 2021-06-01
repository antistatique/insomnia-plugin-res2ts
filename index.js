const { json2ts } = require('json-ts');
const fs = require('fs')

module.exports.requestActions = [
  {
    label: 'Generate TypeScript Types',
    action: async (context, data) => {
      const { request } = data;
      const response = await context.network.sendRequest(request);
      const body = fs.readFileSync(response.bodyPath);
      const interfaces = json2ts(body, { prefix: '', rootName: 'RootObject' });
      
      context.app.showSaveDialog().then((filePath) => {
        if (filePath !== null) {
          const fileName = filePath.split('/').pop().split('.')[0];
          const rootName = fileName
            .split('-')
            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
            .join('')
            .replace(/\W/g, '');
          const body = interfaces
            .replace(/\{/gm, '= {')
            .replace(/\}/gm, "};\n")
            .replace(/\s\s\s\s/gm, "\n ")
            .replace('interface RootObject', `export type ${rootName}`)
            .replace(/interface/gm, 'type');

          fs.writeFile(filePath, body, (err) => {
            console.log('err', err);
          });
        }
      });
    },
  },
];