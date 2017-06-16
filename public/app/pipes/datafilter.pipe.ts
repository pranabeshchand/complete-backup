import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "dataFilter"
})
export class DataFilterPipe implements PipeTransform {

    transform(array: any[], query: string): any {
        var searchText = query;
        if(query) {
            searchText = query.toLowerCase();
        } else {
            searchText = "";
        }
        if(array) {
            if(array[0] && array[0].csvAttribute) {
                return array.filter(item => item.csvAttribute.toLowerCase().indexOf(searchText) !== -1);
            } else if(array[0] && array[0].label) {
                return array.filter(item => item.label.toLowerCase().indexOf(searchText) !== -1 || item.name.toLowerCase().indexOf(searchText) !== -1);
            } else {
                for(let j = 0; j < array.length; j++) {
                    if(array[j].list) {
                        for(let k = 0; k < array[j].list.length; k++) {
                            if(array[j].list[k].name.toLowerCase().indexOf(searchText) == -1 && array[j].list[k].label.toLowerCase().indexOf(searchText) == -1) {
                                array[j].list[k].isVisible = 'false';
                            } else {
                                array[j].list[k].isVisible = 'true'
                            }
                        }
                    }
                }
            }
            return array;
        }
    }
}
