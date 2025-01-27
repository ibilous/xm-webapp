import { Pipe, PipeTransform } from '@angular/core';
import { Spec, XmEntitySpecWrapperService } from '../../xm-entity';

@Pipe({name: 'xmEntityStateSpec'})
export class XmEntityStateSpecPipe implements PipeTransform {

    constructor(private xmEntitySpecWrapperService: XmEntitySpecWrapperService) {
    }

    transform(value: string, specKey: string, spec: Spec): any {
        const entitySpec = spec.types.filter(x => x.key === specKey).shift();
        const states = entitySpec.states;
        return states.filter(x => x.key === value).shift();
    }
}
