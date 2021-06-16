const {
  quicktype,
  jsonInputForTargetLanguage,
  InputData,
} = require("quicktype-core");
const fs = require('fs')

module.exports.requestActions = [
  {
    label: 'Generate TypeScript Types',
    action: async (context, data) => {
      const { request } = data;
      const response = await context.network.sendRequest(request);
      const body = fs.readFileSync(response.bodyPath);
            
      context.app.showSaveDialog().then(async (filePath) => {
        if (filePath !== null) {
          const fileName = filePath.split('/').pop().split('.')[0];
          const rootName = fileName
            .split('-')
            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
            .join('')
            .replace(/\W/g, '');

          const jsonInput = jsonInputForTargetLanguage('ts');
          await jsonInput.addSource({
            name: rootName,
            samples: [body],

          });

          const inputData = new InputData();
          inputData.addInput(jsonInput);

          const interfaces = await quicktype({
            inputData,
            lang: 'ts',
            rendererOptions: {
              'just-types': true,
              'runtime-typecheck': false
            }
          });

          console.log('interfaces', interfaces.lines.join('\n'));

          const content = interfaces.lines.join('\n')
            .replace(/\{/gm, '= {')
            .replace(/\};/gm, "};\n")
            .replace(/interface/gm, 'type');

          fs.writeFile(filePath, content, (err) => {
            console.log('err', err);
          });
        }
      });
    },
  },
];