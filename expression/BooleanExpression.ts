import type {Types} from 'mongoose';
import mongoose from 'mongoose';
import FreetCollection from '../freet/collection';
import TagCollection from '../tag/collection';

/** Immutable type representing a boolean expression. */
export interface BooleanExpression {
    // Data type definition
    //    BooleanExpression = AuthorExpression(userId:string)
    //                        + TagExpression(label:string)
	//                        + NotExpression(sub:BooleanExpression)
    //                        + AndExpression(left:BooleanExpression, right:BooleanExpression)
    //                        + OrExpression(left:BooleanExpression, right:BooleanExpression)

    /** @returns the freetIds matching the expression */
    freetIds(): Promise<Array<Types.ObjectId>>;
    toString(): string;
}

export class AuthorExpression implements BooleanExpression {
    /** Make a AuthorExpression. */
    public constructor(private readonly userId: string) {
    }
    
    public async freetIds(): Promise<Array<Types.ObjectId>> {
        return (await FreetCollection.findAllByUserId(this.userId)).map((freet) => freet._id);
    }
    
    public toString(): string {
        return "AuthorExpression(" + this.userId + ")";
    }
}

export class TagExpression implements BooleanExpression {
    /** Make a TagExpression. */
    public constructor(private readonly label: string) {
    }
    
    public async freetIds(): Promise<Array<Types.ObjectId>> {
        return (await TagCollection.findOne(this.label)).freetIds;
    }
    
    public toString(): string {
        return "TagExpression(" + this.label + ")";
    }
}

export class NotExpression implements BooleanExpression {
    /** Make a NotExpression. */
    public constructor(private readonly sub: BooleanExpression) {
    }
    
    public async freetIds(): Promise<Array<Types.ObjectId>> {
        const allFreetIds = (await FreetCollection.findAll()).map((freet) => freet._id.toString());
        const subFreetIds = new Set((await this.sub.freetIds()).map((freetId) => freetId.toString()));
        const notFreetIds = allFreetIds.filter((freetId) => !subFreetIds.has(freetId));
        return [...notFreetIds].map((freetId) => new mongoose.Types.ObjectId(freetId));
    }
    
    public toString(): string {
        return "NotExpression(" + this.sub.toString() + ")";
    }
}

export class AndExpression implements BooleanExpression {
    /** Make a AndExpression. */
    public constructor(private readonly left: BooleanExpression,
                       private readonly right: BooleanExpression) {
    }
    
    public async freetIds(): Promise<Types.ObjectId[]> {
        const leftFreetIds = (await this.left.freetIds()).map((freetId) => freetId.toString());
        const rightFreetIds = new Set((await this.right.freetIds()).map((freetId) => freetId.toString()));
        const andFreetIds = leftFreetIds.filter((freetId) => rightFreetIds.has(freetId));
        return [...andFreetIds].map((freetId) => new mongoose.Types.ObjectId(freetId));
    }
    
    public toString(): string {
        return "AndExpression(" + this.left.toString() + "," + this.right.toString() + ")";
    }
}

export class OrExpression implements BooleanExpression {
    /** Make a OrExpression. */
    public constructor(private readonly left: BooleanExpression,
                       private readonly right: BooleanExpression) {
    }
    
    public async freetIds(): Promise<Types.ObjectId[]> {
        const leftFreetIds = (await this.left.freetIds()).map((freetId) => freetId.toString());
        const rightFreetIds = new Set((await this.right.freetIds()).map((freetId) => freetId.toString()));
        const andFreetIds = new Set([...leftFreetIds, ...rightFreetIds]);
        return [...andFreetIds].map((freetId) => new mongoose.Types.ObjectId(freetId));
    }
    
    public toString(): string {
        return "OrExpression(" + this.left.toString() + "," + this.right.toString() + ")";
    }
}