import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { JhiHealthService } from './health.service';

@Component({
    selector: 'xm-health-modal',
    templateUrl: './health-modal.component.html'
})
export class JhiHealthModalComponent implements OnInit {

    currentHealth: any;
    aceEditorOptions: any = {
        highlightActiveLine: false,
        maxLines: 1000,
        printMargin: false,
        showGutter: false,
        autoScrollEditorIntoView: true
    };
    editorValue: string;

    constructor(public activeModal: NgbActiveModal,
                private healthService: JhiHealthService) {
    }

    ngOnInit() {
        this.editorValue = JSON.stringify(this.currentHealth, null, 4) || null;
    }

    baseName(name) {
        return this.healthService.getBaseName(name);
    }

    subSystemName(name) {
        return this.healthService.getSubSystemName(name);
    }

    readableValue(value: number) {
        if (this.currentHealth.name !== 'diskSpace') {
            return value.toString();
        }

        // Should display storage space in an human readable unit
        const val = value / 1073741824;
        if (val > 1) { // Value
            return val.toFixed(2) + ' GB';
        } else {
            return (value / 1048576).toFixed(2) + ' MB';
        }
    }
}
