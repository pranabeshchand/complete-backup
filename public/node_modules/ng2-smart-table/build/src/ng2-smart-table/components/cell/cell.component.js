"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var ng2_completer_1 = require('ng2-completer');
var cell_1 = require('../../lib/data-set/cell');
var CellComponent = (function () {
    function CellComponent(completerService) {
        this.completerService = completerService;
        this.inputClass = '';
        this.mode = 'inline';
        this.isInEditing = false;
        this.edited = new core_1.EventEmitter();
        this.completerStr = '';
    }
    CellComponent.prototype.ngOnInit = function () {
        if (this.cell.getColumn().type === 'completer') {
            var config = this.cell.getColumn().getConfig().completer;
            config.dataService = this.completerService.local(config.data, config.searchFields, config.titleField);
            config.dataService.descriptionField(config.descriptionField);
        }
    };
    CellComponent.prototype.onStopEditing = function () {
        this.cell.getRow().isInEditing = false;
        this.cancelEdit();
        return false;
    };
    CellComponent.prototype.cancelEdit = function () {
        this.renderCustomValue();
    };
    CellComponent.prototype.ngOnChanges = function (changes) {
        var _this = this;
        setTimeout(function () { return _this.renderCustomValue(); });
    };
    CellComponent.prototype.ngAfterViewInit = function () {
        this.renderCustomValue();
    };
    CellComponent.prototype.onEdited = function (event) {
        this.edited.emit(event);
        return false;
    };
    CellComponent.prototype.onEditedCompleter = function (event) {
        this.cell.newValue = event.title;
        return false;
    };
    CellComponent.prototype.onClick = function (event) {
        event.stopPropagation();
    };
    CellComponent.prototype.renderCustomValue = function () {
        var cellRenderFunc = this.cell.getColumn().getCellRenderFunction();
        if (cellRenderFunc && this.cellRef) {
            cellRenderFunc.call(null, this.cell, this.cellRef.nativeElement);
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', cell_1.Cell)
    ], CellComponent.prototype, "cell", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], CellComponent.prototype, "inputClass", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], CellComponent.prototype, "mode", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], CellComponent.prototype, "isInEditing", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], CellComponent.prototype, "edited", void 0);
    __decorate([
        core_1.ViewChild('cellContainer'), 
        __metadata('design:type', core_1.ElementRef)
    ], CellComponent.prototype, "cellRef", void 0);
    CellComponent = __decorate([
        core_1.Component({
            selector: 'ng2-smart-table-cell',
            styles: [require('./cell.scss')],
            template: require('./cell.component.html')
        }), 
        __metadata('design:paramtypes', [ng2_completer_1.CompleterService])
    ], CellComponent);
    return CellComponent;
}());
exports.CellComponent = CellComponent;
