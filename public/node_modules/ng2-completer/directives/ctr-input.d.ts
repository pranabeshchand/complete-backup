import { EventEmitter } from "@angular/core";
import { CtrCompleter } from "./ctr-completer";
export declare class CtrInput {
    private completer;
    clearSelected: boolean;
    overrideSuggested: boolean;
    ngModelChange: EventEmitter<any>;
    private _searchStr;
    private _displayStr;
    private _selectedItem;
    constructor(completer: CtrCompleter);
    onInputChange(event: any): void;
    keyupHandler(event: any): void;
    keydownHandler(event: any): void;
    onBlur(event: any): void;
    searchStr: string;
}
