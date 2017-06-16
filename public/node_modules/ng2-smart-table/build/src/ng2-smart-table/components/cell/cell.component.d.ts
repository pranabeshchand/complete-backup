import { EventEmitter, ElementRef } from '@angular/core';
import { CompleterService } from 'ng2-completer';
import { Cell } from '../../lib/data-set/cell';
export declare class CellComponent {
    private completerService;
    cell: Cell;
    inputClass: string;
    mode: string;
    isInEditing: boolean;
    edited: EventEmitter<any>;
    cellRef: ElementRef;
    completerStr: string;
    constructor(completerService: CompleterService);
    ngOnInit(): void;
    onStopEditing(): boolean;
    cancelEdit(): void;
    ngOnChanges(changes: any): void;
    ngAfterViewInit(): void;
    onEdited(event: any): boolean;
    onEditedCompleter(event: any): boolean;
    onClick(event: any): void;
    protected renderCustomValue(): void;
}
