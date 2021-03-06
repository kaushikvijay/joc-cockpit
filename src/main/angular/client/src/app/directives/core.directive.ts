import { Directive, HostListener, forwardRef, OnInit, OnDestroy, ElementRef, AfterViewInit, Input, AfterViewChecked, OnChanges } from '@angular/core';
import {AbstractControl, NgModel, Validator, NG_VALIDATORS} from '@angular/forms';
import {SaveService} from '../services/save.service';
import {CoreService} from '../services/core.service';

declare const $;

@Directive({
  selector: '[timevalidator][ngModel]',
  providers: [NgModel]
})

export class TimeValidatorDirective implements OnInit {

  constructor(private model: NgModel) {
  }

  ngOnInit() {
    this.model.valueChanges.subscribe((event) => {
      if (event) {
        if (event.length === 2 && /^([0-2][0-9])?$/i.test(event)) {
          if (event >= 24) {
            this.model.valueAccessor.writeValue('24:00:00');
          } else {
            this.model.valueAccessor.writeValue(event + ':');
          }
        } else if (event.length === 5 && /^([0-2][0-9]):([0-5][0-9])?$/i.test(event)) {
          this.model.valueAccessor.writeValue(event + ':');
        } else {
          if (event.length > 1 && event.length < 3 && !(/^([0-2][0-9])?$/i.test(event))) {
            this.model.valueAccessor.writeValue('');
          } else if (event.length === 5 && !(/^([0-2][0-9]):([0-5][0-9])?$/i.test(event))) {
            this.model.valueAccessor.writeValue(event.substring(0, 3));
          } else if (event.length === 8 && !(/^([0-2][0-9]):([0-5][0-9]):([0-5][0-9])?$/i.test(event))) {
            this.model.valueAccessor.writeValue(event.substring(0, 6) + '00');
          }
        }
      }
    });
  }

  @HostListener('focusout', ['$event.target'])
  onFocusout(target) {
    if (target.value) {
      if (target.value.substring(0, 2) === 24) {
        this.model.valueAccessor.writeValue('24:00:00');
      } else {
        if (target.value.length === 1) {
          this.model.valueAccessor.writeValue('');

        } else if (target.value.length === 3) {
          this.model.valueAccessor.writeValue(target.value + '00');

        } else if (target.value.length === 4) {
          this.model.valueAccessor.writeValue(target.value + '0');

        } else if (target.value.length === 6) {
          this.model.valueAccessor.writeValue(target.value + '00');

        } else if (target.value.length === 7) {
          this.model.valueAccessor.writeValue(target.value + '0');

        }
      }
    }
  }
}


@Directive({
  selector: '[validateReqex][formControlName],[validateReqex][formControl],[validateReqex][ngModel]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => RegexValidator), multi: true}
  ]

})

export class RegexValidator implements Validator {

  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if ((!v || /^\s*$/i.test(v)
        || /^\s*[-](\d+)(h|d|w|M|y)\s*$/.test(v)
        || /^\s*(now\s*\-)\s*(\d+)\s*$/i.test(v)
        || /^\s*(now)\s*$/i.test(v)
        || /^\s*(Today)\s*$/i.test(v)
        || /^\s*(Yesterday)\s*$/i.test(v)
        || /^\s*[-](\d+)(h|d|w|M|y)\s*to\s*[-](\d+)(h|d|w|M|y)\s*$/.test(v)
        || /^\s*[-](\d+)(h|d|w|M|y)\s*to\s*[-](\d+)(h|d|w|M|y)\s*[-](\d+)(h|d|w|M|y)\s*$/.test(v)
        || /^\s*[-](\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*[-](\d+)(h|d|w|M|y)\s*$/.test(v)
        || /^\s*[-](\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*[-](\d+)(h|d|w|M|y)\s*[-,+]\s*(\d+)(h|d|w|M|y)\s*$/.test(v)
        || /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(v)
      )) {
        return null;
      }
    }
    return {
      validateReqex: true
    };

  }
}

@Directive({
  selector: '[validateDailyPlanReqex][formControlName],[validateDailyPlanReqex][formControl],[validateDailyPlanReqex][ngModel]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => DailyPlanRegexValidator), multi: true}
  ]

})

export class DailyPlanRegexValidator implements Validator {

  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (/^\s*$/i.test(v)
        || /^\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(v)
        || /^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(v)
        || /^\s*(now)\s*$/i.test(v)
        || /^\s*(Today)\s*$/i.test(v)
        || /^\s*[-,+](\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(v)
      ) {
        return null;
      }
    }

    return {
      validateDailyPlanReqex: true
    };
  }
}

@Directive({
  selector: '[validateNumberArrayReqex][formControlName],[validateNumberArrayReqex][formControl],[validateNumberArrayReqex][ngModel]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => NumberArrayRegexValidator), multi: true}
  ]

})

export class NumberArrayRegexValidator implements Validator {

  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null && typeof v == 'string' && v !== 'null' && v != 'undefined') {
      // remove extra space if its there
      v = v.replace(/\s*/g, '');
      if (v == '') {
        return null;
      }
      if (/^(\d{1,3})(,\d{1,3})*(\d)?$/g.test(v)) {
        return null;
      }
    } else {
      return null;
    }

    return {
      validateNumberArrayReqex: true
    };
  }
}

@Directive({
  selector: '[validateDurtionReqex][formControlName],[validateDurtionReqex][formControl],[validateDurtionReqex][ngModel]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => DurationRegexValidator), multi: true}
  ]

})

