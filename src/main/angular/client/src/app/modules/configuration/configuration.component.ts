import {Component, HostListener} from '@angular/core';
import {Router} from '@angular/router';

declare const $;

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html'
})
export class ConfigurationComponent {

  constructor(private router: Router) {
    router.events.subscribe((e: any) => {
      if (e.url && e.url.match('configuration')) {
        setTimeout(() => {
          this.calcHeight();
        }, 5);
      }
    });
  }

  calcHeight() {
    const dom = $('.scroll-y');
    let count = 0;
    if (dom && dom.position()) {
      const recursiveCheck = () => {
        ++count;
        let top = dom.position().top + 12;
        const flag = top < 78;
        top = top - $(window).scrollTop();
        if (top < 96) {
          top = 96;
        }
        if (this.router.url.split('/')[2] !== 'other') {
          $('.sticky').css('top', top + 2);
        } else {
            top = top + 40;
            $('.sticky').css('top', top);
        }
        const sidebar = $('#sidebar');
        if (sidebar) {
          sidebar.css('top', (top - 17));
          sidebar.height('calc(100vh - ' + (top - 19) + 'px' + ')');
        }
        const graph = $('#graph');
        if (graph) {
          graph.slimscroll({height: 'calc(100vh - ' + (top + 58) + 'px' + ')'});
        }
        if (this.router.url.match('inventory')) {
          top = top - 22;
        }
        $('.tree-block').height('calc(100vh - ' + (top + 24) + 'px' + ')');
        if (count < 5) {
          if (top < 170 && flag) {
            setTimeout(() => {
              recursiveCheck();
            }, 5);
          } else {
            let intval = setInterval(() => {
              recursiveCheck();
              clearInterval(intval);
            }, 100);
          }
        }

      };
      recursiveCheck();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calcHeight();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.calcHeight();
  }
}
