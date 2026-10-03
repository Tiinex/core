import test from 'node:test';
import assert from 'node:assert/strict';
import { compileInlineSchemaInheritanceOverrides } from '../src/tooling/portable/schema/contract.inheritance.inline.js';
import { applySchemaInheritanceOverrides } from '../src/tooling/portable/schema/contract.inheritance.js';

const field=(value)=>({value,children:[]});
const declaration=(name,parentNode,childNode)=>({value:name,line:1,children:[
 field('Merge Operation: override'),field('Parent Schema: parent.v1'),field(`Parent Node: ${parentNode}`),field(`Child Node: ${childNode}`)
]});

test('inline inheritance override compiler accepts multiple distinct declarations',()=>{
 const document={schemaId:'child.v1',validation:{groups:[{name:'Specialization',categories:[{name:'Inheritance Overrides',nodes:[
  declaration('body-structure','Schema Validation Contract / Parent Body / Required Shape','Schema Validation Contract / Child Body / Required Shape'),
  declaration('identity-domain','Schema Validation Contract / Identity / Allowed Shapes','Schema Validation Contract / Identity / Allowed Shapes')
 ]}]}]}};
 const result=compileInlineSchemaInheritanceOverrides(document);
 assert.equal(result.state,'declared');
 assert.deepEqual(result.findings,[]);
 assert.deepEqual(result.declarations.map(x=>x.name),['body-structure','identity-domain']);
});

test('exact inheritance category override deactivates constraints sourced from that category',()=>{
 const root={schemaId:'tiinex.root.v1',validation:{groups:[
  {name:'Contract Syntax',categories:[{name:'Known Category Labels',items:['Inheritance Overrides']}]},
  {name:'Inheritance Overrides',categories:[
   {name:'Entry Shape',items:['Named Declaration']},
   {name:'Required Fields',items:['Merge Operation','Parent Schema','Parent Node','Child Node']},
   {name:'Optional Fields',items:['Reason','Effective Result']}
  ]}
 ]},constraints:[],inheritanceOverrides:{declarations:[],findings:[]}};
 const parent={schemaId:'parent.v1',validation:{groups:[{name:'Identity',categories:[{name:'Allowed Shapes',items:['`Type`: base']}]}]},constraints:[{kind:'field-domain',sourceSchemaId:'parent.v1',sourceGroup:'Identity',sourceCategory:'Allowed Shapes',field:'Type'}],inheritanceOverrides:{declarations:[],findings:[]}};
 const childDecl={name:'identity-domain',sourceSchemaId:'child.v1',sourceGroup:'Specialization',declarationLine:1,operation:'override',parentSchemaId:'parent.v1',parentNode:'Schema Validation Contract / Identity / Allowed Shapes',childNode:'Schema Validation Contract / Identity / Allowed Shapes',reason:'',effectiveResult:''};
 const child={schemaId:'child.v1',validation:{groups:[{name:'Identity',categories:[{name:'Allowed Shapes',items:['`Type`: child']}]}]},constraints:[{kind:'field-domain',sourceSchemaId:'child.v1',sourceGroup:'Identity',sourceCategory:'Allowed Shapes',field:'Type'}],inheritanceOverrides:{declarations:[childDecl],findings:[]}};
 const result=applySchemaInheritanceOverrides([root,parent,child]);
 assert.equal(result.resolution.state,'qualified');
 assert.equal(result.resolution.applications.length,1);
 assert.equal(result.composition[1].constraints.length,0);
 assert.equal(result.composition[2].constraints.length,1);
});