export class DurationRegexValidator implements Validator {

  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if(v ==''){
        return null;
      }
      if (/^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/i.test(v) ||
        /^((\d+)y[ ]?)?((\d+)m[ ]?)?((\d+)w[ ]?)?((\d+)d[ ]?)?((\d+)h[ ]?)?((\d+)M[ ]?)?((\d+)s[ ]?)?|(\d{2}:\d{2}:\d{2})\s*$/.test(v)
      ) {
        return null;
      }
    } else {
      return null;
    }

    return {
      validateDurtionReqex: true
    };
  }
}

@Directive({
  selector: '[identifierValidation][formControlName],[identifierValidation][formControl],[identifierValidation][ngModel]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => IdentifierValidator), multi: true}
  ]

})

export class IdentifierValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }
      if (/^([A-Z]|[a-z]|_|\$)([A-Z]|[a-z]|[0-9]|\$|_)*$/.test(v)) {
        if (/^(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|double|do|else|enum|extends|false|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)$/.test(v)) {
          return {
            identifierValidation: true
          };
        } else {
          return null;
        }
      } else {
        return {
          identifierValidation: true
        };
      }
    } else {
      return null;
    }
  }
}

@Directive({
  selector: '[appResizable]'
})
export class ResizableDirective implements OnInit {
  @Input() height: string;
  @Input() type: string;
  @Input() path: string;
  @Input() sideView: any;

  constructor(private el: ElementRef, private saveService: SaveService) {
  }

  ngOnInit() {
    let dom: any;
    if (this.el.nativeElement.attributes.class.value.match('resizable')) {
      dom = $('#' + this.el.nativeElement.attributes.id.value);
      if (dom) {
        if (this.height) {
          dom.css('height', this.height + 'px');
        }
        dom.resizable({
          minHeight: 150,
          handles: 's',
          resize: (e, x) => {
            let rsHt = JSON.parse(this.saveService.resizerHeight) || {};
            if (rsHt[this.type] && typeof rsHt[this.type] === 'object') {
              rsHt[this.type][this.path] = x.size.height;
            } else {
              rsHt[this.type] = {};
            }
            rsHt[this.type][this.path] = x.size.height;
            this.saveService.setResizerHeight(rsHt);
            this.saveService.save();
          }
        });
      }
    } else if (this.el.nativeElement.attributes.class.value.match('sidebar-property-panel')) {
      dom = $('#property-panel');
      if (dom) {
        dom.resizable({
          minWidth: 22,
          handles: 'w',
          resize: (e, x) => {
            const wt = x.size.width;
            $('#outlineContainer').css({'right': wt + 10 + 'px'});
            $('.graph-container').css({'margin-right': wt + 'px'});
            $('.toolbar').css({'margin-right': (wt - 12) + 'px'});
            $('.sidebar-close').css({'right': wt + 'px'});
            localStorage.propertyPanelWidth = wt;
          }
        });
      }
    } else {
      dom = $('#' + this.el.nativeElement.attributes.id.value);
      if (dom) {
        dom.css('top', '191px');
        if (this.sideView && this.sideView.width) {
          dom.css('width', this.sideView.width + 'px');
          $('#rightPanel').css({'margin-left': this.sideView.width + 18 + 'px'});
        }
        dom.resizable({
          handles: 'e',
          minWidth: 22,
          resize: (e, x) => {
            let wt = dom.width();
            $('#rightPanel').css({'margin-left': wt + 18 + 'px'});
            if (this.sideView) {
              this.sideView.width = wt;
            }
          }
        });
      }
    }
  }
}

@Directive({
  selector: '[appAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {

  constructor(private el: ElementRef) {

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 0);
  }
}

@Directive({
  selector: '[xmlAutofocus]'
})
export class XMLAutofocusDirective implements AfterViewInit, OnChanges {
  @Input() name;
  constructor(private el: ElementRef) {

  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.name.node) {
        if (this.name.type === 'attribute' && this.name.node) {
          if (this.name.errorName && this.name.errorName.e === this.name.node.name) {
            this.el.nativeElement.focus();
          } else if (((this.name.errorName && this.name.errorName.e !== this.name.node.ref) || !this.name.errorName) && this.name.pos == 0) {
            this.el.nativeElement.focus();
          }
        } else if (this.name.type === 'value' && this.name.node) {
          if (this.name.errorName && this.name.errorName.e === this.name.node.ref) {
            this.el.nativeElement.focus();
          } else if (this.name.node && !this.name.node.attributes) {
            this.el.nativeElement.focus();
          }
        }
      }
    }, 0);
  }

  ngOnChanges() {
    setTimeout(() => {
      if (this.name.node) {
        if (this.name.type === 'attribute' && this.name.node) {
          if (this.name.errorName && this.name.errorName.e === this.name.node.name) {
            this.el.nativeElement.focus();
          } else if (((this.name.errorName && this.name.errorName.e !== this.name.node.ref) || !this.name.errorName) && this.name.pos == 0) {
            this.el.nativeElement.focus();
          }
        } else if (this.name.type === 'value' && this.name.node) {
          if (this.name.errorName && this.name.errorName.e === this.name.node.ref) {
            this.el.nativeElement.focus();
          } else if (this.name.node && !this.name.node.attributes) {
            this.el.nativeElement.focus();
          }
        }
      }
    }, 0);
  }
}
