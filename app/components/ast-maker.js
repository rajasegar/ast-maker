import Component from '@ember/component';
import { parse, print, types } from 'recast';
import jsc from '../utils/codeshift-api';
import { computed } from '@ember/object';

const j = types.builders; // eslint-disable-line

// Sample code to test
const _code = `let a = 1;
let b = 'hello';
let c = false;
const d = 2;
var e = true;
import { foo as bar } from 'lib';
hello(1, 'world', true, a);
this.hello(1, 'world', true, a);
hello.world(1, 'foo', true, a);
foo.bar.baz();
foo.bar.bax.baz(1, 'foo', true, a);
if(a === 1) {
console.log('true');
foo.bar();
} else {
console.log('false');
foo.baz();
}

let a = {
name: 'raja',
action: hello()
};

export default class MyComponent extends ReactComponent {}
class MyComponent extends ReactComponent {}
`;

export default Component.extend({

  code: _code,

  ast: computed('code', function() {
    let ast = parse(this.get('code'));
    console.log(ast.program.body); // eslint-disable-line
    return JSON.stringify(ast);
  }),

  pseudoAst: computed('code', function() {

    let ast = parse(this.get('code'));

    // Build the jscodeshift api 
    let _ast = ast.program.body.map(node => {

      switch(node.type) {
        case 'VariableDeclaration':
          return jsc.variableDeclaration(node);

        case 'ImportDeclaration':
          return jsc.importDeclaration(node);

        case 'ExpressionStatement':
          return jsc.expressionStatement(node);

        case 'IfStatement':
          return jsc.ifStatement(node);

        case 'ExportDefaultDeclaration':
          return jsc.exportDefaultDeclaration(node);

        case 'ClassDeclaration':
          return jsc.classDeclaration(node);

        default:
          console.log(node.type); // eslint-disable-line
          return '';
      }

    });

    return _ast;

  }),

  nodeApi: computed('pseudoAst', function() {
        return this.get('pseudoAst').join('\n//-----------------------\n');
  }),

  output: computed('pseudoAst', function() {
    const sampleCode = '';
    const outputAst = parse(sampleCode);  

    // Check the manifested api is working fine
    this.get('pseudoAst').forEach(n => outputAst.program.body.push(eval(n)));

    const output = print(outputAst, { quote: 'single'}).code;

    return  output;
  }),

  init() {
    this._super(...arguments);
    this.set('jsonMode',{ name: "javascript", json: true });
  }

});
