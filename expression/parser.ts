import { BooleanExpression, AuthorExpression, TagExpression, NotExpression, AndExpression, OrExpression } from './BooleanExpression';
import {Types} from 'mongoose';

/**
 * Parses the string into a BooleanExpression based on the following syntax:
 * expr := "|(expr,expr)" or "&(expr,expr)" or "!(expr)" or "@authorUserId" or "#tagLabel"
 * authorUserId := alphanumeric string
 * tagLabel := alphanumeric string
 * 
 * @param {string} input - the input expression to parse
 * @returns {BooleanExpression} - the object representing the expression
 */
export function parse(input: string): BooleanExpression {
	const tokens = tokenize(input);
	return makeBooleanExpression(tokens);
}

function tokenize(input: string): Array<string> {
	const charactersRegex = /^([|&!@#(),]|\w)+$/g;
	if (!charactersRegex.test(input)) throw new Error('Expression must not contain invalid characters.');
	const expressionRegex = /([|&!@#(),])|(\w+)/g;
	const matchArrays = input.matchAll(expressionRegex);
	const tokens = [...matchArrays].map(matchArray => matchArray[0]);
	return tokens;
}

function makeBooleanExpression(tokens: Array<string>): BooleanExpression {
	const leftSymb = '(';
	const rightSymb = ')';
	const commaSymb = ',';
	const orSymb = '|';
	const andSymb = '&';
	const notSymb = '!';
	const authorSymb = '@';
	const tagSymb = '#';
	function recurse(index: number): [BooleanExpression, number] {
		if (tokens.length <= index) throw new Error('Invalid expression: index out of bounds.');
		const operator = tokens[index];
		switch (operator) {
			case orSymb:
				if (tokens.length <= index+1 || tokens[index+1]!==leftSymb) throw new Error(`Invalid expression: index ${index+1}`);
				const orLeft = recurse(index+2);
				if (tokens.length <= orLeft[1] || tokens[orLeft[1]]!==commaSymb) throw new Error(`Invalid expression: index ${orLeft[1]}`);
				const orRight = recurse(orLeft[1]+1);
				if (tokens.length <= orRight[1] || tokens[orRight[1]]!==rightSymb) throw new Error(`Invalid expression: index ${orRight[1]}`);
				return [new OrExpression(orLeft[0], orRight[0]), orRight[1]+1];
			case andSymb:
				if (tokens.length <= index+1 || tokens[index+1]!==leftSymb) throw new Error(`Invalid expression: index ${index+1}`);
				const andLeft = recurse(index+2);
				if (tokens.length <= andLeft[1] || tokens[andLeft[1]]!==commaSymb) throw new Error(`Invalid expression: index ${andLeft[1]}`);
				const andRight = recurse(andLeft[1]+1);
				if (tokens.length <= andRight[1] || tokens[andRight[1]]!==rightSymb) throw new Error(`Invalid expression: index ${andRight[1]}`);
				return [new AndExpression(andLeft[0], andRight[0]), andRight[1]+1];
			case notSymb:
				if (tokens.length <= index+1 || tokens[index+1]!==leftSymb) throw new Error(`Invalid expression: index ${index+1}`);
				const notSub = recurse(index+2);
				if (tokens.length <= notSub[1] || tokens[notSub[1]]!==rightSymb) throw new Error(`Invalid expression: index ${notSub[1]}`);
				return [new NotExpression(notSub[0]), notSub[1]+1];
			case authorSymb:
				if (tokens.length <= index+1) throw new Error(`Invalid expression: index ${index+1}`);
				const authorUserId = tokens[index+1];
				return [new AuthorExpression(authorUserId), index+2];
			case tagSymb:
				if (tokens.length <= index+1) throw new Error(`Invalid expression: index ${index+1}`);
				const tagLabel = tokens[index+1];
				return [new TagExpression(tagLabel), index+2];
			default:
				throw new Error(`Invalid expression: index ${index}`);
		}
	}

	const output = recurse(0);
	if (output[1] !== tokens.length) {
		throw new Error(`Invalid expression: unexpected end index ${output[1]}.`);
	}

	return output[0];
}

// /**
//  * 
//  * @param input 
//  * @returns 
//  */
// export function parse(input: string): BooleanExpression {
// 	const operator = input[0];
// 	const labelRegex = /^\w+$/i;
// 	switch (operator) {
// 		case '|':
// 			if (!(input[1]==='(' && input[-1]===')')) throw new Error(`Missing expected parentheses.`);
// 			const orChildren = input.slice(2, -1).split(',');
// 			if (orChildren.length!==2) throw new Error(`Expected 2 children, got ${orChildren.toString()}.`);
// 			return new OrExpression(parse(orChildren[0]), parse(orChildren[1]));
// 		case '&':
// 			if (!(input[1]==='(' && input[-1]===')')) throw new Error(`Missing expected parentheses.`);
// 			const andChildren = input.slice(2, -1).split(',');
// 			if (andChildren.length!==2) throw new Error(`Expected 2 children, got ${andChildren.toString()}.`);
// 			return new AndExpression(parse(andChildren[0]), parse(andChildren[1]));
// 		case '!':
// 			if (!(input[1]==='(' && input[-1]===')')) throw new Error(`Missing expected parentheses.`);
// 			const notChild = input.slice(2, -1);
// 			return new NotExpression(parse(notChild));
// 		case '@':
// 			const userId = input.slice(1);
// 			if (!Types.ObjectId.isValid(userId)) throw new Error(`Invalid userId '${userId}'`);
// 			return new AuthorExpression(userId);
// 		case '#':
// 			const label = input.slice(1);
// 			if (!labelRegex.test(label)) throw new Error(`Invalid label '${label}'`);
// 			return new TagExpression(label);
// 		default:
// 			throw new Error(`Invalid operator '${operator}'.`);
// 	}
// }

// import { Parser, ParseTree, compile, visualizeAsUrl } from 'parserlib';
// import { BooleanExpression, AuthorExpression, TagExpression, NotExpression, AndExpression, OrExpression } from './BooleanExpression';

// // the grammar
// const grammar: string = `
// @skip whitespace {
//     expr ::= or;
//     or ::= and ('|' and)*;
//     and ::= not ('&' not)*;
//     not ::= '!'? primary;
//     primary ::= author | tag | '(' expr ')';
// }
// author ::= '@' \\w+;
// tag ::= '#' \\w+;
// whitespace ::= [ \\t\\r\\n]+;  // <-- note that backslashes must be escaped
// `;

// // the nonterminals of the grammar
// export enum BooleanGrammar {
//     Expr, Or, And, Not, Primary, Author, Tag, Whitespace
// }

// // compile the grammar into a parser
// export const parser: Parser<BooleanGrammar> = compile(grammar, BooleanGrammar, BooleanGrammar.Expr);

// /**
//  * Parse a string into an expression.
//  * 
//  * @param input string to parse
//  * @returns BooleanExpression parsed from the string
//  * @throws ParseError if the string doesn't match the BooleanExpression grammar
//  */
// export function parse(input: string): BooleanExpression {
//     // parse the example into a parse tree
//     const parseTree: ParseTree<BooleanGrammar> = parser.parse(input);
//     console.log("parse tree:\n" + parseTree);

//     // make an AST from the parse tree
//     const expression: BooleanExpression = makeAbstractSyntaxTree(parseTree);
//     console.log("abstract syntax tree:\n" + expression);
    
//     return expression;
// }

// /**
//  * Convert a parse tree into an abstract syntax tree.
//  * 
//  * @param parseTree constructed according to the BooleanExpression grammar
//  * @returns abstract syntax tree corresponding to parseTree
//  */
// function makeAbstractSyntaxTree(parseTree: ParseTree<BooleanGrammar>): BooleanExpression {
//     if (parseTree.name === BooleanGrammar.Expr) {
//         const child: ParseTree<BooleanGrammar>|undefined = parseTree.children[0];
//         if (!child) {
//             throw new Error('Expr node missing expected child');
//         }
//         return makeAbstractSyntaxTree(child);
        
//     } else if (parseTree.name === BooleanGrammar.Or) {
//         const children: Array<ParseTree<BooleanGrammar>> = parseTree.childrenByName(BooleanGrammar.And);
//         if (!children) {
//             throw new Error('Or node missing expected children');
//         }
//         const subexprs: Array<BooleanExpression> = children.map(makeAbstractSyntaxTree);
//         const expression: BooleanExpression = subexprs.length===1 ? subexprs[0] : subexprs.reduce((result, subexpr) => new OrExpression(result, subexpr));
//         return expression;
        
//     } else if (parseTree.name === BooleanGrammar.And) {
//         const children: Array<ParseTree<BooleanGrammar>> = parseTree.childrenByName(BooleanGrammar.Not);
//         if (!children) {
//             throw new Error('And node missing expected children');
//         }
//         const subexprs: Array<BooleanExpression> = children.map(makeAbstractSyntaxTree);
//         const expression: BooleanExpression = subexprs.length===1 ? subexprs[0] : subexprs.reduce((result, subexpr) => new OrExpression(result, subexpr));
//         return expression;
        
//     } else if (parseTree.name === BooleanGrammar.Not) {
//         const children: Array<ParseTree<BooleanGrammar>> = parseTree.childrenByName(BooleanGrammar.Not);
//         if (children.length!==1) {
//             throw new Error(`Not node expected 1 child, got ${children.length}`);
//         }
//         const subexpr: BooleanExpression = makeAbstractSyntaxTree(children[0]);
//         const expression: BooleanExpression = parseTree.text[0] !== '!' ? subexpr : new NotExpression(subexpr);
//         return expression;
        
//     } else if (parseTree.name === BooleanGrammar.Primary) {
//         const children: Array<ParseTree<BooleanGrammar>> = parseTree.children;
//         if (children.length !== 1) {
//             throw new Error('Primary node expected 1 child');
//         }
//         const child = children[0];
//         switch (child.name) {
//         case BooleanGrammar.Author:
//         case BooleanGrammar.Tag:
//         case BooleanGrammar.Expr:
//             return makeAbstractSyntaxTree(child);
//         default:
//             throw new Error(`Primary node unexpected child ${BooleanGrammar[child.name]}`);
//         }
        
//     } else if (parseTree.name === BooleanGrammar.Author) {
//         const userId: string = parseTree.text.toString().slice(1);
//         return new AuthorExpression(userId);
        
//     } else if (parseTree.name === BooleanGrammar.Tag) {
//         const label: string = parseTree.text.toString().slice(1);
//         return new TagExpression(label);
        
//     } else {
//         throw new Error(`cannot make AST for ${BooleanGrammar[parseTree.name]} node`);
//     }
// }

// function main() {
//     const input = "#dog&#cat";
//     const expression: BooleanExpression = parse(input);
//     expression.freetIds().then((freetIds) => {
//         console.log(freetIds);
//     });
// }

// if (require.main === module) {
//     main();
// }