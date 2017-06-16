import { OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { CtrCompleter, CompleterList } from "./ctr-completer";
import { CompleterData } from "../components/ng2-completer/services/completer-data";
import { CompleterItem } from "../components/ng2-completer/completer-item";
export declare class CtrListContext {
    results: CompleterItem[];
    searching: boolean;
    searchInitialized: boolean;
    constructor(results: CompleterItem[], searching: boolean, searchInitialized: boolean);
}
export declare class CtrList implements OnInit, CompleterList {
    private completer;
    private templateRef;
    private viewContainer;
    ctrListMinSearchLength: number;
    ctrListPause: number;
    ctrListAutoMatch: boolean;
    private _dataService;
    private term;
    private searchTimer;
    private ctx;
    constructor(completer: CtrCompleter, templateRef: TemplateRef<CtrListContext>, viewContainer: ViewContainerRef);
    ngOnInit(): void;
    dataService: CompleterData;
    search(term: string): void;
    clear(): void;
    private searchTimerComplete(term);
    private handleError(error);
    private refreshTemplate();
}
