import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { JhiEventManager } from 'ng-jhipster';

import { EntityDetailDialogComponent } from '../entity-detail-dialog/entity-detail-dialog.component';
import { Spec } from '../shared/spec.model';
import { XmEntitySpec } from '../shared/xm-entity-spec.model';
import { XmEntitySpecService } from '../shared/xm-entity-spec.service';
import { XM_EVENT_LIST } from '../../xm.constants';

declare let swal: any;

@Component({
    selector: 'xm-entity-list-fab',
    templateUrl: './entity-list-fab.component.html',
    styleUrls: ['./entity-list-fab.component.scss']
})
export class EntityListFabComponent implements OnInit {

    @Input() xmEntitySpec: XmEntitySpec;
    @Input() spec: Spec;

    constructor(private xmEntitySpecService: XmEntitySpecService,
                private eventManager: JhiEventManager,
                private modalService: NgbModal,
                private translateService: TranslateService) {
    }

    ngOnInit() {
    }

    onRefresh() {
        this.eventManager.broadcast({name: XM_EVENT_LIST.XM_ENTITY_LIST_MODIFICATION});
    }

    onGenerateNew() {
        this.xmEntitySpecService.generateXmEntity(this.xmEntitySpec.key).toPromise().then(value => {
            this.eventManager.broadcast({name: XM_EVENT_LIST.XM_ENTITY_LIST_MODIFICATION});
            swal({
                title: 'New entity "' + value.body.name + '" generated!',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-success'
            });
            swal({
                type: 'success',
                text: this.translateService.instant('xm-entity.entity-list-fab.new-generated'),
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-primary'
            });
        });
    }

    onAddNew() {
        const modalRef = this.modalService.open(EntityDetailDialogComponent, {backdrop: 'static'});
        modalRef.componentInstance.xmEntitySpec = this.xmEntitySpec;
        modalRef.componentInstance.spec = this.spec;
        return modalRef;
    }

}
