export interface AstNode {
    type: string;
    location: string; 
}

export interface AstStatBlock extends AstNode {
    type: 'AstStatBlock';
    hasEnd?: boolean;
    body: AstNode[];
}

export interface AstStatAssign extends AstNode {
    type: 'AstStatAssign';
    vars: (AstExprGlobal | AstExprLocal | AstExprIndexName)[];
    values: AstExpr[];
}

export interface AstStatLocal extends AstNode {
    type: 'AstStatLocal';
    vars: AstLocal[];
    values?: AstExpr[];
}

export interface AstStatLocalFunction extends AstNode {
    type: 'AstStatLocalFunction';
    name: AstLocal;
    func: AstExprFunction;
}

export interface AstStatFor extends AstNode {
    type: 'AstStatFor';
    var: AstLocal;
    from: AstExpr;
    to: AstExpr;
    step?: AstExpr;
    body: AstStatBlock;
    hasDo?: boolean;
}

export interface AstStatForIn extends AstNode {
    type: 'AstStatForIn';
    vars: AstLocal[];
    values: AstExpr[];
    body: AstStatBlock;
    hasIn?: boolean;
    hasDo?: boolean;
}

export interface AstStatIf extends AstNode {
    type: 'AstStatIf';
    condition: AstExprBinary;
    thenbody: AstStatBlock;
    elsebody?: AstStatBlock;
    hasThen?: boolean;
}

export interface AstStatWhile extends AstNode {
    type: 'AstStatWhile';
    condition: AstExprBinary;
    body: AstStatBlock;
    hasDo?: boolean;
}

export interface AstStatRepeat extends AstNode {
    type: 'AstStatRepeat';
    condition: AstExprBinary;
    body: AstStatBlock;
}

export interface AstStatExpr extends AstNode {
    type: 'AstStatExpr';
    expr: AstExprCall;
}

export interface AstStatCompoundAssign extends AstNode {
    type: 'AstStatCompoundAssign';
    op: string;
    var: AstExprLocal;
    value: AstExpr;
}

export interface AstStatTypeAlias extends AstNode {
    type: 'AstStatTypeAlias';
    name: string;
    generics: AstGenericType[];
    value: AstTypeUnion;
}

export interface AstStatReturn extends AstNode {
    type: 'AstStatReturn';
    list: AstExpr[];
}

export interface AstStatBreak extends AstNode {
    type: 'AstStatBreak';
}

export interface AstStatContinue extends AstNode {
    type: 'AstStatContinue';
    hasSemicolon: boolean; 
}

export interface AstExpr extends AstNode {}

export interface AstExprGlobal extends AstExpr {
    type: 'AstExprGlobal';
    global: string;
}

export interface AstExprLocal extends AstExpr {
    type: 'AstExprLocal';
    local: AstLocal;
}

export interface AstExprIndexName extends AstExpr {
    type: 'AstExprIndexName';
    expr: AstExprLocal;
    index: string;
}

export interface AstExprBinary extends AstExpr {
    type: 'AstExprBinary';
    op: string;
    left: AstExpr;
    right: AstExpr;
}

export interface AstExprConstant extends AstExpr {
    type: string;
    value: any;
}

export interface AstExprConstantBool extends AstExprConstant {
    type: 'AstExprConstantBool';
    value: boolean;
}

export interface AstExprConstantNumber extends AstExprConstant {
    type: 'AstExprConstantNumber';
    value: number;
}

export interface AstExprConstantString extends AstExprConstant {
    type: 'AstExprConstantString';
    value: string;
}

export interface AstExprConstantNil extends AstExpr {
    type: 'AstExprConstantNil';
}

export interface AstExprTable extends AstExpr {
    type: 'AstExprTable';
    items: AstExprTableItem[];
}

export interface AstExprTableItem extends AstExpr {
    kind: string;
    value: AstExpr;
    key?: AstExpr;
}

export interface AstExprFunction extends AstExpr {
    type: 'AstExprFunction';
    args: AstLocal[];
    returnAnnotation?: AstTypeList;
    body: AstStatBlock;
}

export interface AstExprCall extends AstExpr {
    type: 'AstExprCall';
    func: AstExprGlobal | AstExprLocal;
    args: AstExpr[];
}

export interface AstExprUnary extends AstExpr {
    type: 'AstExprUnary';
    op: string;
    expr: AstExpr;
}

export interface AstExprTypeAssertion extends AstExpr {
    type: 'AstExprTypeAssertion';
    expr: AstExpr;
    annotation: AstTypeReference;
}

export interface AstExprVarargs extends AstExpr {
    type: 'AstExprVarargs';
}

export interface AstExprInterpString extends AstExpr {
    type: 'AstExprInterpString';
    strings: string[];
    expressions: AstExpr[];
}

export interface AstExprGroup extends AstExpr {    
    type: 'AstExprGroup';
    expr: AstExpr;
}

export interface AstLocal extends AstNode {
    type: 'AstLocal';
    name: string;
    luauType: AstTypeReference | null;
}

export interface AstGenericType extends AstNode {
    name: string;
}

export interface AstType extends AstNode {}

export interface AstTypeReference extends AstType {
    type: 'AstTypeReference';
    name: string;
    parameters: AstType[];
}

export interface AstTypeList extends AstType {
    types: AstType[];
}

export interface AstTypeUnion extends AstType {
    types: AstTypeTable[];
}

export interface AstTypePackVariadic extends AstType {
    variadicType: AstTypeReference;
}

export interface AstTypeTable extends AstType {
    props: AstTableProp[];
    indexer?: any;
}

export interface AstTableProp extends AstNode {
    name: string;
    propType: AstTypeReference;
}

export interface Comment {
    type: 'Comment';
    location: string;
}
