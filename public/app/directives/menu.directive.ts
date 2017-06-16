/**
 * Created by aasheesh on 28/2/17.
 */

import { Directive, ElementRef, Renderer } from '@angular/core';

// Directive decorator
declare var jQuery: any;
@Directive({ selector: '[myMenu]' })
// Directive class
export class MenuDirective {
    constructor(el:ElementRef, renderer:Renderer) {
        // Use renderer to render the element with styles
        jQuery(document).ready(function () {
            var trigger = jQuery('.hamburger'),
                overlay = jQuery('.overlay'),
                isClosed = false;

            trigger.click(function () {
                hamburger_cross();
            });

            function hamburger_cross() {

                if (isClosed == true) {
                    overlay.hide();
                    trigger.removeClass('is-open');
                    trigger.addClass('is-closed');
                    isClosed = false;
                } else {
                    overlay.show();
                    trigger.removeClass('is-closed');
                    trigger.addClass('is-open');
                    isClosed = true;
                }
            }

            jQuery('[data-toggle="offcanvas"]').click(function () {
                jQuery('#wrapper').toggleClass('toggled');
            });
        });
    }
}
